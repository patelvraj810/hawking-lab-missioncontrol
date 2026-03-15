/**
 * TypeScript type definitions for the OpenClaw sync service
 */

// ============================================
// OpenClaw Internal Types
// ============================================

export interface AgentTask {
  agent: string;
  role: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  task: string;
  assigned_by?: string;
  skills?: string[];
  lastUpdated: string;
}

export interface SystemState {
  version?: string;
  lastUpdated: string;
  agents?: Record<string, AgentTask>;
  projects?: Project[];
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  assignedAgents?: string[];
  [key: string]: any;
}

// ============================================
// Supabase Event Types
// ============================================

export type EventType =
  | 'agent_status_changed'
  | 'system_state_updated'
  | 'command_executed'
  | 'sync_started'
  | 'sync_error';

export interface SupabaseEvent {
  id?: string;
  timestamp?: string;
  event_type: EventType;
  agent?: string | null;
  project_id?: string | null;
  task_id?: string | null;
  data: Record<string, any>;
}

// ============================================
// Supabase Command Types
// ============================================

export type CommandType =
  | 'create_project'
  | 'update_agent_task'
  | 'assign_agent';

export type CommandStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SupabaseCommand {
  id: string;
  created_at: string;
  command: string;
  status: CommandStatus;
  payload: Record<string, any> | null;
  result?: Record<string, any> | null;
  issued_by?: string | null;
  executed_at?: string | null;
}

// ============================================
// Internal Event Types
// ============================================

export interface FileChangeEvent {
  path: string;
  type: 'agent_task' | 'system_state';
  agent?: string;
  content: any;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// ============================================
// Configuration Types
// ============================================

export interface SyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openclawHome: string;
  pollIntervalMs: number;
  debounceMs: number;
}

// ============================================
// Database Table Types (matching Supabase schema)
// ============================================

export interface EventsTable {
  id: string;
  timestamp: string;
  event_type: string;
  agent: string | null;
  project_id: string | null;
  task_id: string | null;
  data: object;
}

export interface CommandsTable {
  id: string;
  created_at: string;
  command: string;
  status: string;
  payload: object | null;
  result: object | null;
  issued_by: string | null;
  executed_at: string | null;
}