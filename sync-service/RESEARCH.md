# OpenClaw-to-Supabase Sync Architecture Research

**Author:** Dustin (Researcher Agent)  
**Date:** 2026-03-15  
**Status:** Complete  

---

## Executive Summary

This document outlines the complete architecture for syncing OpenClaw's file-based state to Supabase for real-time dashboard visibility and bidirectional command execution. The sync bridge enables the Mission Control Dashboard to display live agent activity and allows the dashboard to issue commands that modify OpenClaw state.

---

## 1. OpenClaw State Analysis

### 1.1 Global State File (`~/.openclaw/workspace/state.json`)

**Purpose:** Central state tracking for all OpenClaw operations

**Location:** `~/.openclaw/workspace/state.json`

**JSON Schema:**
```json
{
  "last_updated": "ISO-8601 datetime",
  "current_phase": "integer",
  "phase_name": "string",
  "phase_target": "string (e.g., '$5,000/month')",
  "active_jobs": ["string (job name)"],
  "pipeline_queue": ["string (queued items)"],
  "initiative": {
    "name": "string",
    "phase": "string",
    "started": "ISO-8601 datetime",
    "status": "string",
    "research_complete": "boolean",
    "planning_complete": "boolean",
    "ideas_count": "integer",
    "projects_complete": ["string (project IDs)"],
    "current_focus": "string"
  },
  "agents": {
    "<agent_name>": {
      "status": "string (pending|in-progress|complete|failed)",
      "current_task": "string | null"
    }
  },
  "revenue": {
    "total_earned": "number",
    "this_month": "number",
    "last_month": "number",
    "jobs_completed": "integer",
    "five_star_reviews": "integer"
  }
}
```

**Key Fields for Sync:**
- `last_updated` — timestamp for conflict resolution
- `agents` — real-time agent status display
- `initiative` — project progress tracking
- `revenue` — financial metrics

### 1.2 Agent Task Files (`~/.openclaw/agents/*/task.json`)

**Purpose:** Individual agent task assignments and progress

**Location Pattern:** `~/.openclaw/agents/{agent_name}/task.json`

**JSON Schema:**
```json
{
  "agent": "string (agent name)",
  "role": "string (agent role)",
  "status": "string (pending|in-progress|complete|failed|blocked)",
  "task": "string (full task description with objectives)",
  "assigned_by": "string (agent who assigned)",
  "skills": ["string (required skills)"],
  "lastUpdated": "ISO-8601 datetime"
}
```

**Known Agents:**
- `eleven` — Captain (Coordinator)
- `nova` — PM
- `dustin` — Scout (Researcher)
- `lucas` — Closer
- `steve` — Builder
- `max` — Reviewer (Developer)
- `will` — Designer
- `robin` — Writer (Integration)
- `mike` — Comms (Support)

### 1.3 Memory Files (Optional, Lower Priority)

**Global Memory:** `~/.openclaw/workspace/MEMORY.md` — Project-wide context
**Agent Memory:** `~/.openclaw/agents/*/MEMORY.md` — Agent-specific context

**Format:** Markdown (not JSON)

**Sync Strategy:** These are lower priority. Could be:
1. Synced as text content with timestamps
2. Omitted from initial implementation
3. Added as a separate "context" table later

---

## 2. Supabase Schema Verification

### 2.1 Existing Tables

#### `events` Table

**Purpose:** Append-only event log for all state changes

**Schema (from types.ts):**
```typescript
{
  id: string,              // UUID primary key
  event_type: string,      // Event type identifier
  timestamp: string,      // ISO-8601 datetime
  agent: string | null,   // Agent that triggered event
  project_id: string | null,  // Associated project
  task_id: string | null,     // Associated task
  data: Json | null       // Flexible event payload
}
```

**Event Types to Emit:**
- `agent_status_changed` — Agent task.json updated
- `system_state_updated` — Global state.json changed
- `command_executed` — Dashboard command processed
- `sync_started` — Sync service initialized
- `sync_error` — Error occurred during sync
- `agent_assigned` — New task assigned to agent
- `project_created` — New project in initiative

