import { useMissionControl } from '@/stores/mission-control';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { healthMetrics, mockCostData, costByModel } from '@/data/mock';
import { AlertTriangle, Activity, DollarSign, Cpu } from 'lucide-react';

export default function HealthDashboard() {
  const { systemState, agents } = useMissionControl();

  const idleAgents = agents.filter(a => a.status === 'idle');
  const blockedAgents = agents.filter(a => a.status === 'blocked');
  const totalCost = mockCostData.reduce((sum, c) => sum + c.cost, 0);

  // Cost by agent
  const costByAgent = agents.map(a => ({
    agent: a.name,
    cost: mockCostData.filter(c => c.agent === a.name).reduce((sum, c) => sum + c.cost, 0),
  })).filter(c => c.cost > 0).sort((a, b) => b.cost - a.cost);

  // Cost over time
  const costOverTime = [...new Set(mockCostData.map(c => c.date))].sort().map(date => ({
    date: date.slice(5),
    cost: mockCostData.filter(c => c.date === date).reduce((sum, c) => sum + c.cost, 0),
  }));

  const alerts = [
    ...(blockedAgents.length > 0 ? blockedAgents.map(a => ({ severity: 'error' as const, message: `Agent ${a.name} is blocked: ${a.currentTask}` })) : []),
    ...(systemState.failureRate > 2 ? [{ severity: 'warning' as const, message: `Task failure rate elevated: ${systemState.failureRate}%` }] : []),
    ...(systemState.avgLatency > 300 ? [{ severity: 'warning' as const, message: `API latency above threshold: ${systemState.avgLatency}ms` }] : []),
    ...(idleAgents.length > 3 ? [{ severity: 'info' as const, message: `${idleAgents.length} agents currently idle` }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">System Health</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">MONITORING & COST TRACKING</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${alert.severity === 'error' ? 'bg-destructive/5 border-destructive/20 text-destructive' : alert.severity === 'warning' ? 'bg-status-working/5 border-status-working/20 text-status-working' : 'bg-muted border-border text-muted-foreground'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Health KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="API Calls (24h)" value={systemState.apiCalls24h.toLocaleString()} icon={<Activity className="w-4 h-4" />} />
        <MetricCard label="Avg Latency" value={`${systemState.avgLatency}ms`} icon={<Cpu className="w-4 h-4" />} />
        <MetricCard label="Failure Rate" value={`${systemState.failureRate}%`} trend={{ value: 0.5, positive: false }} />
        <MetricCard label="Total AI Cost" value={`$${totalCost.toFixed(2)}`} icon={<DollarSign className="w-4 h-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">API Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={healthMetrics.latency}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="ms" stroke="hsl(43 96% 56%)" strokeWidth={2} dot={{ fill: 'hsl(43 96% 56%)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">API Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={healthMetrics.apiUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Cost by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={costByAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="agent" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} width={50} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar dataKey="cost" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Cost Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={costOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: 'hsl(240 6% 6%)', border: '1px solid hsl(240 4% 14%)', borderRadius: '6px', fontSize: '12px' }} formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Line type="monotone" dataKey="cost" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ fill: 'hsl(217 91% 60%)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Usage */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Cost by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costByModel.map(m => (
              <div key={m.model} className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground w-40">{m.model}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(m.cost / totalCost) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-20 text-right">${m.cost.toFixed(2)}</span>
                <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">{(m.tokens / 1000).toFixed(0)}K tok</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
