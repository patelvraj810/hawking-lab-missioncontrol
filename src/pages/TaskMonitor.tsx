import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { RotateCcw, XCircle, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TaskMonitor() {
  const { tasks, agents } = useMissionControl();
  const [filter, setFilter] = useState<string>('all');
  const getAgent = (id: string) => agents.find(a => a.id === id);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Task Execution Monitor</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">LIVE TASK EXECUTION // {tasks.filter(t => t.status === 'in-progress').length} RUNNING</p>
      </div>

      <div className="flex gap-1.5">
        {['all', 'in-progress', 'pending', 'complete', 'blocked', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={cn('px-2.5 py-1 rounded text-[10px] font-mono uppercase', filter === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {s.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(task => (
          <Card key={task.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><XCircle className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRightLeft className="w-3 h-3" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] mb-3">
                <div><span className="text-muted-foreground font-mono">AGENT</span><div className="text-foreground mt-0.5">{getAgent(task.assignedAgent)?.name}</div></div>
                <div><span className="text-muted-foreground font-mono">PRIORITY</span><div className="text-foreground mt-0.5 uppercase">{task.priority}</div></div>
                <div><span className="text-muted-foreground font-mono">STARTED</span><div className="text-foreground mt-0.5 font-mono">{task.startTime ? new Date(task.startTime).toLocaleTimeString() : '—'}</div></div>
                <div><span className="text-muted-foreground font-mono">COMPLETED</span><div className="text-foreground mt-0.5 font-mono">{task.completionTime ? new Date(task.completionTime).toLocaleTimeString() : '—'}</div></div>
              </div>

              {/* Logs */}
              {task.logs.length > 0 && (
                <div className="bg-surface-2 rounded-md p-3 max-h-32 overflow-y-auto">
                  {task.logs.map((log, i) => (
                    <div key={i} className="text-[11px] font-mono text-muted-foreground py-0.5">
                      <span className="text-primary/60">$</span> {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Errors */}
              {task.errors.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3 mt-2">
                  {task.errors.map((err, i) => (
                    <div key={i} className="text-[11px] font-mono text-destructive py-0.5">⚠ {err}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