**Verdict:** ✅ Schema is adequate for all sync requirements.

#### `commands` Table

**Purpose:** Queue for dashboard-to-OpenClaw commands

**Schema (from types.ts):**
```typescript
{
  id: string,              // UUID primary key
  command: string,         // Command type identifier
  status: string,          // pending|processing|completed|failed
  payload: Json | null,    // Command parameters
  issued_by: string | null,// User or agent who issued
  created_at: string,      // ISO-8601 datetime
  executed_at: string | null  // Execution timestamp
  result: Json | null      // Execution result/error
}
```

**Command Types to Support:**
- `create_project` — Add project to state.json
- `update_agent_task` — Update agent task.json
- `assign_agent` — Assign agent to project
- `pause_agent` — Set agent status to pending
- `set_phase` — Update phase in state.json

**Verdict:** ✅ Schema supports all required operations.

### 2.2 Schema Additions Needed

**No additional tables required for initial implementation.**

**Recommended for Future (Phase 2):**

```sql
-- Agent state snapshot (for efficient querying)
CREATE TABLE agent_state (
  agent_name TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  current_task TEXT,
  last_updated TIMESTAMPTZ NOT NULL,
  task_json JSONB
);

-- Projects tracking
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  metadata JSONB
);

-- Sync health monitoring
CREATE TABLE sync_heartbeat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  message TEXT
);
```

---

## 3. Sync Strategy Recommendations

### 3.1 File Watching Approach

**Recommendation: Chokidar**

**Rationale:**
- Cross-platform reliability (macOS, Linux, Windows)
- Handles recursive watching efficiently
- Built-in debouncing options
- Better edge case handling than native `fs.watch`

**Implementation:**
```typescript
import chokidar from 'chokidar';

const watcher = chokidar.watch([
  path.expand('~/.openclaw/workspace/state.json'),
  path.expand('~/.openclaw/agents/*/task.json')
], {
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 500,  // Wait for write to complete
    pollInterval: 100
  }
});
```

### 3.2 Debounce Strategy

**Problem:** File saves can trigger multiple rapid events, especially with atomic writes.

**Solution:** 
1. Use chokidar's `awaitWriteFinish` for initial debouncing
2. Add application-level debounce for state.json (global changes affect multiple things)
3. Agent task files don't need additional debouncing

**Recommended Settings:**
```typescript
// state.json — 500ms debounce (global state changes)
// task.json — No debounce needed (single agent updates)
```

### 3.3 Conflict Resolution

**Read-Modify-Write Pattern:**

```
┌──────────────────────────────────────────────────────────┐
│ CONFLICT SCENARIOS                                        │
├──────────────────────────────────────────────────────────┤
│ Scenario 1: File modified during read                     │
│   Solution: Re-read file, apply changes, retry           │
│                                                           │
│ Scenario 2: Concurrent Supabase updates                   │
│   Solution: Events table is append-only — no conflict     │
│                                                           │
│ Scenario 3: Command executes while file changes           │
│   Solution: File change wins, command logs warning       │
│                                                           │
│ Scenario 4: Network partition during sync                │
│   Solution: Queue events locally, retry on reconnect    │
└──────────────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
async function safeUpdateFile<T>(
  filePath: string,
  updater: (current: T) => T,
  maxRetries = 3
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const current = JSON.parse(await fs.readFile(filePath));
      const updated = updater(current);
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
      return;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(100 * (i + 1)); // Exponential backoff
    }
  }
}
```

### 3.4 Real-time Subscription Architecture

**For Dashboard Real-time Updates:**

Supabase supports real-time subscriptions via PostgreSQL logical replication.

**On Sync Service (Backend):**
- No subscription needed — it's the writer
- Just push events to `events` table

