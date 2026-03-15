// OpenClaw Mission Control — Mock Data

export type AgentStatus = 'idle' | 'pending' | 'in-progress' | 'blocked' | 'complete' | 'failed';

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  currentTask: string | null;
  lastActivity: string;
  avatar: string;
  costTotal: number;
  tasksCompleted: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  assignedAgents: string[];
  progress: number;
  status: 'planning' | 'active' | 'review' | 'complete';
  createdAt: string;
  taskCount: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedAgent: string;
  projectId: string;
  status: AgentStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startTime: string | null;
  completionTime: string | null;
  logs: string[];
  errors: string[];
  dependencies: string[];
}

export interface SystemState {
  phase: string;
  phaseGoals: string[];
  uptime: string;
  totalRevenue: number;
  monthlyRevenue: number;
  activeProjects: number;
  totalAgents: number;
  onlineAgents: number;
  tasksTodayCompleted: number;
  tasksTodayTotal: number;
  apiCalls24h: number;
  avgLatency: number;
  failureRate: number;
}

export interface CostEntry {
  date: string;
  agent: string;
  model: string;
  tokens: number;
  cost: number;
  project: string;
}

export interface MemoryEntry {
  id: string;
  type: 'workspace' | 'agent' | 'daily';
  agent: string | null;
  title: string;
  content: string;
  timestamp: string;
}

export interface EventEntry {
  id: string;
  timestamp: string;
  agent: string | null;
  event_type: string;
  project_id: string | null;
  task_id: string | null;
  data: Record<string, unknown>;
}

export interface CommandEntry {
  id: string;
  command: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  executed_at: string | null;
  issued_by: string;
  result: Record<string, unknown> | null;
}

// --- Mock Agents ---
export const mockAgents: Agent[] = [
  { id: 'agent-001', name: 'Eleven', role: 'Orchestrator', model: 'gpt-4o', status: 'in-progress', currentTask: 'Coordinating mobile app sprint', lastActivity: '2 min ago', avatar: '🧠', costTotal: 45.20, tasksCompleted: 127 },
  { id: 'agent-002', name: 'Steve', role: 'Full-Stack Developer', model: 'claude-3.5-sonnet', status: 'in-progress', currentTask: 'Building REST API endpoints', lastActivity: '30 sec ago', avatar: '⚡', costTotal: 89.50, tasksCompleted: 203 },
  { id: 'agent-003', name: 'Nova', role: 'Research Analyst', model: 'gpt-4o', status: 'idle', currentTask: null, lastActivity: '15 min ago', avatar: '🔬', costTotal: 32.10, tasksCompleted: 85 },
  { id: 'agent-004', name: 'Max', role: 'DevOps Engineer', model: 'claude-3.5-sonnet', status: 'pending', currentTask: 'Waiting for CI pipeline approval', lastActivity: '5 min ago', avatar: '🔧', costTotal: 28.90, tasksCompleted: 64 },
  { id: 'agent-005', name: 'Luna', role: 'UI/UX Designer', model: 'gpt-4o', status: 'in-progress', currentTask: 'Designing onboarding flow', lastActivity: '1 min ago', avatar: '🎨', costTotal: 51.30, tasksCompleted: 92 },
  { id: 'agent-006', name: 'Rex', role: 'QA Engineer', model: 'claude-3.5-sonnet', status: 'blocked', currentTask: 'Blocked on API test environment', lastActivity: '20 min ago', avatar: '🛡️', costTotal: 19.70, tasksCompleted: 156 },
  { id: 'agent-007', name: 'Aria', role: 'Content Writer', model: 'gpt-4o', status: 'complete', currentTask: null, lastActivity: '1 hour ago', avatar: '✍️', costTotal: 15.40, tasksCompleted: 78 },
  { id: 'agent-008', name: 'Zed', role: 'Security Analyst', model: 'claude-3.5-sonnet', status: 'idle', currentTask: null, lastActivity: '45 min ago', avatar: '🔒', costTotal: 22.60, tasksCompleted: 43 },
  { id: 'agent-009', name: 'Bolt', role: 'Performance Engineer', model: 'gpt-4o', status: 'in-progress', currentTask: 'Optimizing database queries', lastActivity: '3 min ago', avatar: '⚙️', costTotal: 37.80, tasksCompleted: 67 },
  { id: 'agent-010', name: 'Echo', role: 'Data Engineer', model: 'claude-3.5-sonnet', status: 'pending', currentTask: 'Awaiting data pipeline config', lastActivity: '10 min ago', avatar: '📊', costTotal: 41.20, tasksCompleted: 91 },
  { id: 'agent-011', name: 'Sage', role: 'ML Engineer', model: 'gpt-4o', status: 'in-progress', currentTask: 'Training recommendation model', lastActivity: '1 min ago', avatar: '🤖', costTotal: 128.90, tasksCompleted: 34 },
  { id: 'agent-012', name: 'Pixel', role: 'Frontend Developer', model: 'claude-3.5-sonnet', status: 'in-progress', currentTask: 'Implementing dashboard components', lastActivity: '15 sec ago', avatar: '💻', costTotal: 67.40, tasksCompleted: 145 },
];

