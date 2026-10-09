require('dotenv').config();
const { startBot } = require('./src/bot');
const { startHealthServer } = require('./src/health');
const { prisma } = require('./src/database');
const { startJobs, stopJobs } = require('./src/jobs/scheduler');
const { validateConfig } = require('./src/config');

async function main() {
  validateConfig();
  await prisma.$connect();
  console.log('[startup] PostgreSQL connected');
  startHealthServer();
  await startBot();
  startJobs();
  console.log('[startup] Imam Al-Jazari bot is running');
}

async function shutdown(signal) {
  console.log(`[shutdown] ${signal} received`);
  stopJobs();
  try { await require('./src/bot').stopBot(); } catch (e) { console.error('[shutdown] bot stop:', e.message); }
  try { await prisma.$disconnect(); } catch (e) { console.error('[shutdown] db disconnect:', e.message); }
  process.exit(0);
}
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
main().catch(async (err) => {
  console.error('[fatal] Startup failed:', err.message);
  try { await prisma.$disconnect(); } catch (_) {}
  process.exit(1);
});
