import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { cn } from '@/lib/utils';

// Office layout: simple grid-based desk positions
const deskPositions: Record<string, { x: number; y: number; area: string }> = {
  'agent-001': { x: 15, y: 20, area: 'Command Center' },
  'agent-002': { x: 35, y: 20, area: 'Dev Bay Alpha' },
  'agent-003': { x: 55, y: 20, area: 'Research Lab' },
  'agent-004': { x: 75, y: 20, area: 'Ops Room' },
  'agent-005': { x: 15, y: 50, area: 'Design Studio' },
  'agent-006': { x: 35, y: 50, area: 'QA Zone' },
  'agent-007': { x: 55, y: 50, area: 'Content Room' },
  'agent-008': { x: 75, y: 50, area: 'Security Vault' },
  'agent-009': { x: 15, y: 80, area: 'Performance Lab' },
  'agent-010': { x: 35, y: 80, area: 'Data Center' },
  'agent-011': { x: 55, y: 80, area: 'ML Lab' },
  'agent-012': { x: 75, y: 80, area: 'Dev Bay Beta' },
};

const statusRing: Record<string, string> = {
  'in-progress': 'ring-2 ring-status-working shadow-[0_0_12px_hsl(var(--status-working)/0.4)]',
  'idle': 'ring-1 ring-status-idle',
  'pending': 'ring-1 ring-status-pending',
  'blocked': 'ring-2 ring-status-blocked shadow-[0_0_8px_hsl(var(--status-blocked)/0.3)]',
  'complete': 'ring-1 ring-status-complete',
  'failed': 'ring-2 ring-status-blocked',
};

export default function OfficeMap() {
  const { agents } = useMissionControl();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Agent Office Map</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">VIRTUAL OFFICE VISUALIZATION</p>
      </div>

      <div className="relative bg-surface-1 border border-border rounded-xl overflow-hidden" style={{ height: '600px' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(hsl(240 4% 30%) 1px, transparent 1px), linear-gradient(90deg, hsl(240 4% 30%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Area labels */}
        {Object.entries(
          Object.entries(deskPositions).reduce((acc, [id, pos]) => {
            if (!acc[pos.area]) acc[pos.area] = pos;
            return acc;
          }, {} as Record<string, { x: number; y: number }>)
        ).map(([area, pos]) => (
          <div key={area} className="absolute text-[9px] font-mono text-muted-foreground/40 uppercase tracking-wider" style={{ left: `${pos.x}%`, top: `${pos.y - 8}%`, transform: 'translateX(-50%)' }}>
            {area}
          </div>
        ))}

        {/* Agent avatars */}
        {agents.map(agent => {
          const pos = deskPositions[agent.id];
          if (!pos) return null;
          const isHovered = hoveredAgent === agent.id;

          return (
            <div key={agent.id} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
              {/* Desk */}
              <div className="absolute -inset-4 bg-surface-2 rounded-lg opacity-30" />

              {/* Avatar */}
              <button
                className={cn(
                  'relative w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-xl transition-all cursor-pointer',
                  statusRing[agent.status],
                  agent.status === 'in-progress' && 'animate-agent-glow',
                )}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {agent.avatar}
              </button>

              {/* Name */}
              <div className="text-center mt-1">
                <span className="text-[9px] font-mono text-foreground">{agent.name}</span>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-48 bg-surface-1 border border-border rounded-lg p-3 shadow-xl pointer-events-none">
                  <div className="text-xs font-medium text-foreground">{agent.name}</div>
                  <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">Model: {agent.model}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">Status: {agent.status}</div>
                  {agent.currentTask && (
                    <div className="text-[10px] text-primary mt-1 truncate">Task: {agent.currentTask}</div>
                  )}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-surface-1 border-r border-b border-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
