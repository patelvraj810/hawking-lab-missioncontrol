import { supabase } from '@/integrations/supabase/client';
import type { CommandEntry } from '@/data/mock';

const USE_MOCK = true; // Toggle to false when Supabase is populated

export async function submitCommand(command: string, payload: Record<string, unknown>, issuedBy = 'admin'): Promise<CommandEntry> {
  const newCmd: CommandEntry = {
    id: `cmd-${Date.now()}`,
    command,
    payload,
    status: 'pending',
    created_at: new Date().toISOString(),
    executed_at: null,
    issued_by: issuedBy,
    result: null,
  };

  if (!USE_MOCK) {
    const { data, error } = await supabase.from('commands').insert({
      command,
      payload,
      status: 'pending',
      issued_by: issuedBy,
    }).select().single();
    if (error) throw error;
    return data as unknown as CommandEntry;
  }

  return newCmd;
}

export async function fetchCommandHistory(limit = 50): Promise<CommandEntry[]> {
  if (USE_MOCK) return [];

  const { data, error } = await supabase
    .from('commands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as CommandEntry[];
}

export function subscribeToCommandStatus(commandId: string, callback: (command: CommandEntry) => void) {
  if (USE_MOCK) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`command-${commandId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'commands', filter: `id=eq.${commandId}` }, (payload) => {
      callback(payload.new as unknown as CommandEntry);
    })
    .subscribe();

  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}
