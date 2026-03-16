import { supabase } from '@/integrations/supabase/client';
import type { EventEntry } from '@/data/mock';
import type { Json } from '@/integrations/supabase/types';

export async function fetchEvents(filters?: { agent?: string; event_type?: string; limit?: number }): Promise<EventEntry[]> {
  let query = supabase.from('events').select('*').order('timestamp', { ascending: false });
  if (filters?.agent) query = query.eq('agent', filters.agent);
  if (filters?.event_type) query = query.eq('event_type', filters.event_type);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return (data ?? []) as unknown as EventEntry[];
}

export async function insertEvent(event: Omit<EventEntry, 'id'>) {
  const { error } = await supabase.from('events').insert([{
    timestamp: event.timestamp,
    agent: event.agent,
    event_type: event.event_type,
    project_id: event.project_id,
    task_id: event.task_id,
    data: event.data as unknown as Json,
  }]);
  if (error) throw error;
}

export function subscribeToEvents(callback: (event: EventEntry) => void) {
  const channel = supabase
    .channel('events-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
      callback(payload.new as unknown as EventEntry);
    })
    .subscribe();

  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}
