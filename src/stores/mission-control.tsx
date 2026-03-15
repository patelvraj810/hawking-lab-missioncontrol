import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { mockAgents, mockProjects, mockTasks, mockSystemState, mockEvents, mockCommands, type Agent, type Project, type Task, type SystemState, type EventEntry, type CommandEntry } from '@/data/mock';

interface MissionControlState {
  agents: Agent[];
  projects: Project[];
  tasks: Task[];
  systemState: SystemState;
  events: EventEntry[];
  commands: CommandEntry[];
  autonomousMode: boolean;
  sidebarCollapsed: boolean;
}

interface MissionControlActions {
  setAutonomousMode: (mode: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addEvent: (event: EventEntry) => void;
  addCommand: (command: CommandEntry) => void;
  updateCommandStatus: (id: string, status: CommandEntry['status'], result?: Record<string, unknown>) => void;
  updateAgentStatus: (id: string, status: Agent['status'], task?: string | null) => void;
}

type MissionControlContextType = MissionControlState & MissionControlActions;

const MissionControlContext = createContext<MissionControlContextType | null>(null);

export function MissionControlProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [projects] = useState<Project[]>(mockProjects);
  const [tasks] = useState<Task[]>(mockTasks);
  const [systemState] = useState<SystemState>(mockSystemState);
  const [events, setEvents] = useState<EventEntry[]>(mockEvents);
  const [commands, setCommands] = useState<CommandEntry[]>(mockCommands);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addEvent = useCallback((event: EventEntry) => {
    setEvents(prev => [event, ...prev]);
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
      autonomousMode, sidebarCollapsed,
      setAutonomousMode, setSidebarCollapsed, addEvent, addCommand, updateCommandStatus, updateAgentStatus,
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
