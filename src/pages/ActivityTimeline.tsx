import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { StatusDot } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

const eventTypeConfig: Record<string, { color: string; label: string }> = {
  task_started: { color: 'bg-status-pending', label: 'TASK STARTED' },
  task_completed: { color: 'bg-status-complete', label: 'TASK COMPLETED' },
  task_failed: { color: 'bg-status-blocked', label: 'TASK FAILED' },
  agent_assigned: { color: 'bg-primary', label: 'AGENT ASSIGNED' },
  project_created: { color: 'bg-status-working', label: 'PROJECT CREATED' },
  memory_updated: { color: 'bg-muted-foreground', label: 'MEMORY UPDATED' },
  system_alert: { color: 'bg-status-blocked', label: 'SYSTEM ALERT' },
};

export default function ActivityTimeline() {
  const { events } = useMissionControl();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const types = [...new Set(events.map(e => e.event_type))];
  const filtered = typeFilter === 'all' ? events : events.filter(e => e.event_type === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Activity Timeline</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">REAL-TIME EVENT STREAM</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setTypeFilter('all')} className={cn('px-2.5 py-1 rounded text-[10px] font-mono uppercase', typeFilter === 'all' ? 'bg-accent text-foreground' : 'text-muted-foreground')}>ALL</button>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn('px-2.5 py-1 rounded text-[10px] font-mono uppercase', typeFilter === t ? 'bg-accent text-foreground' : 'text-muted-foreground')}>
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {filtered.map((evt, i) => {
            const config = eventTypeConfig[evt.event_type] || { color: 'bg-muted-foreground', label: evt.event_type };
            return (
              <div key={evt.id} className="relative pl-10 py-3 hover:bg-accent/20 transition-colors rounded-lg" style={{ animationDelay: `${i * 50}ms` }}>
                <div className={cn('absolute left-[11px] top-[18px] w-2.5 h-2.5 rounded-full border-2 border-background', config.color)} />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{evt.agent || 'System'}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{config.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(evt.data as Record<string, unknown>)?.task as string || (evt.data as Record<string, unknown>)?.message as string || (evt.data as Record<string, unknown>)?.project as string || (evt.data as Record<string, unknown>)?.memory as string || ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
