# Row Level Security (RLS) Policies

This document describes the Row Level Security policies configured for the Mission Control dashboard.

## Overview

Row Level Security (RLS) is enabled on all tables to ensure proper access control. The dashboard uses Supabase's authentication system with two key roles:

1. **`authenticated`** - Users who have signed in (via Supabase Auth)
2. **`service_role`** - Backend services that need elevated access (used by sync scripts)

---

## Tables and Policies

### `events` Table

Stores event stream data from OpenClaw agents.

| Policy | Role | Operation | Description |
|--------|------|-----------|-------------|
| Authenticated users can read events | `authenticated` | SELECT | All signed-in users can view events |
| Authenticated users can insert events | `authenticated` | INSERT | All signed-in users can create events |

**Notes:**
- Events are write-once (no UPDATE/DELETE policies for authenticated users)
- Service role has full access via Supabase defaults

---

### `commands` Table

Stores command queue for controlling OpenClaw agents.

| Policy | Role | Operation | Description |
|--------|------|-----------|-------------|
| Authenticated users can read commands | `authenticated` | SELECT | All signed-in users can view command history |
| Authenticated users can insert commands | `authenticated` | INSERT | All signed-in users can submit new commands |
| Service role can update commands | `service_role` | UPDATE | Only sync scripts can mark commands as executed |

**Notes:**
- Regular users cannot modify commands after creation
- Commands are processed by the sync service, which updates status and result

---

### `agents` Table

Tracks OpenClaw agent status and metrics.

| Policy | Role | Operation | Description |
|--------|------|-----------|-------------|
| Authenticated users can read agents | `authenticated` | SELECT | All signed-in users can view agent status |
| Service role can manage agents | `service_role` | ALL | Full access for sync service updates |

**Notes:**
- Only the sync service can update agent status, costs, and task counts
- Dashboard displays agent information in read-only mode

---

### `system_state` Table

Stores overall system state and metrics (singleton table).

| Policy | Role | Operation | Description |
|--------|------|-----------|-------------|
| Authenticated users can read system_state | `authenticated` | SELECT | All signed-in users can view system state |
| Service role can manage system_state | `service_role` | ALL | Full access for sync service updates |

**Notes:**
- This table contains a single row (id = 1)
- Updated by sync service to reflect current phase, revenue, etc.

---

## Security Model

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Dashboard     │────▶│    Supabase      │────▶│    Database     │
│  (anon key)     │     │   (auth layer)   │     │   (RLS policies)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Sync Service     │
                        │ (service_role)   │
                        └──────────────────┘
```

### Access Patterns

| Component | Role | Permissions |
|-----------|------|--------------|
| Dashboard (anon) | `anon` | No access (must authenticate) |
| Dashboard (auth) | `authenticated` | Read all tables, Insert events/commands |
| Sync Service | `service_role` | Full access to all tables |

---

## Public Access Configuration

For public dashboards without authentication, you can enable anon access:

```sql
-- Enable anonymous read access
CREATE POLICY "Anonymous users can read events"
  ON public.events FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anonymous users can read agents"
  ON public.agents FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anonymous users can read system_state"
  ON public.system_state FOR SELECT TO anon
  USING (true);
```

**⚠️ Warning:** Only enable anon access if you intend the dashboard to be publicly viewable.

---

## Real-time Subscriptions

Real-time is enabled for tables that need live updates:

| Table | Real-time | Events |
|-------|-----------|--------|
| `events` | ✅ Yes | INSERT (new events appear automatically) |
| `commands` | ✅ Yes | UPDATE (status changes reflected in real-time) |
| `agents` | ✅ Yes | All changes (status updates) |
| `system_state` | ❌ No | Polling is sufficient |

---

## Testing RLS Policies

To verify policies work correctly:

```sql
-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM events;      -- Should return rows
INSERT INTO events (event_type) VALUES ('test');  -- Should succeed
UPDATE events SET event_type = 'modified';  -- Should fail (no policy)

-- Test as anon (if anon policies exist)
SET ROLE anon;
SELECT * FROM events;      -- Depends on anon policies

-- Reset role
RESET ROLE;
```

---

## Migration History

1. **Initial Migration** (`20260315164206`) - Created events and commands tables with RLS
2. **Additional Tables** (`20260315170000`) - Added agents and system_state tables with RLS