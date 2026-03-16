import { supabase } from '@/integrations/supabase/client';
import type { Task } from '@/data/mock';

interface DbTask {
  id: string;
  title: string;
  description: string;
  assigned_agent: string | null;
  project_id: string | null;
  status: string;
  priority: string;
  start_time: string | null;
  completion_time: string | null;
  logs: string[];
  errors: string[];
  dependencies: string[];
}

function mapDbTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignedAgent: row.assigned_agent ?? '',
    projectId: row.project_id ?? '',
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    startTime: row.start_time,
    completionTime: row.completion_time,
    logs: row.logs ?? [],
    errors: row.errors ?? [],
    dependencies: row.dependencies ?? [],
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return (data ?? []).map(mapDbTask as any);
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const channel = supabase
    .channel('tasks-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
      const tasks = await fetchTasks();
      callback(tasks);
    })
    .subscribe();
  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}
