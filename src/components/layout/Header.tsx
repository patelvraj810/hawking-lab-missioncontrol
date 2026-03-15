import { useMissionControl } from '@/stores/mission-control';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { systemState, autonomousMode } = useMissionControl();

  return (
    <header className="h-14 border-b border-border bg-surface-1 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-mono text-muted-foreground tracking-wider uppercase">MISSION CONTROL</h2>
        <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
          {systemState.phase}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>{systemState.tasksTodayCompleted}/{systemState.tasksTodayTotal} TASKS</span>
          <span className="text-border">|</span>
          <span>${systemState.monthlyRevenue.toLocaleString()} MRR</span>
        </div>
        {autonomousMode && (
          <Badge className="bg-status-working/15 text-status-working border-status-working/30 text-[10px] font-mono animate-status-pulse">
            AUTO
          </Badge>
        )}
      </div>
    </header>
  );
}
