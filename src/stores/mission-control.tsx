import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchEvents, subscribeToEvents, fetchCommandHistory } from '@/services/events';
import type { Agent, Project, Task, SystemState, EventEntry, CommandEntry } from '@/data/mock';

interface MissionControlState {
  agents: Agent[];
  projects: Project[];
  tasks: Task[];
  systemState: SystemState;
  events: EventEntry[];
  commands: CommandEntry[];
  autonomousMode: boolean;
  sidebarCollapsed: boolean;
  isLoading: boolean;
}

interface MissionControlActions {
  setAutonomousMode: (mode: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addEvent: (event: EventEntry) => void;
  addCommand: (command: CommandEntry) => void;
  updateCommandStatus: (id: string, status: CommandEntry['status'], result?: Record<string, unknown>) => void;
  updateAgentStatus: (id: string, status: Agent['status'], task?: string | null) => void;
  refreshData: () => Promise<void>;
}

type MissionControlContextType = MissionControlState & MissionControlActions;

const MissionControlContext = createContext<MissionControlContextType | null>(null);

// Default empty state
const defaultSystemState: SystemState = {
  phase: 'Phase 1',
  phaseGoals: [],
  uptime: '0%',
  totalRevenue: 0,
  monthlyRevenue: 0,
  activeProjects: 0,
  totalAgents: 0,
  onlineAgents: 0,
  tasksTodayCompleted: 0,
  tasksTodayTotal: 0,
  apiCalls24h: 0,
  avgLatency: 0,
  failureRate: 0,
};

export function MissionControlProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemState, setSystemState] = useState<SystemState>(defaultSystemState);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [commands, setCommands] = useState<CommandEntry[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh all data from Supabase
  const refreshData = useCallback(async () => {
    try {
      // Fetch events
      const eventsData = await fetchEvents({ limit: 100 });
      setEvents(eventsData);

      // Fetch command history
      const commandsData = await fetchCommandHistory(50);
      setCommands(commandsData);

      // Fetch agents from Supabase (if agents table exists)
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .order('last_activity', { ascending: false });

      if (agentsData && agentsData.length > 0) {
        const formattedAgents: Agent[] = agentsData.map(a => ({
          id: a.id,
          name: a.name || a.id,
          role: a.role || 'Agent',
          model: a.model || 'unknown',
          status: a.status || 'offline',
          currentTask: a.current_task || null,
          lastActivity: a.last_activity || 'Never',
          avatar: a.avatar || '🤖',
          costTotal: a.cost_total || 0,
          tasksCompleted: a.tasks_completed || 0,
        }));
        setAgents(formattedAgents);
      }

      // Fetch system state
      const { data: stateData } = await supabase
        .from('system_state')
        .select('*')
        .eq('id', 1)
        .single();

      if (stateData) {
        setSystemState({
          phase: stateData.phase || 'Phase 1',
          phaseGoals: stateData.phase_goals || [],
          uptime: stateData.uptime || '0%',
          totalRevenue: stateData.total_revenue || 0,
          monthlyRevenue: stateData.monthly_revenue || 0,
          activeProjects: stateData.active_projects || 0,
          totalAgents: stateData.total_agents || 0,
          onlineAgents: stateData.online_agents || 0,
          tasksTodayCompleted: 0,
          tasksTodayTotal: 0,
          apiCalls24h: 0,
          avgLatency: 0,
          failureRate: 0,
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Subscribe to real-time events
  useEffect(() => {
    const subscription = subscribeToEvents((event) => {
      setEvents(prev => [event as EventEntry, ...prev].slice(0, 100));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addEvent = useCallback((event: EventEntry) => {
    setEvents(prev => [event, ...prev].slice(0, 100));
  }, []);

  const addCommand = useCallback((command: CommandEntry) => {
    setCommands(prev => [command, ...prev]);
  }, []);

  const updateCommandStatus = useCallback((id: string, status: CommandEntry['status'], result?: Record<string, unknown>) => {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, status, result: result ?? c.result, executed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : c.executed_at } : c));
  }, []);

  const updateAgentStatus = useCallback((id: string, status: Agent['status'], task?: string | null) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status, currentTask: task !== undefined ? task : a.currentTask, lastActivity: 'Just now' } : a));
  }, []);

  return (
    <MissionControlContext.Provider value={{
      agents, projects, tasks, systemState, events, commands,
      autonomousMode, sidebarCollapsed, isLoading,
      setAutonomousMode, setSidebarCollapsed, addEvent, addCommand, updateCommandStatus, updateAgentStatus,
      refreshData,
    }}>
      {children}
    </MissionControlContext.Provider>
  );
}

export function useMissionControl() {
  const ctx = useContext(MissionControlContext);
  if (!ctx) throw new Error('useMissionControl must be used within MissionControlProvider');
  return ctx;
}