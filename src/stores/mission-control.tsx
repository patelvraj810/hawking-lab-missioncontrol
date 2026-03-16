import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { fetchEvents, subscribeToEvents } from '@/services/events';
import { fetchCommandHistory } from '@/services/commands';
import type { Agent, Project, Task, SystemState, EventEntry, CommandEntry } from '@/data/mock';
import { mockAgents, mockProjects, mockTasks, mockSystemState } from '@/data/mock';

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
  // Agents, projects, tasks, systemState use mock data (no DB tables yet)
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks] = useState<Task[]>(mockTasks);
  const [systemState] = useState<SystemState>(mockSystemState);

  // Events and commands come from real Supabase tables
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [commands, setCommands] = useState<CommandEntry[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [eventsData, commandsData] = await Promise.all([
        fetchEvents({ limit: 100 }),
        fetchCommandHistory(50),
      ]);
      setEvents(eventsData);
      setCommands(commandsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Subscribe to real-time events
  useEffect(() => {
    const subscription = subscribeToEvents((event) => {
      setEvents(prev => [event as EventEntry, ...prev].slice(0, 100));
    });
    return () => { subscription.unsubscribe(); };
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
