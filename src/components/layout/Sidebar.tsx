import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMissionControl } from '@/stores/mission-control';
import {
  LayoutDashboard, Bot, FolderKanban, ListChecks, Brain,
  Activity, Clock, Terminal, Network, Map, FileCode, HeartPulse,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: ListChecks, label: 'Tasks' },
  { to: '/logs', icon: Terminal, label: 'Agent Logs' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/system', icon: Activity, label: 'System State' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/collaboration', icon: Network, label: 'Collaboration' },
  { to: '/office', icon: Map, label: 'Office Map' },
  { to: '/files', icon: FileCode, label: 'Files' },
  { to: '/health', icon: HeartPulse, label: 'Health' },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, autonomousMode, setAutonomousMode, systemState } = useMissionControl();

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar flex flex-col transition-all duration-200',
      sidebarCollapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && <span className="font-semibold text-sm tracking-tight text-foreground">OPENCLAW</span>}
      </div>

      {/* System Status Mini */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-status-pulse" />
            <span className="font-mono">{systemState.onlineAgents}/{systemState.totalAgents} ONLINE</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1">
            UPTIME {systemState.uptime}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Autonomous Mode Toggle */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => setAutonomousMode(!autonomousMode)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
              autonomousMode
                ? 'bg-status-working/10 text-status-working'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full', autonomousMode ? 'bg-status-working animate-status-pulse' : 'bg-muted-foreground')} />
            {autonomousMode ? 'AUTONOMOUS' : 'MANUAL MODE'}
          </button>
        </div>
      )}

      {/* Collapse Button */}
      <div className="px-3 py-2 border-t border-border">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground transition-colors">
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
