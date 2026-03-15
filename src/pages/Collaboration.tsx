import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collaborationEdges } from '@/data/mock';
import { cn } from '@/lib/utils';

export default function Collaboration() {
  const { agents } = useMissionControl();

  // Build adjacency for display
  const agentMap = new Map(agents.map(a => [a.name, a]));

  // Unique agents involved
  const involvedNames = [...new Set([...collaborationEdges.map(e => e.from), ...collaborationEdges.map(e => e.to)])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Collaboration Graph</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">AGENT WORKFLOW NETWORK</p>
      </div>

      {/* Simple visual graph representation */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Workflow Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[400px] p-8">
            {/* Render agents in a circle */}
            {involvedNames.map((name, i) => {
              const angle = (i / involvedNames.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 160;
              const cx = 50 + Math.cos(angle) * 35;
              const cy = 50 + Math.sin(angle) * 35;
              const agent = agentMap.get(name);
              return (
                <div
                  key={name}
                  className={cn(
                    'absolute w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all',
                    agent?.status === 'in-progress' ? 'border-status-working bg-status-working/10 animate-agent-glow' :
                    agent?.status === 'blocked' ? 'border-status-blocked bg-status-blocked/10' :
                    'border-border bg-surface-2'
                  )}
                  style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${name}: ${agent?.currentTask || 'Idle'}`}
                >
                  <span className="text-lg">{agent?.avatar || '🤖'}</span>
                  <span className="text-[8px] font-mono text-foreground mt-0.5">{name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edge list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Task Flow Relationships</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {collaborationEdges.map((edge, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-xs font-medium text-foreground w-16">{edge.from}</span>
              <span className="text-xs text-primary font-mono">→</span>
              <span className="text-xs font-medium text-foreground w-16">{edge.to}</span>
              <span className="text-[10px] text-muted-foreground font-mono flex-1">{edge.task}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
