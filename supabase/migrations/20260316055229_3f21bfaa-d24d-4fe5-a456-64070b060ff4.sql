
-- Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  current_task TEXT,
  last_activity TEXT DEFAULT 'Never',
  avatar TEXT DEFAULT '🤖',
  cost_total NUMERIC NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  assigned_agents TEXT[] NOT NULL DEFAULT '{}',
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  task_count INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  assigned_agent TEXT,
  project_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  start_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  logs TEXT[] NOT NULL DEFAULT '{}',
  errors TEXT[] NOT NULL DEFAULT '{}',
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System state table (singleton)
CREATE TABLE IF NOT EXISTS public.system_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  phase TEXT NOT NULL DEFAULT 'INIT',
  phase_goals TEXT[] NOT NULL DEFAULT '{}',
  uptime TEXT NOT NULL DEFAULT '0%',
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  monthly_revenue NUMERIC NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  total_agents INTEGER NOT NULL DEFAULT 0,
  online_agents INTEGER NOT NULL DEFAULT 0,
  tasks_today_completed INTEGER NOT NULL DEFAULT 0,
  tasks_today_total INTEGER NOT NULL DEFAULT 0,
  api_calls_24h INTEGER NOT NULL DEFAULT 0,
  avg_latency INTEGER NOT NULL DEFAULT 0,
  failure_rate NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_state ENABLE ROW LEVEL SECURITY;

-- RLS: anon can read all (public dashboard), service_role manages writes
CREATE POLICY "Anon can read agents" ON public.agents FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read agents" ON public.agents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can read projects" ON public.projects FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read projects" ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can read tasks" ON public.tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can read system_state" ON public.system_state FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read system_state" ON public.system_state FOR SELECT TO authenticated USING (true);

-- Enable realtime for agents and tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents (status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON public.tasks (assigned_agent);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
