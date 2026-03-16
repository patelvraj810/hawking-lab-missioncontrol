import { supabase } from '@/integrations/supabase/client';
import type { Project } from '@/data/mock';

interface DbProject {
  id: string;
  name: string;
  description: string;
  goal: string;
  assigned_agents: string[];
  progress: number;
  status: string;
  task_count: number;
  completed_tasks: number;
  created_at: string;
}

function mapDbProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    assignedAgents: row.assigned_agents ?? [],
    progress: row.progress,
    status: row.status as Project['status'],
    createdAt: row.created_at,
    taskCount: row.task_count,
    completedTasks: row.completed_tasks,
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return (data ?? []).map(mapDbProject as any);
}