**On Dashboard (Frontend):**
```typescript
// Subscribe to all events
supabase
  .channel('events-channel')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'events' },
    (payload) => handleNewEvent(payload.new)
  )
  .subscribe();

// Subscribe to command status changes
supabase
  .channel('commands-channel')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'commands' },
    (payload) => handleCommandUpdate(payload.new)
  )
  .subscribe();
```

### 3.5 Error Handling & Retry Logic

**Error Categories:**

| Category | Handling | Retry |
|----------|----------|-------|
| File read error | Log, continue | Next watch cycle |
| File parse error | Log warning, skip | Next write |
| Supabase connection error | Queue locally | Exponential backoff |
| Supabase write error | Retry 3x | 100ms → 200ms → 400ms |
| Command execution error | Log to result field | No retry |

**Retry Configuration:**
```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 100,  // ms
  maxDelay: 5000,  // ms
  backoffMultiplier: 2
};
```

---

## 4. Command Execution Model

### 4.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMAND EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   Dashboard  │     │   Supabase   │     │  Sync Service│
  │   (Frontend) │     │   (Backend)  │     │   (Backend)  │
  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
         │                    │                    │
         │ 1. Insert command  │                    │
         │   status='pending' │                    │
         │───────────────────>│                    │
         │                    │                    │
         │                    │ 2. Poll every 2s  │
         │                    │<───────────────────│
         │                    │                    │
         │                    │ 3. Return pending  │
         │                    │───────────────────>│
         │                    │                    │
         │                    │                    │ 4. Process command
         │                    │                    │    - Validate
         │                    │                    │    - Update files
         │                    │                    │    - Handle result
         │                    │                    │
         │                    │ 5. Update status   │
         │                    │    + result        │
         │                    │<───────────────────│
         │                    │                    │
         │ 6. Real-time update│                    │
         │<───────────────────│                    │
         │                    │                    │
```

### 4.2 Command Validation

**Security Considerations:**

```typescript
const ALLOWED_COMMANDS = {
  create_project: {
    requiredFields: ['name'],
    optionalFields: ['description', 'priority'],
    validate: (payload) => {
      if (!payload.name || payload.name.length < 3) {
        return { valid: false, error: 'Project name must be >= 3 chars' };
      }
      return { valid: true };
    }
  },
  update_agent_task: {
    requiredFields: ['agent', 'task', 'status'],
    validate: (payload) => {
      if (!VALID_AGENTS.includes(payload.agent)) {
        return { valid: false, error: `Unknown agent: ${payload.agent}` };
      }
      return { valid: true };
    }
  },
  assign_agent: {
    requiredFields: ['agent', 'project'],
    validate: (payload) => {
      if (!VALID_AGENTS.includes(payload.agent)) {
        return { valid: false, error: `Unknown agent: ${payload.agent}` };
      }
      return { valid: true };
    }
  }
};
```

### 4.3 Status Tracking

**Command Lifecycle:**

```
pending → processing → completed
                     ↘ failed