// --- Mock Projects ---
export const mockProjects: Project[] = [
  { id: 'proj-001', name: 'Mobile Productivity App', description: 'Cross-platform mobile app for task management', goal: 'Launch MVP with 1000 users', assignedAgents: ['agent-001', 'agent-002', 'agent-005', 'agent-012'], progress: 68, status: 'active', createdAt: '2026-03-01', taskCount: 24, completedTasks: 16 },
  { id: 'proj-002', name: 'AI SaaS Platform', description: 'AI-powered analytics platform for SMBs', goal: 'Complete backend and launch beta', assignedAgents: ['agent-002', 'agent-009', 'agent-011'], progress: 42, status: 'active', createdAt: '2026-03-05', taskCount: 36, completedTasks: 15 },
  { id: 'proj-003', name: 'E-commerce Integration', description: 'Shopify and WooCommerce integration module', goal: 'Ship v1 to marketplace', assignedAgents: ['agent-004', 'agent-006', 'agent-010'], progress: 85, status: 'review', createdAt: '2026-02-15', taskCount: 18, completedTasks: 15 },
  { id: 'proj-004', name: 'Documentation Portal', description: 'Self-service documentation and knowledge base', goal: 'Migrate all docs and launch', assignedAgents: ['agent-007', 'agent-003'], progress: 95, status: 'review', createdAt: '2026-02-20', taskCount: 12, completedTasks: 11 },
  { id: 'proj-005', name: 'Security Audit System', description: 'Automated security scanning and reporting', goal: 'Pass SOC2 audit requirements', assignedAgents: ['agent-008', 'agent-006'], progress: 30, status: 'planning', createdAt: '2026-03-10', taskCount: 20, completedTasks: 6 },
];

// --- Mock Tasks ---
export const mockTasks: Task[] = [
  { id: 'task-001', title: 'Set up project scaffolding', description: 'Initialize React Native project with TypeScript', assignedAgent: 'agent-002', projectId: 'proj-001', status: 'complete', priority: 'high', startTime: '2026-03-01T09:00:00Z', completionTime: '2026-03-01T11:30:00Z', logs: ['Initialized project', 'Added TypeScript config', 'Installed dependencies'], errors: [], dependencies: [] },
  { id: 'task-002', title: 'Design authentication flow', description: 'Create login, signup, and password reset screens', assignedAgent: 'agent-005', projectId: 'proj-001', status: 'complete', priority: 'high', startTime: '2026-03-02T10:00:00Z', completionTime: '2026-03-02T16:00:00Z', logs: ['Wireframes complete', 'High-fidelity mockups done', 'Design review passed'], errors: [], dependencies: ['task-001'] },
  { id: 'task-003', title: 'Build REST API endpoints', description: 'Implement user, project, and task CRUD endpoints', assignedAgent: 'agent-002', projectId: 'proj-001', status: 'in-progress', priority: 'critical', startTime: '2026-03-03T08:00:00Z', completionTime: null, logs: ['User endpoints done', 'Project endpoints in progress', 'Running integration tests...'], errors: [], dependencies: ['task-001'] },
  { id: 'task-004', title: 'Configure CI/CD pipeline', description: 'Set up GitHub Actions for testing and deployment', assignedAgent: 'agent-004', projectId: 'proj-001', status: 'pending', priority: 'medium', startTime: null, completionTime: null, logs: [], errors: [], dependencies: ['task-003'] },
  { id: 'task-005', title: 'Train recommendation model', description: 'Fine-tune model on user behavior data', assignedAgent: 'agent-011', projectId: 'proj-002', status: 'in-progress', priority: 'high', startTime: '2026-03-10T07:00:00Z', completionTime: null, logs: ['Data preprocessing complete', 'Training epoch 1/10', 'Training epoch 2/10...'], errors: [], dependencies: [] },
  { id: 'task-006', title: 'API test environment setup', description: 'Create isolated test environment for API testing', assignedAgent: 'agent-006', projectId: 'proj-003', status: 'blocked', priority: 'high', startTime: '2026-03-12T09:00:00Z', completionTime: null, logs: ['Started environment setup', 'Docker compose configured'], errors: ['Port 8080 conflict with existing service', 'Waiting for DevOps resolution'], dependencies: [] },
  { id: 'task-007', title: 'Optimize database queries', description: 'Profile and optimize slow queries', assignedAgent: 'agent-009', projectId: 'proj-002', status: 'in-progress', priority: 'medium', startTime: '2026-03-14T10:00:00Z', completionTime: null, logs: ['Identified 3 slow queries', 'Added index on users.email', 'Rewriting join query...'], errors: [], dependencies: [] },
  { id: 'task-008', title: 'Write API documentation', description: 'Document all REST API endpoints with examples', assignedAgent: 'agent-007', projectId: 'proj-004', status: 'complete', priority: 'medium', startTime: '2026-03-08T10:00:00Z', completionTime: '2026-03-12T15:00:00Z', logs: ['Drafted user endpoints docs', 'Added code examples', 'Review complete'], errors: [], dependencies: [] },
  { id: 'task-009', title: 'Implement dashboard components', description: 'Build chart components and KPI cards', assignedAgent: 'agent-012', projectId: 'proj-001', status: 'in-progress', priority: 'high', startTime: '2026-03-14T08:00:00Z', completionTime: null, logs: ['KPI cards done', 'Line chart component done', 'Working on bar charts...'], errors: [], dependencies: ['task-002'] },
  { id: 'task-010', title: 'Design onboarding flow', description: 'Create welcome screens and tutorial overlays', assignedAgent: 'agent-005', projectId: 'proj-001', status: 'in-progress', priority: 'medium', startTime: '2026-03-14T09:00:00Z', completionTime: null, logs: ['Research complete', 'Wireframes in progress...'], errors: [], dependencies: ['task-002'] },
];

