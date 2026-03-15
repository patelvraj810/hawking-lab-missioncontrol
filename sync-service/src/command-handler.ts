/**
 * Command handler for executing commands from Supabase
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SupabaseCommand, CommandResult } from './types';
import { updateCommandStatus } from './supabase-client';
import { emitEvents, createCommandEvent } from './event-emitter';

/**
 * Get the OpenClaw home directory
 */
function getOpenClawHome(): string {
  const home = process.env.OPENCLAW_HOME || '~/.openclaw';
  return home.startsWith('~') ? path.join(os.homedir(), home.slice(2)) : home;
}

/**
 * Safely read a JSON file
 */
function readJsonFile(filePath: string): any | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`[CommandHandler] Error reading ${filePath}:`, err);
    return null;
  }
}

/**
 * Safely write a JSON file
 */
function writeJsonFile(filePath: string, data: any): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`[CommandHandler] Error writing ${filePath}:`, err);
    return false;
  }
}

/**
 * Handle create_project command
 */
function handleCreateProject(payload: Record<string, any>): CommandResult {
  const { id, name, ...rest } = payload;
  
  if (!id || !name) {
    return { success: false, error: 'Missing required fields: id, name' };
  }
  
  const statePath = path.join(getOpenClawHome(), 'workspace', 'state.json');
  const state = readJsonFile(statePath);
  
  if (!state) {
    return { success: false, error: 'Could not read state.json' };
  }
  
  // Initialize projects array if it doesn't exist
  if (!state.projects) {
    state.projects = [];
  }
  
  // Check if project already exists
  const existingIndex = state.projects.findIndex((p: any) => p.id === id);
  
  if (existingIndex >= 0) {
    // Update existing project
    state.projects[existingIndex] = {
      ...state.projects[existingIndex],
      name,
      ...rest,
      lastUpdated: new Date().toISOString(),
    };
  } else {
    // Create new project
    state.projects.push({
      id,
      name,
      status: 'active',
      ...rest,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }
  
  // Update system state
  state.lastUpdated = new Date().toISOString();
  
  if (!writeJsonFile(statePath, state)) {
    return { success: false, error: 'Failed to write state.json' };
  }
  
  return {
    success: true,
    message: `Project ${name} (${id}) created successfully`,
    data: { projectId: id },
  };
}

/**
 * Handle update_agent_task command
 */
function handleUpdateAgentTask(payload: Record<string, any>): CommandResult {
  const { agent, task, status, role, skills, assignedBy } = payload;
  
  if (!agent) {
    return { success: false, error: 'Missing required field: agent' };
  }
  
  const taskPath = path.join(getOpenClawHome(), 'agents', agent, 'task.json');
  const existingTask = readJsonFile(taskPath) || {};
  
  const updatedTask = {
    ...existingTask,
    agent,
    role: role || existingTask.role || 'Unknown',
    status: status || existingTask.status || 'pending',
    task: task || existingTask.task || '',
    assigned_by: assignedBy || existingTask.assigned_by,
    skills: skills || existingTask.skills || [],
    lastUpdated: new Date().toISOString(),
  };
  
  if (!writeJsonFile(taskPath, updatedTask)) {
    return { success: false, error: 'Failed to write task.json' };
  }
  
  return {
    success: true,
    message: `Agent ${agent} task updated successfully`,
    data: { agent, status: updatedTask.status },
  };
}

/**
 * Handle assign_agent command
 */
function handleAssignAgent(payload: Record<string, any>): CommandResult {
  const { agent, projectId } = payload;
  
  if (!agent || !projectId) {
    return { success: false, error: 'Missing required fields: agent, projectId' };
  }
  
  const statePath = path.join(getOpenClawHome(), 'workspace', 'state.json');
  const state = readJsonFile(statePath);
  
  if (!state) {
    return { success: false, error: 'Could not read state.json' };
  }
  
  if (!state.projects) {
    return { success: false, error: 'No projects exist in state' };
  }
  
  const projectIndex = state.projects.findIndex((p: any) => p.id === projectId);
  
  if (projectIndex < 0) {
    return { success: false, error: `Project ${projectId} not found` };
  }
  
  // Initialize assignedAgents if it doesn't exist
  if (!state.projects[projectIndex].assignedAgents) {
    state.projects[projectIndex].assignedAgents = [];
  }
  
  // Add agent if not already assigned
  if (!state.projects[projectIndex].assignedAgents.includes(agent)) {
    state.projects[projectIndex].assignedAgents.push(agent);
  }
  
  state.projects[projectIndex].lastUpdated = new Date().toISOString();
  state.lastUpdated = new Date().toISOString();
  
  if (!writeJsonFile(statePath, state)) {
    return { success: false, error: 'Failed to write state.json' };
  }
  
  return {
    success: true,
    message: `Agent ${agent} assigned to project ${projectId}`,
    data: { agent, projectId },
  };
}

/**
 * Execute a command from Supabase
 */
export async function executeCommand(command: SupabaseCommand): Promise<CommandResult> {
  console.log('[CommandHandler] Executing command:', command.command, command.id);
  
  let result: CommandResult;
  
  switch (command.command) {
    case 'create_project':
      result = handleCreateProject(command.payload || {});
      break;
    
    case 'update_agent_task':
      result = handleUpdateAgentTask(command.payload || {});
      break;
    
    case 'assign_agent':
      result = handleAssignAgent(command.payload || {});
      break;
    
    default:
      result = {
        success: false,
        error: `Unknown command type: ${command.command}`,
      };
  }
  
  // Update command status in Supabase
  await updateCommandStatus(
    command.id,
    result.success ? 'completed' : 'failed',
    result.data
  );
  
  // Emit command executed event
  await emitEvents([createCommandEvent(command.command, result.success, result)]);
  
  console.log('[CommandHandler] Command', command.id, result.success ? 'completed' : 'failed');
  
  return result;
}

/**
 * Process all pending commands
 */
export async function processCommands(commands: SupabaseCommand[]): Promise<void> {
  for (const command of commands) {
    try {
      await executeCommand(command);
    } catch (err) {
      console.error('[CommandHandler] Error executing command:', command.id, err);
    }
  }
}