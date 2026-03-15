import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/data/mock';

const statusConfig: Record<AgentStatus, { color: string; label: string }> = {
  'idle': { color: 'bg-status-idle', label: 'IDLE' },
  'pending': { color: 'bg-status-pending', label: 'PENDING' },
  'in-progress': { color: 'bg-status-working', label: 'WORKING' },
  'blocked': { color: 'bg-status-blocked', label: 'BLOCKED' },
  'complete': { color: 'bg-status-complete', label: 'DONE' },
  'failed': { color: 'bg-status-blocked', label: 'FAILED' },
};

export function StatusDot({ status, pulse = false, className }: { status: AgentStatus; pulse?: boolean; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-block w-2 h-2 rounded-full', config.color, pulse && status === 'in-progress' && 'animate-status-pulse', className)} />
  );
}

export function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider',
      status === 'in-progress' && 'bg-status-working/15 text-status-working',
      status === 'idle' && 'bg-muted text-muted-foreground',
      status === 'pending' && 'bg-status-pending/15 text-status-pending',
      status === 'blocked' && 'bg-status-blocked/15 text-status-blocked',
      status === 'complete' && 'bg-status-complete/15 text-status-complete',
      status === 'failed' && 'bg-status-blocked/15 text-status-blocked',
    )}>
      <StatusDot status={status} pulse />
      {config.label}
    </span>
  );
}
