/**
 * Supabase client wrapper for the sync service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseEvent, SupabaseCommand, EventsTable, CommandsTable } from './types';

let client: SupabaseClient | null = null;

/**
 * Initialize the Supabase client
 */
export function initSupabase(url: string, key: string): SupabaseClient {
  if (client) {
    return client;
  }
  
  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  return client;
}

/**
 * Get the initialized Supabase client
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error('Supabase client not initialized. Call initSupabase first.');
  }
  return client;
}

/**
 * Insert an event into the events table
 */
export async function insertEvent(event: SupabaseEvent): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const { error } = await supabase
      .from('events')
      .insert({
        event_type: event.event_type,
        agent: event.agent || null,
        project_id: event.project_id || null,
        task_id: event.task_id || null,
        data: event.data,
        timestamp: new Date().toISOString(),
      });
    
    if (error) {
      console.error('[Supabase] Error inserting event:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Supabase] Exception inserting event:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch pending commands from the commands table
 */
export async function fetchPendingCommands(): Promise<SupabaseCommand[]> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (error) {
      console.error('[Supabase] Error fetching commands:', error.message);
      return [];
    }
    
    return (data as CommandsTable[])?.map(cmd => ({
      id: cmd.id,
      created_at: cmd.created_at,
      command: cmd.command,
      status: cmd.status as SupabaseCommand['status'],
      payload: cmd.payload as Record<string, any> | null,
      result: cmd.result as Record<string, any> | null,
      issued_by: cmd.issued_by,
      executed_at: cmd.executed_at || undefined,
    })) || [];
  } catch (err) {
    console.error('[Supabase] Exception fetching commands:', err);
    return [];
  }
}

/**
 * Update a command's status
 */
export async function updateCommandStatus(
  commandId: string,
  status: 'completed' | 'failed',
  result?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const updateData: Record<string, any> = {
      status,
      executed_at: new Date().toISOString(),
    };
    
    if (result) {
      updateData.result = result;
    }
    
    const { error: dbError } = await supabase
      .from('commands')
      .update(updateData)
      .eq('id', commandId);
    
    if (dbError) {
      console.error('[Supabase] Error updating command:', dbError.message);
      return { success: false, error: dbError.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Supabase] Exception updating command:', errorMessage);
    return { success: false, error: errorMessage };
  }
}