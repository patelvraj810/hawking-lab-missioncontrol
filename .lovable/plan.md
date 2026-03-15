

# OpenClaw Mission Control — Event Stream & Command Queue Plan

## Summary

Add two Supabase-backed systems — an **Event Stream** and a **Command Queue** — that serve as the operational backbone for Mission Control. These will be built alongside the full UI implementation since nothing has been built yet.

## Database Schema (Supabase via Lovable Cloud)

### `events` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| timestamp | timestamptz | default now() |
| agent | text | agent identifier |
| event_type | text | task_started, task_completed, task_failed, agent_assigned, project_created, memory_updated, system_alert |
| project_id | text | nullable, links to project |
| task_id | text | nullable, links to task |
| data | jsonb | arbitrary event payload |

### `commands` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| command | text | create_project, assign_agent, start_task, stop_task, update_memory |
| payload | jsonb | command parameters |
| status | text | pending, processing, completed, failed |
| created_at | timestamptz | default now() |
| executed_at | timestamptz | nullable |
| issued_by | text | user identifier |
| result | jsonb | nullable, execution result or error |

RLS: Both tables allow authenticated read/insert. Commands restrict update to service role (the sync script). Events are insert-only from the sync script side.

## Service Layer

### `src/services/events.ts`
- `subscribeToEvents(callback)` — Supabase real-time subscription on `events` table
- `fetchEvents(filters)` — query with agent/type/date filters
- `insertEvent(event)` — used by command console when generating local events

### `src/services/commands.ts`
- `submitCommand(command, payload)` — insert into `commands` with status `pending`
- `subscribeToCommandStatus(commandId, callback)` — watch for status changes
- `fetchCommandHistory(filters)` — query past commands

### `src/hooks/useEventStream.ts`
- Real-time subscription hook, returns latest events, supports filtering
- Powers Activity Timeline, System Health alerts, Agent Logs

### `src/hooks/useCommandQueue.ts`
- Submit commands, track their status
- Powers AI Command Console

## Command Console Flow

1. User types natural language in Command Console
2. Frontend parses into structured command (e.g., `create_project` + payload)
3. Inserts row into `commands` table with status `pending`
4. Local OpenClaw sync script polls `commands` for pending rows, executes them, updates status to `completed`/`failed`
5. Sync script also inserts corresponding event (e.g., `project_created`) into `events` table
6. Mission Control receives both the command status update and the new event via real-time subscriptions

## UI Integration

- **Activity Timeline**: `useEventStream` with real-time subscription, renders chronological feed
- **System Health**: Filters events for `system_alert`, `task_failed`; computes failure rates from event data
- **Agent Logs**: Filters events by agent, renders in terminal-style monospace view
- **Project History**: Filters events by project_id
- **Command Console**: Uses `useCommandQueue` to submit and track command status with visual feedback (pending spinner → success/error)

## Mock Data Strategy

Until Supabase is connected, the hooks return mock event/command data from `src/data/mock.ts` and simulate real-time updates via `setInterval`. The service layer has a `USE_MOCK` flag that swaps providers.

## Implementation Order

1. Enable Supabase (Lovable Cloud) and create both tables
2. Build service layer (`events.ts`, `commands.ts`)
3. Build hooks (`useEventStream`, `useCommandQueue`)
4. Build the full Mission Control UI (all pages from original plan) using these hooks
5. Wire Command Console to command queue
6. Wire Activity Timeline + System Health to event stream

