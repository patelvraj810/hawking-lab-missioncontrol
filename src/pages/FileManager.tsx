import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockFiles = [
  { id: 'f1', name: 'api-endpoints.ts', type: 'Code', agent: 'Steve', project: 'Mobile Productivity App', size: '4.2 KB', timestamp: '2026-03-15T14:30:00Z' },
  { id: 'f2', name: 'onboarding-wireframes.fig', type: 'Assets', agent: 'Luna', project: 'Mobile Productivity App', size: '2.1 MB', timestamp: '2026-03-15T14:25:00Z' },
  { id: 'f3', name: 'api-documentation.md', type: 'Documents', agent: 'Aria', project: 'Documentation Portal', size: '12.8 KB', timestamp: '2026-03-15T14:00:00Z' },
  { id: 'f4', name: 'model-v2.pkl', type: 'Assets', agent: 'Sage', project: 'AI SaaS Platform', size: '156 MB', timestamp: '2026-03-15T13:30:00Z' },
  { id: 'f5', name: 'market-research.md', type: 'Reports', agent: 'Nova', project: 'AI SaaS Platform', size: '8.4 KB', timestamp: '2026-03-15T13:00:00Z' },
  { id: 'f6', name: 'ci-pipeline.yml', type: 'Code', agent: 'Max', project: 'Mobile Productivity App', size: '1.8 KB', timestamp: '2026-03-14T16:00:00Z' },
  { id: 'f7', name: 'security-audit-report.pdf', type: 'Reports', agent: 'Zed', project: 'Security Audit System', size: '340 KB', timestamp: '2026-03-14T15:00:00Z' },
  { id: 'f8', name: 'query-optimization.sql', type: 'Code', agent: 'Bolt', project: 'AI SaaS Platform', size: '2.4 KB', timestamp: '2026-03-14T14:00:00Z' },
];

const typeColors: Record<string, string> = {
  Code: 'bg-primary/15 text-primary border-primary/30',
  Reports: 'bg-status-working/15 text-status-working border-status-working/30',
  Documents: 'bg-status-complete/15 text-status-complete border-status-complete/30',
  Assets: 'bg-muted text-muted-foreground border-border',
};

export default function FileManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">File & Artifact Manager</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">AGENT-GENERATED OUTPUTS</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_80px_120px_140px_80px_120px] gap-2 px-4 py-2 border-b border-border text-[10px] font-mono text-muted-foreground uppercase">
            <span>File</span><span>Type</span><span>Agent</span><span>Project</span><span>Size</span><span>Modified</span>
          </div>
          {mockFiles.map(file => (
            <div key={file.id} className="grid grid-cols-[1fr_80px_120px_140px_80px_120px] gap-2 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-accent/30 transition-colors cursor-pointer">
              <span className="text-xs text-foreground font-mono">{file.name}</span>
              <Badge variant="outline" className={`text-[9px] font-mono w-fit ${typeColors[file.type]}`}>{file.type}</Badge>
              <span className="text-xs text-muted-foreground">{file.agent}</span>
              <span className="text-[10px] text-muted-foreground truncate">{file.project}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{file.size}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{new Date(file.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
