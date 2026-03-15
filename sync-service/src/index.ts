/**
 * OpenClaw Sync Service Entry Point
 * 
 * This service bridges OpenClaw state to Supabase in real-time:
 * - Watches OpenClaw files for changes
 * - Pushes events to Supabase
 * - Polls for commands and executes them
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { startService, stopService } from './sync-service';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Also try loading from current directory
dotenv.config();

// Setup shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n[index] Received SIGINT, shutting down...');
  await stopService();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[index] Received SIGTERM, shutting down...');
  await stopService();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[index] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[index] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the service
console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           OpenClaw Mission Control Sync Service           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

startService().catch((error) => {
  console.error('[index] Failed to start service:', error);
  process.exit(1);
});