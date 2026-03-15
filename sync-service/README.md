# OpenClaw Mission Control Sync Service

A Node.js + TypeScript service that syncs OpenClaw state to Supabase in real-time.

## Features

- **File Watching**: Monitors `~/.openclaw` files for changes using chokidar
- **Event Emission**: Pushes change events to Supabase `events` table
- **Command Polling**: Polls Supabase `commands` table for pending commands
- **Command Execution**: Executes commands by updating OpenClaw files

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Or build and run in production mode
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `OPENCLAW_HOME` | OpenClaw config directory | `~/.openclaw` |
| `POLL_INTERVAL_MS` | Command polling interval | `2000` |
| `DEBOUNCE_MS` | File change debounce | `500` |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Home (~/.openclaw)              │
│  ┌──────────────────────┐    ┌──────────────────────┐       │
│  │ workspace/state.json │    │ agents/*/task.json   │       │
│  └─────────┬────────────┘    └─────────┬────────────┘       │
│            │                           │                     │
│            └───────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│                 ┌──────────────┐                             │
│                 │ File Watcher │                             │
│                 │  (chokidar)  │                             │
│                 └──────┬───────┘                             │
│                        │                                     │
│                        ▼                                     │
│               ┌─────────────────┐                            │
│               │ Event Emitter   │                            │
│               │ (transform)     │                            │
│               └────────┬────────┘                            │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase                                │
│  ┌─────────────┐         ┌──────────────┐                   │
│  │   events    │         │   commands   │                   │
│  │   table     │         │    table     │                   │
│  └─────────────┘         └──────┬───────┘                   │
│                                 │                           │
│                                 │ (poll)                    │
│                                 ▼                           │
│                         ┌─────────────────┐                 │
│                         │ Command Handler │                 │
│                         │ (execute)       │                 │
│                         └────────┬────────┘                 │
│                                  │                          │
└──────────────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                           ┌─────────────┐
                           │ Update      │
                           │ OpenClaw    │
                           │ files       │
                           └─────────────┘
```

## Event Types

| Event | Description |
|-------|-------------|
| `sync_started` | Service started |
| `sync_error` | Error occurred |
| `agent_status_changed` | Agent task.json updated |
| `system_state_updated` | state.json changed |
| `command_executed` | Command processed |

## Command Types

| Command | Payload | Description |
|---------|---------|-------------|
| `create_project` | `{ id, name, ... }` | Create/update project in state.json |
| `update_agent_task` | `{ agent, task, status, ... }` | Update agent task.json |
| `assign_agent` | `{ agent, projectId }` | Assign agent to project |

## Database Schema

### events table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  agent TEXT,
  data JSONB NOT NULL,
  metadata JSONB
);
```

### commands table
```sql
CREATE TABLE commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  command_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  executed_at TIMESTAMPTZ
);
```

## Development

```bash
# Watch mode with auto-reload
npm run watch

# Build TypeScript
npm run build
```

## Logs

The service logs to stdout with timestamps:

```
[SyncService] Starting OpenClaw Sync Service...
[FileWatcher] Starting watcher for paths:
  - ~/.openclaw/workspace/state.json
  - ~/.openclaw/agents/*/task.json
[EventEmitter] Emitted event: sync_started system
[SyncService] ✅ Service started successfully
```

## License

MIT