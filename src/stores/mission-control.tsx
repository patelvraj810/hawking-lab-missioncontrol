import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { fetchEvents, subscribeToEvents } from '@/services/events';
import { fetchCommandHistory } from '@/services/commands';
import { fetchAgents, subscribeToAgents } from '@/services/agents';
import { fetchProjects } from '@/services/projects';
import { fetchTasks, subscribeToTasks } from '@/services/tasks';
import { fetchSystemState } from '@/services/system-state';
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

export function MissionControlProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemState, setSystemState] = useState<SystemState>({
    phase: '', phaseGoals: [], uptime: '0%', totalRevenue: 0, monthlyRevenue: 0,
    activeProjects: 0, totalAgents: 0, onlineAgents: 0, tasksTodayCompleted: 0,
    tasksTodayTotal: 0, apiCalls24h: 0, avgLatency: 0, failureRate: 0,
  });
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [commands, setCommands] = useState<CommandEntry[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [agentsData, projectsData, tasksData, stateData, eventsData, commandsData] = await Promise.all([
        fetchAgents(),
        fetchProjects(),
        fetchTasks(),
        fetchSystemState(),
        fetchEvents({ limit: 100 }),
        fetchCommandHistory(50),
      ]);
      setAgents(agentsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setSystemState(stateData);
      setEvents(eventsData);
      setCommands(commandsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Real-time subscriptions
  useEffect(() => {
    const eventSub = subscribeToEvents((event) => {
      setEvents(prev => [event as EventEntry, ...prev].slice(0, 100));
    });
    const agentSub = subscribeToAgents((agents) => setAgents(agents));
    const taskSub = subscribeToTasks((tasks) => setTasks(tasks));
    return () => {
      eventSub.unsubscribe();
      agentSub.unsubscribe();
      taskSub.unsubscribe();
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
