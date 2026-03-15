import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusDot } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Cpu } from 'lucide-react';

export default function SystemState() {
  const { systemState, agents, projects } = useMissionControl();

  const statusBreakdown = {
    'in-progress': agents.filter(a => a.status === 'in-progress').length,
    'idle': agents.filter(a => a.status === 'idle').length,
    'pending': agents.filter(a => a.status === 'pending').length,
    'blocked': agents.filter(a => a.status === 'blocked').length,
    'complete': agents.filter(a => a.status === 'complete').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">System State</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">STATE.JSON VISUALIZATION</p>
      </div>

      {/* Phase */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Current Phase</h2>
              <Badge variant="outline" className="text-[10px] font-mono mt-1">{systemState.phase}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {systemState.phaseGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-4 h-4 rounded bg-surface-2 flex items-center justify-center text-[10px] font-mono text-primary">{i + 1}</span>
                {goal}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Revenue" value={`$${systemState.totalRevenue.toLocaleString()}`} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Monthly Revenue" value={`$${systemState.monthlyRevenue.toLocaleString()}`} trend={{ value: 12, positive: true }} />
        <MetricCard label="Active Projects" value={systemState.activeProjects} icon={<Users className="w-4 h-4" />} />
        <MetricCard label="Online Agents" value={`${systemState.onlineAgents}/${systemState.totalAgents}`} icon={<Cpu className="w-4 h-4" />} />
      </div>

      {/* Agent Status Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <StatusDot status={status as any} />
                <span className="text-xs text-muted-foreground font-mono uppercase w-24">{status.replace('-', ' ')}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(count / agents.length) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Active Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
              <div>
                <h4 className="text-xs font-medium text-foreground">{p.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.assignedAgents.length} agents • {p.completedTasks}/{p.taskCount} tasks</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{p.progress}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
