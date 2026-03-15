import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMissionControl } from '@/stores/mission-control';
import { submitCommand } from '@/services/commands';

const COMMAND_PATTERNS: { pattern: RegExp; command: string; extract: (m: RegExpMatchArray) => Record<string, unknown> }[] = [
  { pattern: /create (?:a )?project (?:for |called |named )?(.+)/i, command: 'create_project', extract: m => ({ name: m[1] }) },
  { pattern: /assign (\w+)(?: and (\w+))? to (.+)/i, command: 'assign_agent', extract: m => ({ agents: [m[1], m[2]].filter(Boolean), target: m[3] }) },
  { pattern: /start (?:task )?(.+)/i, command: 'start_task', extract: m => ({ task: m[1] }) },
  { pattern: /stop (?:task )?(.+)/i, command: 'stop_task', extract: m => ({ task: m[1] }) },
];

function parseCommand(input: string): { command: string; payload: Record<string, unknown> } | null {
  for (const { pattern, command, extract } of COMMAND_PATTERNS) {
    const match = input.match(pattern);
    if (match) return { command, payload: extract(match) };
  }
  return null;
}

export function CommandConsole() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addCommand, addEvent } = useMissionControl();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!input.trim()) { setPreview(null); return; }
    const parsed = parseCommand(input);
    setPreview(parsed ? `→ ${parsed.command}(${JSON.stringify(parsed.payload)})` : null);
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || status === 'processing') return;
    const parsed = parseCommand(input);
    if (!parsed) { setStatus('error'); setTimeout(() => setStatus('idle'), 2000); return; }

    setStatus('processing');
    try {
      const cmd = await submitCommand(parsed.command, parsed.payload);
      addCommand(cmd);

      // Simulate execution for mock mode
      setTimeout(() => {
        const updatedCmd = { ...cmd, status: 'completed' as const, executed_at: new Date().toISOString(), result: { success: true } };
        addEvent({
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent: null,
          event_type: parsed.command === 'create_project' ? 'project_created' : 'agent_assigned',
          project_id: null,
          task_id: null,
          data: parsed.payload,
        });
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setInput(''); }, 1500);
      }, 1000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-lg backdrop-blur-sm"
      >
        <Terminal className="w-4 h-4" />
        <span className="font-mono text-xs">⌘K — Command Console</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl">
      <div className="bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden">
        {preview && (
          <div className="px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground bg-surface-2">
            {preview}
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <Terminal className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setOpen(false); }}
            placeholder="Type a command... e.g., 'Create a project for mobile app'"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
          />
          <div className="flex items-center gap-2">
            {status === 'processing' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-4 h-4 text-status-complete" />}
            {status === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
            <button
              onClick={handleSubmit}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <Send className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="px-4 py-1.5 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>ESC to close</span>
          <span>ENTER to execute</span>
        </div>
      </div>
    </div>
  );
}