```

**Status Definitions:**
- `pending` — Command inserted, awaiting processing
- `processing` — Sync service has picked up command
- `completed` — Command executed successfully
- `failed` — Command execution failed (error in result)

### 4.4 Audit Logging

**All commands create events:**

```typescript
// On command completion
await supabase.from('events').insert({
  event_type: 'command_executed',
  agent: 'sync-service',
  data: {
    command_id: command.id,
    command: command.command,
    payload: command.payload,
    result: command.result,
    issued_by: command.issued_by
  },
  timestamp: new Date().toISOString()
});
```

**Event Retention:**
- Events are append-only (never deleted)
- Consider adding retention policy after 90 days
- Archive to cold storage if needed

---

## 5. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OPENCLAW SYNC ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│        OPENCLAW SYSTEM          │     │         SUPABASE CLOUD           │
│                                 │     │                                 │
│  ┌───────────────┐              │     │  ┌───────────────┐              │
│  │  state.json   │◄─────────────┼─────┼──│ events table  │              │
│  │  (global)     │              │     │  │ (append-only) │              │
│  └───────┬───────┘              │     │  └───────┬───────┘              │
│          │                       │     │          │                       │
│  ┌───────┴───────┐   ┌──────────┐ │     │  ┌───────┴───────┐              │
│  │  eleven/      │   │   SYNC   │ │     │  │ commands tbl │              │
│  │  task.json    │──►│  SERVICE │─┼─────┼─►│ (queue)      │              │
│  ├───────────────┤   │          │ │     │  └───────────────┘              │
│  │  dustin/      │   │ ┌──────┐ │ │     │                                 │
│  │  task.json    │──►│ │watch │ │ │     │  ┌───────────────┐              │
│  ├───────────────┤   │ │files │ │ │     │  │ Realtime API │              │
│  │  max/         │   │ └──────┘ │ │     │  │ (websockets) │              │
│  │  task.json    │──►│          │ │     │  └───────┬───────┘              │
│  ├───────────────┤   │ ┌──────┐ │ │     │          │                       │
│  │  ... other    │   │ │poll  │◄┼─┼─────┼──────────┘                       │
│  │  agents...    │   │ │cmds  │ │ │     │                                 │
│  └───────────────┘   │ └──────┘ │ │     └─────────────────────────────────┘
│                      │          │ │
│                      │ ┌──────┐ │ │
│                      │ │write │ │ │     ┌─────────────────────────────────┐
│                      │ │files │◄┼─┼─────│       MISSION CONTROL           │
│                      │ └──────┘ │ │     │         DASHBOARD              │
│                      └──────────┘ │     │                                 │
│                                   │     │  ┌────────────────────────────┐ │
└───────────────────────────────────┘     │  │ React + Supabase Client   │ │
                                          │  └────────────────────────────┘ │
                                          │              │                  │
                                          │              │                  │
                                          │  ┌───────────▼────────────┐     │
                                          │  │ Subscribe to:          │     │
                                          │  │ - events INSERT        │     │
                                          │  │ - commands UPDATE      │     │
                                          │  └────────────────────────┘     │
                                          │                                 │
                                          └─────────────────────────────────┘
```

---

## 6. Implementation Recommendations

### 6.1 Project Structure

```
mission-control-sync/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── src/
│   ├── index.ts              # Entry point, graceful shutdown
│   ├── sync-service.ts       # Main orchestrator
│   ├── file-watcher.ts       # Chokidar wrapper
│   ├── supabase-client.ts    # Supabase connection
│   ├── event-emitter.ts      # Event transformation & emission
│   ├── command-handler.ts    # Command polling & execution
│   ├── conflict-resolver.ts  # File update safety
│   └── types.ts              # TypeScript interfaces
├── scripts/
│   ├── start.sh             # Production startup
│   └── dev.sh               # Development with watch
└── tests/
    ├── file-watcher.test.ts
    ├── command-handler.test.ts
    └── integration.test.ts
```

### 6.2 Environment Variables

```bash
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  # Service role key (backend only!)

# Optional
OPENCLAW_HOME=~/.openclaw  # Default: ~/.openclaw
SYNC_INTERVAL_MS=2000       # Command polling interval
DEBOUNCE_MS=500             # File change debounce
LOG_LEVEL=info              # debug, info, warn, error
```

### 6.3 TypeScript Types

```typescript
// types.ts

export interface AgentTask {
  agent: string;
  role: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed' | 'blocked';
  task: string;
  assigned_by: string;
  skills: string[];
  lastUpdated: string;
}

export interface SystemState {
  last_updated: string;
  current_phase: number;
  phase_name: string;
  phase_target: string;
  active_jobs: string[];
  pipeline_queue: string[];
  initiative: Initiative;
  agents: Record<string, AgentStatus>;
  revenue: Revenue;
}

export interface SyncEvent {
  event_type: string;
  agent: string | null;
  project_id: string | null;
  task_id: string | null;
  data: Record<string, unknown>;
  timestamp: string;
}

export type CommandStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Command {
  id: string;
  command: string;
  status: CommandStatus;
  payload: Record<string, unknown> | null;
  issued_by: string | null;
  created_at: string;
  executed_at: string | null;
  result: Record<string, unknown> | null;
}
```

