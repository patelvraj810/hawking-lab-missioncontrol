import { supabase } from '@/integrations/supabase/client';
import type { SystemState } from '@/data/mock';
import { mockSystemState } from '@/data/mock';

interface DbSystemState {
  phase: string;
  phase_goals: string[];
  uptime: string;
  total_revenue: number;
  monthly_revenue: number;
  active_projects: number;
  total_agents: number;
  online_agents: number;
  tasks_today_completed: number;
  tasks_today_total: number;
  api_calls_24h: number;
  avg_latency: number;
  failure_rate: number;
}

function mapDbState(row: DbSystemState): SystemState {
  return {
    phase: row.phase,
    phaseGoals: row.phase_goals ?? [],
    uptime: row.uptime,
    totalRevenue: Number(row.total_revenue),
    monthlyRevenue: Number(row.monthly_revenue),
    activeProjects: row.active_projects,
    totalAgents: row.total_agents,
    onlineAgents: row.online_agents,
    tasksTodayCompleted: row.tasks_today_completed,
    tasksTodayTotal: row.tasks_today_total,
    apiCalls24h: row.api_calls_24h,
    avgLatency: row.avg_latency,
    failureRate: Number(row.failure_rate),
  };
}

export async function fetchSystemState(): Promise<SystemState> {
  const { data, error } = await supabase.from('system_state').select('*').eq('id', 1).single();
  if (error) {
    console.error('Error fetching system state:', error);
    return mockSystemState;
  }
  return mapDbState(data as any);
}
