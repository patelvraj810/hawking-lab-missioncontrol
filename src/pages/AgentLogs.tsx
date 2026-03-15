import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simulated log entries per agent
const agentLogs: Record<string, { time: string; message: string; level: 'info' | 'warn' | 'error' | 'success' }[]> = {
  Steve: [
    { time: '14:30:01', message: 'Starting task: Build REST API endpoints', level: 'info' },
    { time: '14:30:05', message: 'Installing dependencies...', level: 'info' },
    { time: '14:30:12', message: 'npm install completed (4.2s)', level: 'success' },
    { time: '14:30:15', message: 'Generating user endpoints...', level: 'info' },
    { time: '14:31:02', message: 'POST /api/users — created', level: 'success' },
    { time: '14:31:08', message: 'GET /api/users/:id — created', level: 'success' },
    { time: '14:31:45', message: 'Running integration tests...', level: 'info' },
    { time: '14:32:10', message: '12/12 tests passed', level: 'success' },
  ],
  Sage: [
    { time: '14:25:00', message: 'Starting task: Train recommendation model', level: 'info' },
    { time: '14:25:05', message: 'Loading dataset (1.2M records)...', level: 'info' },
    { time: '14:26:30', message: 'Data preprocessing complete', level: 'success' },
    { time: '14:27:00', message: 'Training epoch 1/10 — loss: 0.453', level: 'info' },
    { time: '14:35:00', message: 'Training epoch 2/10 — loss: 0.321', level: 'info' },
    { time: '14:43:00', message: 'Warning: GPU memory usage at 85%', level: 'warn' },
  ],
  Rex: [
    { time: '14:20:00', message: 'Starting task: API test environment setup', level: 'info' },
    { time: '14:20:10', message: 'Docker compose configured', level: 'success' },
    { time: '14:20:30', message: 'ERROR: Port 8080 conflict with existing service', level: 'error' },
    { time: '14:20:35', message: 'Waiting for DevOps resolution...', level: 'warn' },
    { time: '14:20:40', message: 'Task status: BLOCKED', level: 'error' },
  ],
  Luna: [
    { time: '14:05:00', message: 'Starting task: Design onboarding flow', level: 'info' },
    { time: '14:05:10', message: 'Analyzing competitor onboarding patterns...', level: 'info' },
    { time: '14:10:00', message: 'Research complete — 5 patterns identified', level: 'success' },
    { time: '14:15:00', message: 'Creating wireframes...', level: 'info' },
    { time: '14:25:00', message: 'Wireframe draft 1 complete', level: 'success' },
  ],
  Bolt: [
    { time: '14:00:00', message: 'Starting task: Optimize database queries', level: 'info' },
    { time: '14:00:30', message: 'Running EXPLAIN ANALYZE on slow queries...', level: 'info' },
    { time: '14:02:00', message: 'Identified 3 slow queries (>500ms)', level: 'warn' },
    { time: '14:05:00', message: 'Added index on users.email — 340ms → 12ms', level: 'success' },
    { time: '14:10:00', message: 'Rewriting join query on tasks table...', level: 'info' },
  ],
  Pixel: [
    { time: '14:10:00', message: 'Starting task: Implement dashboard components', level: 'info' },
    { time: '14:10:05', message: 'Creating KPI card component...', level: 'info' },
    { time: '14:12:00', message: 'KPI cards done — 4 variants', level: 'success' },
    { time: '14:15:00', message: 'Building line chart component...', level: 'info' },
    { time: '14:20:00', message: 'Line chart with tooltips done', level: 'success' },
    { time: '14:22:00', message: 'Working on bar charts...', level: 'info' },
  ],
};

export default function AgentLogs() {
  const { agents } = useMissionControl();
  const [selectedAgent, setSelectedAgent] = useState<string>('Steve');
  const [search, setSearch] = useState('');

  const logs = agentLogs[selectedAgent] || [];
  const filtered = search ? logs.filter(l => l.message.toLowerCase().includes(search.toLowerCase())) : logs;

  const levelColors = {
    info: 'text-muted-foreground',
    warn: 'text-status-working',
    error: 'text-destructive',
    success: 'text-status-complete',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Agent Logs</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">EXECUTION LOG VIEWER</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 overflow-x-auto">
          {agents.filter(a => agentLogs[a.name]).map(a => (
            <button key={a.id} onClick={() => setSelectedAgent(a.name)} className={cn('px-3 py-1.5 rounded text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5', selectedAgent === a.name ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <span>{a.avatar}</span> {a.name}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 h-9 text-sm bg-surface-1" />
        </div>
      </div>

      <Card className="bg-surface-0 border-border">
        <CardContent className="p-0">
          <div className="bg-surface-2 px-4 py-2 border-b border-border flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{selectedAgent.toLowerCase()}@openclaw</span>
            <span className="text-xs font-mono text-primary">~</span>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto space-y-1">
            {filtered.map((log, i) => (
              <div key={i} className="flex gap-3 font-mono text-[11px] leading-relaxed">
                <span className="text-muted-foreground/50 shrink-0">{log.time}</span>
                <span className={cn(levelColors[log.level])}>{log.message}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 font-mono text-xs text-muted-foreground">[ NO_LOGS_FOUND ]</div>
            )}
            <div className="flex gap-3 font-mono text-[11px] text-primary animate-status-pulse mt-2">
              <span className="text-muted-foreground/50">{'>'}</span>
              <span>█</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
