const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';

const testEnvPath = path.join(__dirname, '..', '.env.test');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
} else {
  dotenv.config(); // falls back to .env — fine for local dev, CI should provide .env.test
}

// In test environment, provide dummy credentials if unset or empty in .env
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_key_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_dummy_webhook_secret';
