import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pause, RotateCcw, ArrowRightLeft, Send, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/data/mock';

const statusFilters: AgentStatus[] = ['in-progress', 'pending', 'idle', 'blocked', 'complete', 'failed'];

export default function AgentCommand() {
  const { agents, updateAgentStatus } = useMissionControl();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AgentStatus | 'all'>('all');

  const filtered = agents.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Agent Command Center</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{agents.length} AGENTS REGISTERED</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="pl-9 h-9 text-sm bg-surface-1" />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setFilterStatus('all')} className={cn('px-2.5 py-1 rounded text-[10px] font-mono uppercase', filterStatus === 'all' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}>ALL</button>
          {statusFilters.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn('px-2.5 py-1 rounded text-[10px] font-mono uppercase', filterStatus === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(agent => (
          <Card key={agent.id} className={cn(
            'bg-card border-border transition-all hover:border-primary/20',
            agent.status === 'in-progress' && 'animate-agent-glow'
          )}>
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="text-xl">{agent.avatar}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{agent.role}</p>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground font-mono">MODEL</span>
                  <span className="text-foreground font-mono">{agent.model}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground font-mono">TASKS</span>
                  <span className="text-foreground font-mono">{agent.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground font-mono">COST</span>
                  <span className="text-foreground font-mono">${agent.costTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="p-2 bg-surface-2 rounded-md">
                  <p className="text-[10px] text-muted-foreground font-mono">CURRENT TASK</p>
                  <p className="text-xs text-foreground mt-0.5 truncate">{agent.currentTask}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">{agent.lastActivity}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateAgentStatus(agent.id, 'idle', null)}>
                    <Pause className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateAgentStatus(agent.id, 'in-progress', agent.currentTask)}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRightLeft className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Send className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
