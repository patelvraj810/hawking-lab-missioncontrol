import { useState } from 'react';
import { useMissionControl } from '@/stores/mission-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockMemory } from '@/data/mock';

export default function MemoryViewer() {
  const [tab, setTab] = useState<'workspace' | 'agent' | 'daily'>('workspace');
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const { agents } = useMissionControl();

  const filtered = mockMemory.filter(m => {
    if (m.type !== tab) return false;
    if (agentFilter !== 'all' && m.agent !== agentFilter) return false;
    if (search && !m.content.toLowerCase().includes(search.toLowerCase()) && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Memory Viewer</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">BROWSE OPENCLAW MEMORY FILES</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-surface-2 rounded-md p-0.5">
          {(['workspace', 'agent', 'daily'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize', tab === t ? 'bg-accent text-foreground' : 'text-muted-foreground')}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'agent' && (
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-foreground">
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        )}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memory..." className="pl-9 h-9 text-sm bg-surface-1" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(mem => (
          <Card key={mem.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono text-foreground">{mem.title}</CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground">{new Date(mem.timestamp).toLocaleString()}</span>
              </div>
              {mem.agent && <span className="text-[10px] text-muted-foreground">Agent: {mem.agent}</span>}
            </CardHeader>
            <CardContent>
              <pre className="bg-surface-2 rounded-md p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto leading-relaxed">{mem.content}</pre>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-mono text-sm">[ NO_DATA_FOUND ]</div>
        )}
      </div>
    </div>
  );
}