// --- Mock System State ---
export const mockSystemState: SystemState = {
  phase: 'GROWTH_PHASE_2',
  phaseGoals: ['Launch 3 products', 'Reach $5K MRR', 'Automate 80% of workflows', 'Onboard 500 beta users'],
  uptime: '99.97%',
  totalRevenue: 12450,
  monthlyRevenue: 3280,
  activeProjects: 5,
  totalAgents: 12,
  onlineAgents: 8,
  tasksTodayCompleted: 14,
  tasksTodayTotal: 22,
  apiCalls24h: 48392,
  avgLatency: 234,
  failureRate: 2.3,
};

// --- Mock Events ---
export const mockEvents: EventEntry[] = [
  { id: 'evt-001', timestamp: '2026-03-15T14:30:00Z', agent: 'Steve', event_type: 'task_started', project_id: 'proj-001', task_id: 'task-003', data: { task: 'Build REST API endpoints' } },
  { id: 'evt-002', timestamp: '2026-03-15T14:25:00Z', agent: 'Sage', event_type: 'task_started', project_id: 'proj-002', task_id: 'task-005', data: { task: 'Train recommendation model' } },
  { id: 'evt-003', timestamp: '2026-03-15T14:20:00Z', agent: 'Rex', event_type: 'task_failed', project_id: 'proj-003', task_id: 'task-006', data: { task: 'API test environment setup', error: 'Port conflict' } },
  { id: 'evt-004', timestamp: '2026-03-15T14:15:00Z', agent: 'Aria', event_type: 'task_completed', project_id: 'proj-004', task_id: 'task-008', data: { task: 'Write API documentation' } },
  { id: 'evt-005', timestamp: '2026-03-15T14:10:00Z', agent: 'Pixel', event_type: 'task_started', project_id: 'proj-001', task_id: 'task-009', data: { task: 'Implement dashboard components' } },
  { id: 'evt-006', timestamp: '2026-03-15T14:05:00Z', agent: 'Luna', event_type: 'task_started', project_id: 'proj-001', task_id: 'task-010', data: { task: 'Design onboarding flow' } },
  { id: 'evt-007', timestamp: '2026-03-15T14:00:00Z', agent: 'Bolt', event_type: 'task_started', project_id: 'proj-002', task_id: 'task-007', data: { task: 'Optimize database queries' } },
  { id: 'evt-008', timestamp: '2026-03-15T13:55:00Z', agent: null, event_type: 'system_alert', project_id: null, task_id: null, data: { message: 'API latency spike detected: 450ms avg', severity: 'warning' } },
  { id: 'evt-009', timestamp: '2026-03-15T13:50:00Z', agent: 'Eleven', event_type: 'agent_assigned', project_id: 'proj-001', task_id: null, data: { message: 'Coordinating mobile app sprint' } },
  { id: 'evt-010', timestamp: '2026-03-15T13:45:00Z', agent: null, event_type: 'project_created', project_id: 'proj-005', task_id: null, data: { project: 'Security Audit System' } },
  { id: 'evt-011', timestamp: '2026-03-15T13:30:00Z', agent: 'Nova', event_type: 'memory_updated', project_id: null, task_id: null, data: { memory: 'Updated market research findings' } },
  { id: 'evt-012', timestamp: '2026-03-15T13:15:00Z', agent: 'Echo', event_type: 'task_started', project_id: 'proj-002', task_id: null, data: { task: 'Data pipeline configuration' } },
];

