-- =============================================================================
-- COMPLETE SETUP: Create tables + RLS policies
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Events Table (stores all OpenClaw events)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  agent TEXT,
  project_id TEXT,
  task_id TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

-- Commands Table (stores commands from dashboard)
CREATE TABLE IF NOT EXISTS public.commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_by TEXT,
  result JSONB,
  executed_at TIMESTAMPTZ
);

-- Enable RLS on tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for Events
-- =============================================================================

CREATE POLICY "Allow anon to insert events"
  ON public.events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to read events"
  ON public.events FOR SELECT TO anon
  USING (true);

-- =============================================================================
-- RLS Policies for Commands
-- =============================================================================

CREATE POLICY "Allow anon to insert commands"
  ON public.commands FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to read commands"
  ON public.commands FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anon to update commands"
  ON public.commands FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Enable Realtime
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commands;

-- =============================================================================
-- Create indexes for performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_agent ON public.events (agent);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (event_type);
CREATE INDEX IF NOT EXISTS idx_commands_status ON public.commands (status);
CREATE INDEX IF NOT EXISTS idx_commands_created ON public.commands (created_at DESC);