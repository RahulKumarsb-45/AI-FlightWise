const paymentService = require('../services/paymentService');
const logger = require('../logger/logger');
const { trackEvent } = require('../services/analyticsService');

async function createOrder(req, res, next) {
  try {
    const { plan } = req.body;
    const order = await paymentService.createOrder({ userId: req.user.id, plan });
    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const subscription = await paymentService.verifyAndCapturePayment({
      userId: req.user.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    try {
      await trackEvent({
        eventName: 'payment_verified',
        userId: req.user.id,
        sessionId: req.headers['x-session-id'] || `sess_${req.user.id}`,
        properties: { plan: subscription?.plan, orderId: razorpayOrderId, paymentId: razorpayPaymentId },
        idempotencyKey: `pay_${razorpayPaymentId}`,
      });
    } catch (trackErr) {
      logger.warn('Failed to record payment_verified analytics event', { error: trackErr.message });
    }

    res.status(200).json({ status: 'success', data: { subscription } });
  } catch (err) {
    next(err);
  }
}

/**
 * Razorpay webhook — NOT behind requireAuth (Razorpay's servers call this,
 * not a logged-in browser). Authenticity instead comes from verifying the
 * signature header against RAZORPAY_WEBHOOK_SECRET.
 */
async function webhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];

  if (!paymentService.isValidWebhookSignature(req.rawBody, signature)) {
    logger.warn('Rejected webhook with invalid signature');
    return res.status(400).json({ status: 'error', message: 'Invalid signature' });
  }

  try {
    if (req.body.event === 'payment.captured') {
      await paymentService.handleWebhookPaymentCaptured(req.body);
    }
  } catch (err) {
    logger.error('Webhook processing failed', { error: err.message, event: req.body.event });
  }

  res.status(200).json({ status: 'success' });
}

module.exports = { createOrder, verifyPayment, webhook };
