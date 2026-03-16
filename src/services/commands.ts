import { supabase } from '@/integrations/supabase/client';
import type { CommandEntry } from '@/data/mock';
import type { Json } from '@/integrations/supabase/types';

export async function submitCommand(command: string, payload: Record<string, unknown>, issuedBy = 'admin'): Promise<CommandEntry> {
  const { data, error } = await supabase.from('commands').insert([{
    command,
    payload: payload as unknown as Json,
    status: 'pending',
    issued_by: issuedBy,
  }]).select().single();

  if (error) throw error;
  return data as unknown as CommandEntry;
}

export async function fetchCommandHistory(limit = 50): Promise<CommandEntry[]> {
  const { data, error } = await supabase
    .from('commands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching commands:', error);
    return [];
  }
  return (data ?? []) as unknown as CommandEntry[];
}

export function subscribeToCommandStatus(commandId: string, callback: (command: CommandEntry) => void) {
  const channel = supabase
    .channel(`command-${commandId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'commands', filter: `id=eq.${commandId}` }, (payload) => {
      callback(payload.new as unknown as CommandEntry);
    })
    .subscribe();

  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}
