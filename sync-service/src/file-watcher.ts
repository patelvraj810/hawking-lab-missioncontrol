/**
 * File watcher using chokidar to monitor OpenClaw files
 */

import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileChangeEvent } from './types';

type FileChangeCallback = (event: FileChangeEvent) => void;

let watcher: chokidar.FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
let pendingEvents: FileChangeEvent[] = [];

/**
 * Expand tilde in file paths
 */
function expandTilde(filePath: string): string {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Get the OpenClaw home directory
 */
function getOpenClawHome(): string {
  return expandTilde(process.env.OPENCLAW_HOME || '~/.openclaw');
}

/**
 * Parse a file and determine its type
 */
function parseFile(filePath: string): { type: 'agent_task' | 'system_state'; agent?: string; content: any } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    
    const home = getOpenClawHome();
    const relativePath = path.relative(home, filePath);
    
    // Check if it's a system state file
    if (relativePath === 'workspace/state.json' || filePath.endsWith('/workspace/state.json')) {
      return { type: 'system_state', content: parsed };
    }
    
    // Check if it's an agent task file
    const agentMatch = relativePath.match(/^agents\/([^/]+)\/task\.json$/);
    if (agentMatch) {
      return { type: 'agent_task', agent: agentMatch[1], content: parsed };
    }
    
    return null;
  } catch (err) {
    console.error(`[FileWatcher] Error parsing file ${filePath}:`, err);
    return null;
  }
}

/**
 * Process pending events with debounce
 */
function processPendingEvents(callback: FileChangeCallback): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    const events = [...pendingEvents];
    pendingEvents = [];
    
    for (const event of events) {
      callback(event);
    }
  }, parseInt(process.env.DEBOUNCE_MS || '500', 10));
}

/**
 * Start watching OpenClaw files
 */
export function startWatcher(callback: FileChangeCallback): chokidar.FSWatcher {
  const home = getOpenClawHome();
  
  // Define watch paths
  const watchPaths = [
    path.join(home, 'workspace', 'state.json'),
    path.join(home, 'agents', '*', 'task.json'),
  ];
  
  console.log('[FileWatcher] Starting watcher for paths:');
  watchPaths.forEach(p => console.log(`  - ${p}`));
  
  watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: false, // Process initial files
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 10,
    },
  });
  
  watcher
    .on('add', (filePath: string) => {
      const parsed = parseFile(filePath);
      if (parsed) {
        pendingEvents.push({
          path: filePath,
          type: parsed.type,
          agent: parsed.agent,
          content: parsed.content,
        });
        processPendingEvents(callback);
      }
    })
    .on('change', (filePath: string) => {
      const parsed = parseFile(filePath);
      if (parsed) {
        pendingEvents.push({
          path: filePath,
          type: parsed.type,
          agent: parsed.agent,
          content: parsed.content,
        });
        processPendingEvents(callback);
      }
    })
    .on('error', (error: Error) => {
      console.error('[FileWatcher] Watcher error:', error);
    });
  
  return watcher;
}

/**
 * Stop the file watcher
 */
export function stopWatcher(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  
  pendingEvents = [];
}