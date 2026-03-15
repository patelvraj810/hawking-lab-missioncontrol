# OpenClaw Mission Control Dashboard

Real-time dashboard for managing OpenClaw agents, projects, and system state.

## 🚀 Live Dashboard

**URL:** https://hawking-lab-missioncontrol.lovable.app/

## Features

- **Agent Management** - View all agents, their status, current tasks, and costs
- **Activity Timeline** - Real-time event stream from OpenClaw operations
- **Command Console** - Send commands to agents and track execution
- **System State** - Monitor phase goals, revenue, and system health
- **Project Overview** - Track active projects and progress

## Architecture

```
┌─────────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   OpenClaw Agents   │─────▶│   Sync Service   │─────▶│    Supabase     │
│  ~/.openclaw/       │      │  (Node.js)       │      │   (PostgreSQL)  │
│  - state.json       │      │  - File Watcher  │      │  - events       │
│  - agents/*/task.json│      │  - Event Emitter │      │  - commands     │
└─────────────────────┘      │  - Command Poller │      └────────┬────────┘
                             └──────────────────┘               │
                                                                │
                             ┌──────────────────┐               │
                             │    Dashboard     │◀──────────────┘
                             │   (React + Vite) │
                             │  - Real-time UI  │
                             │  - Live Updates  │
                             └──────────────────┘
```

## Quick Start

### 1. Dashboard (Already Deployed)

The dashboard is live at: https://hawking-lab-missioncontrol.lovable.app/

### 2. Sync Service (Required for Real Data)

The sync service bridges your OpenClaw installation to Supabase:

```bash
# Install dependencies
cd sync-service
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the service
npm start
```

### 3. Auto-Start on Boot (Optional)

```bash
# Install PM2 globally
npm install -g pm2

# Start sync service
cd sync-service
pm2 start dist/index.js --name openclaw-sync

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup
```

## Environment Variables

### Dashboard (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_USE_MOCK=false
```

### Sync Service (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENCLAW_HOME=~/.openclaw
POLL_INTERVAL_MS=2000
DEBOUNCE_MS=500
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **UI Components:** Radix UI, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Real-time)
- **Sync Service:** Node.js, Chokidar (file watching)

## Database Schema

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  agent TEXT,
  project_id TEXT,
  task_id TEXT,
  data JSONB DEFAULT '{}'::jsonb
);
```

### Commands Table
```sql
CREATE TABLE commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_by TEXT,
  result JSONB,
  executed_at TIMESTAMPTZ
);
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

MIT

## Credits

Built with [Lovable](https://lovable.dev/) • Powered by OpenClaw