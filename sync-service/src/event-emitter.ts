/**
 * Event transformation and emission logic
 */

import { FileChangeEvent, SupabaseEvent, EventType } from './types';
import { insertEvent } from './supabase-client';

/**
 * Transform a file change event into Supabase events
 */
export function transformToSupabaseEvents(fileEvent: FileChangeEvent): SupabaseEvent[] {
  const events: SupabaseEvent[] = [];
  const timestamp = new Date().toISOString();
  
  if (fileEvent.type === 'system_state') {
    // System state changed
    events.push({
      event_type: 'system_state_updated',
      agent: null,
      data: {
        timestamp,
        changes: fileEvent.content,
        path: fileEvent.path,
      },
    });
  } else if (fileEvent.type === 'agent_task') {
    // Agent task changed
    const agentName = fileEvent.agent || 'unknown';
    const taskData = fileEvent.content;
    
    events.push({
      event_type: 'agent_status_changed',
      agent: agentName,
      data: {
        timestamp,
        status: taskData.status,
        role: taskData.role,
        task: taskData.task,
        lastUpdated: taskData.lastUpdated,
        path: fileEvent.path,
        assignedBy: taskData.assigned_by,
        skills: taskData.skills,
      },
    });
  }
  
  return events;
}

/**
 * Create a sync started event
 */
export function createSyncStartedEvent(): SupabaseEvent {
  return {
    event_type: 'sync_started',
    agent: 'system',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

/**
 * Create a sync error event
 */
export function createSyncErrorEvent(error: string, context?: Record<string, any>): SupabaseEvent {
  return {
    event_type: 'sync_error',
    agent: 'system',
    data: {
      timestamp: new Date().toISOString(),
      error,
      context,
    },
  };
}

/**
 * Create a command executed event
 */
export function createCommandEvent(
  commandType: string,
  success: boolean,
  result?: any
): SupabaseEvent {
  return {
    event_type: 'command_executed',
    agent: 'system',
    data: {
      timestamp: new Date().toISOString(),
      commandType,
      success,
      result,
    },
  };
}

/**
 * Emit events to Supabase
 */
export async function emitEvents(events: SupabaseEvent[]): Promise<{ success: boolean; failedCount: number }> {
  let failedCount = 0;
  
  for (const event of events) {
    const result = await insertEvent(event);
    if (!result.success) {
      failedCount++;
      console.error('[EventEmitter] Failed to emit event:', event.event_type, result.error);
    } else {
      console.log('[EventEmitter] Emitted event:', event.event_type, event.agent || 'system');
    }
  }
  
  return {
    success: failedCount === 0,
    failedCount,
  };
}

/**
 * Sync agent status to Supabase agents table
 */
export async function syncAgentToSupabase(agentId: string, agentData: any): Promise<void> {
  const { getSupabase } = await import('./supabase-client');
  const supabase = getSupabase();
  
  try {
    const agentRecord = {
      id: agentId,
      name: agentData.agent?.charAt(0).toUpperCase() + agentData.agent?.slice(1) || agentId,
      role: agentData.role || 'Agent',
      model: agentData.model || 'unknown',
      status: agentData.status || 'offline',
      current_task: agentData.task || null,
      last_activity: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('agents')
      .upsert([agentRecord], { onConflict: 'id' });
    
    if (error) {
      console.error('[EventEmitter] Error syncing agent:', error.message);
    } else {
      console.log('[EventEmitter] Synced agent:', agentId, '-', agentData.status);
    }
  } catch (err) {
    console.error('[EventEmitter] Exception syncing agent:', err);
  }
}

/**
 * Process a file change and emit appropriate events
 */
export async function processFileChange(fileEvent: FileChangeEvent): Promise<void> {
  console.log('[EventEmitter] Processing file change:', fileEvent.type, fileEvent.agent || 'system');
  
  const events = transformToSupabaseEvents(fileEvent);
  await emitEvents(events);
  
  // Also sync agent to agents table
  if (fileEvent.type === 'agent_task' && fileEvent.agent) {
    await syncAgentToSupabase(fileEvent.agent, fileEvent.content);
  }
}