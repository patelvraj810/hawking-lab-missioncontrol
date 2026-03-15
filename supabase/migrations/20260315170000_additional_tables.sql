-- Migration: Additional tables for Mission Control Dashboard
-- Purpose: Support agent status tracking and system state management

-- =============================================================================
-- Agents Table
-- Tracks OpenClaw agent status, activity, and metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY,                    -- Agent identifier (e.g., 'eleven', 'steve')
  name TEXT NOT NULL,                     -- Display name
  role TEXT,                              -- Agent role (e.g., 'Captain', 'Operations')
  model TEXT,                             -- AI model being used
  status TEXT NOT NULL DEFAULT 'offline', -- Current status: 'online', 'offline', 'busy', 'error'
  current_task TEXT,                      -- Description of current task
  last_activity TIMESTAMPTZ,              -- Last seen timestamp
  avatar TEXT,                            -- Avatar URL or identifier
  cost_total DECIMAL(10,2) DEFAULT 0.00,  -- Total cost accumulated
  tasks_completed INTEGER DEFAULT 0,       -- Number of completed tasks
  metadata JSONB DEFAULT '{}'::jsonb,     -- Additional flexible data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents (status);
CREATE INDEX IF NOT EXISTS idx_agents_last_activity ON public.agents (last_activity DESC);

-- =============================================================================
-- System State Table
-- Tracks overall system state and metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.system_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton row
  phase TEXT NOT NULL DEFAULT 'development',         -- Current development phase
  phase_goals JSONB DEFAULT '[]'::jsonb,             -- Goals for current phase
  uptime TEXT,                                       -- Human-readable uptime string
  total_revenue DECIMAL(10,2) DEFAULT 0.00,          -- Total revenue tracked
  monthly_revenue DECIMAL(10,2) DEFAULT 0.00,        -- Current month revenue
  active_projects INTEGER DEFAULT 0,                  -- Number of active projects
  total_agents INTEGER DEFAULT 0,                     -- Total configured agents
  online_agents INTEGER DEFAULT 0,                    -- Currently online agents
  last_sync TIMESTAMPTZ,                             -- Last sync with data source
  metadata JSONB DEFAULT '{}'::jsonb,                -- Additional flexible data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one row in system_state
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_state_singleton ON public.system_state ((id IS NOT NULL));

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_state ENABLE ROW LEVEL SECURITY;

-- Agents: Authenticated users can read
CREATE POLICY "Authenticated users can read agents"
  ON public.agents FOR SELECT TO authenticated
  USING (true);

-- Agents: Service role has full access (for sync service)
CREATE POLICY "Service role can manage agents"
  ON public.agents TO service_role
  USING (true)
  WITH CHECK (true);

-- System State: Authenticated users can read
CREATE POLICY "Authenticated users can read system_state"
  ON public.system_state FOR SELECT TO authenticated
  USING (true);

-- System State: Service role has full access (for sync service)
CREATE POLICY "Service role can manage system_state"
  ON public.system_state TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Real-time Subscriptions
-- =============================================================================

-- Enable realtime for agents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;

-- Note: system_state typically doesn't need realtime as it's updated infrequently
-- If needed, uncomment the line below:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.system_state;

-- =============================================================================
-- Initial Data
-- =============================================================================

-- Insert initial system state row
INSERT INTO public.system_state (id, phase, phase_goals) VALUES (1, 'development', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Trigger for updated_at
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to agents table
DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to system_state table
DROP TRIGGER IF EXISTS update_system_state_updated_at ON public.system_state;
CREATE TRIGGER update_system_state_updated_at
  BEFORE UPDATE ON public.system_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();