### 6.4 Startup Sequence

```
1. Load environment variables
2. Validate Supabase connection
3. Initialize file watchers
4. Start command poller
5. Emit 'sync_started' event
6. Begin event loop
```

### 6.5 Graceful Shutdown

```
1. Stop accepting new file events
2. Complete in-progress commands
3. Flush event queue to Supabase
4. Emit 'sync_stopped' event
5. Close Supabase connection
6. Exit with status 0
```

---

## 7. Security Considerations

### 7.1 Authentication

**Supabase:**
- Use Service Role Key for sync service (backend)
- Use Anon Key for dashboard (frontend)
- Never expose Service Role Key to frontend

### 7.2 Command Authorization

**Validation Layers:**
1. Dashboard validates user input before inserting command
2. Sync service re-validates before execution
3. File updates protected by safe update pattern

### 7.3 Data Exposure

**What to sync:**
- ✅ Agent names, statuses, tasks
- ✅ Project names, phases, progress
- ✅ Revenue metrics (aggregated)

**What NOT to sync:**
- ❌ API keys or secrets
- ❌ File system paths
- ❌ User credentials

### 7.4 Rate Limiting

**Supabase Built-in:**
- 500 requests/second per client
- 10 concurrent connections

**Sync Service:**
- Batch events where possible
- Debounce rapid file changes
- Queue commands during high load

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// Test file watcher
describe('FileWatcher', () => {
  it('should detect state.json changes');
  it('should detect agent task.json changes');
  it('should debounce rapid changes');
  it('should handle file deletion gracefully');
});

// Test event emitter
describe('EventEmitter', () => {
  it('should transform state changes to events');
  it('should include correct timestamps');
  it('should handle parse errors');
});

// Test command handler
describe('CommandHandler', () => {
  it('should poll pending commands');
  it('should validate command payloads');
  it('should execute valid commands');
  it('should reject invalid commands');
  it('should update command status');
});
```

### 8.2 Integration Tests

```typescript
describe('SyncService Integration', () => {
  it('should sync file change to Supabase event');
  it('should execute dashboard command');
  it('should handle concurrent updates');
  it('should recover from connection loss');
});
```

### 8.3 Manual Testing Checklist

- [ ] Start sync service, verify startup event
- [ ] Modify state.json, verify event appears
- [ ] Modify agent task.json, verify event appears
- [ ] Issue command from dashboard, verify execution
- [ ] Disconnect network, verify retry logic
- [ ] Check dashboard receives real-time updates

---

## 9. Performance Estimates

| Metric | Estimate |
|--------|----------|
| File change detection latency | < 100ms |
| Event emission latency | < 200ms |
| Command pickup latency | < 2000ms (poll interval) |
| Total sync latency (file → dashboard) | < 2500ms |
| Memory footprint | ~50-100MB |
| CPU usage (idle) | < 1% |

---

## 10. Summary & Next Steps

### Summary

- **File Structure:** Documented all OpenClaw JSON schemas
- **Supabase Schema:** Verified `events` and `commands` tables are sufficient
- **Sync Strategy:** Chokidar for watching, 500ms debounce, poll commands every 2s
- **Command Model:** Status tracking, validation, audit logging
- **Architecture:** Clear separation between OpenClaw files, sync service, and Supabase

### Recommendations for Max (Developer)

1. Start with `sync-service.ts` as the main orchestrator
2. Implement file watcher first (simplest path)
3. Add command polling after file sync is stable
4. Use environment variables for all configuration
5. Add comprehensive logging for debugging

### Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "chokidar": "^3.5.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vitest": "^0.34.0",
    "@types/node": "^20.8.0"
  }
}
```

---

**Research Complete. Ready for Max to begin implementation.**