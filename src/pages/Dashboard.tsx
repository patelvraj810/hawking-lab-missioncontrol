import { useMissionControl } from '@/stores/mission-control';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusDot } from '@/components/shared/StatusBadge';
import { Bot, FolderKanban, ListChecks, Activity, DollarSign, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productivityData } from '@/data/mock';

export default function Dashboard() {
  const { agents, projects, tasks, systemState, events } = useMissionControl();

  const activeAgents = agents.filter(a => a.status === 'in-progress').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">SYSTEM_READY // {systemState.onlineAgents} AGENTS_ONLINE</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Active Agents" value={activeAgents} subtitle={`of ${agents.length}`} icon={<Bot className="w-4 h-4" />} />
        <MetricCard label="Projects" value={activeProjects} subtitle="active" icon={<FolderKanban className="w-4 h-4" />} />
        <MetricCard label="In Progress" value={inProgressTasks} subtitle="tasks" icon={<ListChecks className="w-4 h-4" />} />
        <MetricCard label="Uptime" value={systemState.uptime} icon={<Activity className="w-4 h-4" />} />
        <MetricCard label="MRR" value={`$${systemState.monthlyRevenue.toLocaleString()}`} trend={{ value: 12, positive: true }} icon={<DollarSign className="w-4 h-4" />} />
        <MetricCard label="Throughput" value={`${systemState.tasksTodayCompleted}/${systemState.tasksTodayTotal}`} subtitle="today" icon={<Zap className="w-4 h-4" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="tasks" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="tasks" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {events.slice(0, 10).map(evt => (
              <div key={evt.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <StatusDot status={evt.event_type === 'task_failed' ? 'failed' : evt.event_type === 'task_completed' ? 'complete' : evt.event_type === 'system_alert' ? 'blocked' : 'in-progress'} className="mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{evt.agent || 'System'}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{evt.event_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {(evt.data as Record<string, unknown>)?.task as string || (evt.data as Record<string, unknown>)?.message as string || (evt.data as Record<string, unknown>)?.project as string || ''}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground truncate">{proj.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{proj.progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
