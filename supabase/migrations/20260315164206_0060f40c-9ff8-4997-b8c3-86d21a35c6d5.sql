
-- Create events table for the event stream system
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent TEXT,
  event_type TEXT NOT NULL,
  project_id TEXT,
  task_id TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

-- Create commands table for the command queue system
CREATE TABLE public.commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  issued_by TEXT,
  result JSONB
);

-- Enable RLS on both tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

-- Events: anyone authenticated can read, insert
CREATE POLICY "Authenticated users can read events"
  ON public.events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (true);

-- Commands: anyone authenticated can read and insert
CREATE POLICY "Authenticated users can read commands"
  ON public.commands FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert commands"
  ON public.commands FOR INSERT TO authenticated
  WITH CHECK (true);

-- Commands: service role can update (for the sync script)
CREATE POLICY "Service role can update commands"
  ON public.commands FOR UPDATE TO service_role
  USING (true);

-- Indexes for performance
CREATE INDEX idx_events_timestamp ON public.events (timestamp DESC);
CREATE INDEX idx_events_agent ON public.events (agent);
CREATE INDEX idx_events_event_type ON public.events (event_type);
CREATE INDEX idx_events_project_id ON public.events (project_id);
CREATE INDEX idx_commands_status ON public.commands (status);
CREATE INDEX idx_commands_created_at ON public.commands (created_at DESC);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commands;