// --- Mock Commands ---
export const mockCommands: CommandEntry[] = [
  { id: 'cmd-001', command: 'create_project', payload: { name: 'Security Audit System', description: 'Automated security scanning' }, status: 'completed', created_at: '2026-03-15T13:45:00Z', executed_at: '2026-03-15T13:45:05Z', issued_by: 'admin', result: { project_id: 'proj-005' } },
  { id: 'cmd-002', command: 'assign_agent', payload: { agent: 'Eleven', project: 'proj-001' }, status: 'completed', created_at: '2026-03-15T13:50:00Z', executed_at: '2026-03-15T13:50:02Z', issued_by: 'admin', result: { success: true } },
  { id: 'cmd-003', command: 'start_task', payload: { task: 'task-003', agent: 'Steve' }, status: 'completed', created_at: '2026-03-15T14:30:00Z', executed_at: '2026-03-15T14:30:01Z', issued_by: 'admin', result: { success: true } },
];

// --- Mock Cost Data ---
export const mockCostData: CostEntry[] = [
  { date: '2026-03-09', agent: 'Sage', model: 'gpt-4o', tokens: 245000, cost: 12.25, project: 'AI SaaS Platform' },
  { date: '2026-03-10', agent: 'Steve', model: 'claude-3.5-sonnet', tokens: 189000, cost: 5.67, project: 'Mobile Productivity App' },
  { date: '2026-03-10', agent: 'Sage', model: 'gpt-4o', tokens: 312000, cost: 15.60, project: 'AI SaaS Platform' },
  { date: '2026-03-11', agent: 'Pixel', model: 'claude-3.5-sonnet', tokens: 156000, cost: 4.68, project: 'Mobile Productivity App' },
  { date: '2026-03-11', agent: 'Eleven', model: 'gpt-4o', tokens: 98000, cost: 4.90, project: 'Mobile Productivity App' },
  { date: '2026-03-12', agent: 'Steve', model: 'claude-3.5-sonnet', tokens: 210000, cost: 6.30, project: 'Mobile Productivity App' },
  { date: '2026-03-12', agent: 'Luna', model: 'gpt-4o', tokens: 134000, cost: 6.70, project: 'Mobile Productivity App' },
  { date: '2026-03-13', agent: 'Nova', model: 'gpt-4o', tokens: 87000, cost: 4.35, project: 'AI SaaS Platform' },
  { date: '2026-03-13', agent: 'Bolt', model: 'gpt-4o', tokens: 145000, cost: 7.25, project: 'AI SaaS Platform' },
  { date: '2026-03-14', agent: 'Steve', model: 'claude-3.5-sonnet', tokens: 198000, cost: 5.94, project: 'E-commerce Integration' },
  { date: '2026-03-14', agent: 'Sage', model: 'gpt-4o', tokens: 420000, cost: 21.00, project: 'AI SaaS Platform' },
  { date: '2026-03-15', agent: 'Pixel', model: 'claude-3.5-sonnet', tokens: 167000, cost: 5.01, project: 'Mobile Productivity App' },
  { date: '2026-03-15', agent: 'Eleven', model: 'gpt-4o', tokens: 112000, cost: 5.60, project: 'Mobile Productivity App' },
  { date: '2026-03-15', agent: 'Sage', model: 'gpt-4o', tokens: 380000, cost: 19.00, project: 'AI SaaS Platform' },
];

