/**
 * Main sync service that coordinates file watching, event emission, and command processing
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { initSupabase, fetchPendingCommands } from './supabase-client';
import { startWatcher, stopWatcher } from './file-watcher';
import { processFileChange, emitEvents, createSyncStartedEvent, createSyncErrorEvent } from './event-emitter';
import { processCommands } from './command-handler';
import { SyncConfig } from './types';

// Default configuration
const DEFAULT_CONFIG: Partial<SyncConfig> = {
  pollIntervalMs: 2000,
  debounceMs: 500,
};

let pollInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Load configuration from environment
 */
function loadConfig(): SyncConfig {
  const homeDir = process.env.OPENCLAW_HOME || '~/.openclaw';
  
  return {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '',
    openclawHome: homeDir.startsWith('~') ? path.join(os.homedir(), homeDir.slice(2)) : homeDir,
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || String(DEFAULT_CONFIG.pollIntervalMs), 10),
    debounceMs: parseInt(process.env.DEBOUNCE_MS || String(DEFAULT_CONFIG.debounceMs), 10),
  };
}

/**
 * Ensure OpenClaw directory structure exists
 */
function ensureOpenClawStructure(openclawHome: string): void {
  const dirs = [
    openclawHome,
    path.join(openclawHome, 'workspace'),
    path.join(openclawHome, 'agents'),
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('[SyncService] Created directory:', dir);
    }
  }
  
  // Ensure state.json exists
  const statePath = path.join(openclawHome, 'workspace', 'state.json');
  if (!fs.existsSync(statePath)) {
    const initialState = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      projects: [],
      agents: {},
    };
    fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
    console.log('[SyncService] Created initial state.json');
  }
}

/**
 * Start the command polling loop
 */
function startPolling(intervalMs: number): void {
  console.log(`[SyncService] Starting command polling (interval: ${intervalMs}ms)`);
  
  pollInterval = setInterval(async () => {
    if (!isRunning) return;
    
    try {
      const commands = await fetchPendingCommands();
      if (commands.length > 0) {
        console.log(`[SyncService] Processing ${commands.length} pending command(s)`);
        await processCommands(commands);
      }
    } catch (err) {
      console.error('[SyncService] Polling error:', err);
    }
  }, intervalMs);
}

/**
 * Stop the command polling loop
 */
function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

/**
 * Start the sync service
 */
export async function startService(): Promise<void> {
  if (isRunning) {
    console.log('[SyncService] Service already running');
    return;
  }
  
  console.log('[SyncService] Starting OpenClaw Sync Service...');
  
  // Load configuration
  const config = loadConfig();
  
  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('[SyncService] Missing Supabase credentials');
    console.error('  Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
    process.exit(1);
  }
  
  // Set environment for other modules
  process.env.OPENCLAW_HOME = config.openclawHome;
  process.env.DEBOUNCE_MS = String(config.debounceMs);
  
  console.log('[SyncService] Configuration:');
  console.log(`  OpenClaw Home: ${config.openclawHome}`);
  console.log(`  Supabase URL: ${config.supabaseUrl}`);
  console.log(`  Poll Interval: ${config.pollIntervalMs}ms`);
  console.log(`  Debounce: ${config.debounceMs}ms`);
  
  // Ensure directory structure
  ensureOpenClawStructure(config.openclawHome);
  
  // Initialize Supabase
  try {
    initSupabase(config.supabaseUrl, config.supabaseKey);
    console.log('[SyncService] Supabase client initialized');
  } catch (err) {
    console.error('[SyncService] Failed to initialize Supabase:', err);
    process.exit(1);
  }
  
  // Emit sync started event
  await emitEvents([createSyncStartedEvent()]);
  
  // Start file watcher
  startWatcher(async (fileEvent) => {
    try {
      await processFileChange(fileEvent);
    } catch (err) {
      console.error('[SyncService] Error processing file change:', err);
      await emitEvents([createSyncErrorEvent(String(err), { path: fileEvent.path })]);
    }
  });
  
  // Start command polling
  startPolling(config.pollIntervalMs);
  
  isRunning = true;
  console.log('[SyncService] ✅ Service started successfully');
  console.log('[SyncService] Watching for file changes and polling for commands...');
}

/**
 * Stop the sync service
 */
export async function stopService(): Promise<void> {
  if (!isRunning) {
    return;
  }
  
  console.log('[SyncService] Stopping service...');
  
  isRunning = false;
  stopPolling();
  stopWatcher();
  
  console.log('[SyncService] Service stopped');
}

/**
 * Handle shutdown signals
 */
function setupShutdownHandlers(): void {
  const shutdown = async () => {
    console.log('\n[SyncService] Received shutdown signal');
    await stopService();
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Export for programmatic use
export { loadConfig, ensureOpenClawStructure };