import { supabase } from '@/integrations/supabase/client';
import type { Agent } from '@/data/mock';

interface DbAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: string;
  current_task: string | null;
  last_activity: string;
  avatar: string;
  cost_total: number;
  tasks_completed: number;
}

function mapDbAgent(row: DbAgent): Agent {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    model: row.model,
    status: row.status as Agent['status'],
    currentTask: row.current_task,
    lastActivity: row.last_activity,
    avatar: row.avatar,
    costTotal: Number(row.cost_total),
    tasksCompleted: row.tasks_completed,
  };
}

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase.from('agents').select('*');
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  return (data ?? []).map(mapDbAgent as any);
}

export function subscribeToAgents(callback: (agents: Agent[]) => void) {
  const channel = supabase
    .channel('agents-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, async () => {
      const agents = await fetchAgents();
      callback(agents);
    })
    .subscribe();
  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}