// --- Mock Memory Entries ---
export const mockMemory: MemoryEntry[] = [
  { id: 'mem-001', type: 'workspace', agent: null, title: 'WORKSPACE_MEMORY', content: '# OpenClaw Workspace Memory\n\n## Active Sprint\n- Mobile Productivity App: Sprint 3\n- AI SaaS Platform: Sprint 1\n\n## Key Decisions\n- Using React Native for mobile\n- Claude 3.5 Sonnet for code generation\n- GPT-4o for orchestration and research\n\n## Revenue Target\n- Q1 2026: $15,000 MRR\n- Current: $3,280 MRR', timestamp: '2026-03-15T12:00:00Z' },
  { id: 'mem-002', type: 'agent', agent: 'Steve', title: 'STEVE_MEMORY', content: '# Steve — Full-Stack Developer\n\n## Current Focus\n- Building REST API for Mobile Productivity App\n- Stack: Node.js, Express, PostgreSQL\n\n## Recent Learnings\n- Connection pooling improved query speed by 40%\n- JWT refresh token rotation pattern implemented\n\n## Blockers\n- None currently', timestamp: '2026-03-15T14:30:00Z' },
  { id: 'mem-003', type: 'agent', agent: 'Eleven', title: 'ELEVEN_MEMORY', content: '# Eleven — Orchestrator\n\n## Sprint Overview\n- 5 agents actively working\n- 3 agents idle/pending\n- 68% sprint completion\n\n## Priority Queue\n1. Complete API endpoints (Steve)\n2. Finish onboarding design (Luna)\n3. Unblock Rex on test environment\n\n## Decisions Made\n- Delayed security audit to next sprint\n- Assigned Echo to data pipeline', timestamp: '2026-03-15T14:00:00Z' },
  { id: 'mem-004', type: 'daily', agent: null, title: 'DAILY_LOG_2026-03-15', content: '# Daily Log — March 15, 2026\n\n## Summary\n- 14/22 tasks completed\n- 1 blocked task (Rex)\n- API latency spike at 13:55 UTC\n- New project created: Security Audit System\n\n## Agent Activity\n- Steve: 4 API endpoints completed\n- Luna: Onboarding wireframes done\n- Sage: Model training epoch 2/10\n- Pixel: KPI cards and line charts done', timestamp: '2026-03-15T23:59:00Z' },
];

// --- Chart Data ---
export const productivityData = [
  { date: 'Mar 9', tasks: 8, agents: 6 },
  { date: 'Mar 10', tasks: 12, agents: 8 },
  { date: 'Mar 11', tasks: 10, agents: 7 },
  { date: 'Mar 12', tasks: 15, agents: 9 },
  { date: 'Mar 13', tasks: 11, agents: 8 },
  { date: 'Mar 14', tasks: 18, agents: 10 },
  { date: 'Mar 15', tasks: 14, agents: 8 },
];

export const costByModel = [
  { model: 'gpt-4o', cost: 96.65, tokens: 1933000 },
  { model: 'claude-3.5-sonnet', cost: 27.60, tokens: 920000 },
];

export const healthMetrics = {
  apiUsage: [
    { hour: '00:00', calls: 1200 },
    { hour: '04:00', calls: 800 },
    { hour: '08:00', calls: 3200 },
    { hour: '12:00', calls: 5600 },
    { hour: '16:00', calls: 4800 },
    { hour: '20:00', calls: 2400 },
  ],
  latency: [
    { time: '13:00', ms: 180 },
    { time: '13:15', ms: 195 },
    { time: '13:30', ms: 210 },
    { time: '13:45', ms: 280 },
    { time: '13:55', ms: 450 },
    { time: '14:00', ms: 320 },
    { time: '14:15', ms: 240 },
    { time: '14:30', ms: 220 },
  ],
};

// Collaboration edges
export const collaborationEdges = [
  { from: 'Eleven', to: 'Steve', task: 'API Development' },
  { from: 'Eleven', to: 'Luna', task: 'UI Design' },
  { from: 'Eleven', to: 'Pixel', task: 'Frontend Dev' },
  { from: 'Steve', to: 'Rex', task: 'QA Testing' },
  { from: 'Steve', to: 'Max', task: 'Deployment' },
  { from: 'Nova', to: 'Eleven', task: 'Research Findings' },
  { from: 'Luna', to: 'Pixel', task: 'Design Handoff' },
  { from: 'Sage', to: 'Echo', task: 'Data Pipeline' },
  { from: 'Bolt', to: 'Steve', task: 'Perf Optimization' },
  { from: 'Zed', to: 'Rex', task: 'Security Review' },
];
