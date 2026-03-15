-- Migration: Fix RLS policies for Mission Control sync service
-- Purpose: Allow anon key to write events and read commands for dashboard sync

-- =============================================================================
-- Events Table Policies
-- =============================================================================

-- Allow anon key to insert events (for sync service)
CREATE POLICY "Allow anon to insert events"
  ON public.events FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon key to read events (for dashboard)
CREATE POLICY "Allow anon to read events"
  ON public.events FOR SELECT TO anon
  USING (true);

-- =============================================================================
-- Commands Table Policies
-- =============================================================================

-- Allow anon key to insert commands (from dashboard)
CREATE POLICY "Allow anon to insert commands"
  ON public.commands FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon key to read commands (for sync service and dashboard)
CREATE POLICY "Allow anon to read commands"
  ON public.commands FOR SELECT TO anon
  USING (true);

-- Allow anon key to update commands (for sync service status updates)
CREATE POLICY "Allow anon to update commands"
  ON public.commands FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Enable Realtime for Dashboard
-- =============================================================================

-- Enable realtime for events table (for live dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Enable realtime for commands table
ALTER PUBLICATION supabase_realtime ADD TABLE public.commands;

-- =============================================================================
-- Notes
-- =============================================================================
-- For production, you may want to use service_role key for the sync service
-- and keep anon key more restricted. This setup allows the anon key (which is
-- safe to expose in frontend) to handle all operations for now.
--
-- To use service_role:
-- 1. Create a separate backend service with SUPABASE_SERVICE_KEY env var
-- 2. Remove the anon policies above
-- 3. Keep only service_role policies