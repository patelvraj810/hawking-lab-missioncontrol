import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/data/mock';

type ViewMode = 'kanban' | 'list';
const kanbanColumns: { status: AgentStatus; label: string }[] = [
  { status: 'pending', label: 'BACKLOG' },
  { status: 'in-progress', label: 'IN PROGRESS' },
  { status: 'complete', label: 'DONE' },
  { status: 'blocked', label: 'BLOCKED' },
];

const priorityColors: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-status-working/15 text-status-working border-status-working/30',
  medium: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  low: 'bg-muted text-muted-foreground border-border',
};

export default function Projects() {
  const { projects, tasks, agents } = useMissionControl();
  const [view, setView] = useState<ViewMode>('kanban');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);
  const getAgent = (id: string) => agents.find(a => a.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Projects</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">{projects.length} ACTIVE PROJECTS</p>
        </div>
        <div className="flex gap-1 bg-surface-2 rounded-md p-0.5">
          <button onClick={() => setView('kanban')} className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors', view === 'kanban' ? 'bg-accent text-foreground' : 'text-muted-foreground')}>Kanban</button>
          <button onClick={() => setView('list')} className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors', view === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground')}>List</button>
        </div>
      </div>

      {/* Project Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {projects.map(p => (
          <button key={p.id} onClick={() => setSelectedProject(p.id)} className={cn('px-3 py-2 rounded-lg border text-left shrink-0 transition-colors', selectedProject === p.id ? 'border-primary/30 bg-accent' : 'border-border bg-card hover:border-primary/20')}>
            <div className="text-xs font-medium text-foreground">{p.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.progress}% — {p.completedTasks}/{p.taskCount} tasks</div>
          </button>
        ))}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = projectTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] font-mono text-muted-foreground">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <Card key={task.id} className="bg-card border-border hover:border-primary/20 transition-colors">
                      <CardContent className="p-3 space-y-2">
                        <h4 className="text-xs font-medium text-foreground">{task.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn('text-[9px] font-mono', priorityColors[task.priority])}>{task.priority}</Badge>
                          <span className="text-[10px] text-muted-foreground">{getAgent(task.assignedAgent)?.name || task.assignedAgent}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 border border-dashed border-border rounded-lg text-center">
                      <span className="text-[10px] font-mono text-muted-foreground">[ EMPTY ]</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_120px_80px_100px_100px] gap-2 px-4 py-2 border-b border-border text-[10px] font-mono text-muted-foreground uppercase">
              <span>Task</span><span>Agent</span><span>Priority</span><span>Status</span><span>Dependencies</span>
            </div>
            {projectTasks.map(task => (
              <div key={task.id} className="grid grid-cols-[1fr_120px_80px_100px_100px] gap-2 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-accent/30 transition-colors">
                <div>
                  <span className="text-xs text-foreground">{task.title}</span>
                  <p className="text-[10px] text-muted-foreground truncate">{task.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{getAgent(task.assignedAgent)?.name}</span>
                <Badge variant="outline" className={cn('text-[9px] font-mono w-fit', priorityColors[task.priority])}>{task.priority}</Badge>
                <StatusBadge status={task.status} />
                <span className="text-[10px] font-mono text-muted-foreground">{task.dependencies.length > 0 ? task.dependencies.join(', ') : '—'}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
