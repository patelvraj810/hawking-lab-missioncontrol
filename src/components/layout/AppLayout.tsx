import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandConsole } from './CommandConsole';
import { useMissionControl } from '@/stores/mission-control';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { sidebarCollapsed } = useMissionControl();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('transition-all duration-200', sidebarCollapsed ? 'ml-16' : 'ml-56')}>
        <Header />
        <main className="p-6 pb-24">
          <Outlet />
        </main>
      </div>
      <CommandConsole />
    </div>
  );
}
