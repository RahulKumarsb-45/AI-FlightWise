const app = require('./app');
const config = require('./config/env');
const logger = require('./logger/logger');
const { pool } = require('./database/pool');

let server;
let shuttingDown = false;

async function start() {
  server = app.listen(config.port, () => {
    logger.info(`Server listening`, { port: config.port, env: config.nodeEnv });
  });
}

/**
 * Drains in-flight requests, then closes the Postgres pool, so a
 * deploy/restart (SIGTERM from most PaaS platforms, SIGINT from Ctrl+C locally)
 * doesn't cut connections out from under a request that's still running.
 */
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out after 10s, forcing exit');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await pool.end();
    logger.info('Shutdown complete');
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', { error: err.message });
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
