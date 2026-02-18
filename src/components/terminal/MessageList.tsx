'use client';

import { useEffect, useRef } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TerminalMessage {
  id: string;
  type: 'command' | 'success' | 'error' | 'info' | 'table' | 'help';
  content: string;
  timestamp: number;
  data?: unknown;
}

interface MessageListProps {
  messages: TerminalMessage[];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function MessageItem({ msg }: { msg: TerminalMessage }) {
  if (msg.type === 'command') {
    return (
      <div className="flex items-start gap-2 py-1.5">
        <ChevronRight className="w-3.5 h-3.5 text-[var(--gb-gold)] mt-0.5 flex-shrink-0" />
        <span className="text-[var(--gb-gold)] font-mono text-sm">{msg.content}</span>
        <span className="ml-auto text-[10px] text-[var(--text-subtle)] tabular-nums flex-shrink-0">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    );
  }

  if (msg.type === 'error') {
    return (
      <div className="flex items-start gap-2 py-1.5 pl-2 border-l-2 border-red-500/60">
        <X className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
        <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap flex-1">{msg.content}</pre>
      </div>
    );
  }

  if (msg.type === 'success') {
    return (
      <div className="flex items-start gap-2 py-1.5 pl-2 border-l-2 border-emerald-500/60">
        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
        <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap flex-1">{msg.content}</pre>
      </div>
    );
  }

  if (msg.type === 'help') {
    return (
      <div className="py-1.5 pl-2 border-l-2 border-[var(--gb-gold)]/40">
        <pre className="text-[var(--text-secondary)] font-mono text-sm whitespace-pre-wrap">{msg.content}</pre>
      </div>
    );
  }

  if (msg.type === 'table') {
    return (
      <div className="py-1.5 pl-2 border-l-2 border-blue-500/40">
        <pre className="text-[var(--gb-parchment)] font-mono text-xs whitespace-pre-wrap overflow-x-auto">{msg.content}</pre>
      </div>
    );
  }

  return (
    <div className="py-1.5 pl-2 border-l-2 border-[var(--text-subtle)]/30">
      <pre className="text-[var(--text-secondary)] font-mono text-sm whitespace-pre-wrap">{msg.content}</pre>
    </div>
  );
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-[var(--text-muted)] font-mono text-sm mb-2">
            Aleister Trading Terminal
          </p>
          <p className="text-[var(--text-subtle)] font-mono text-xs">
            Type &quot;help&quot; for available commands
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((msg) => (
        <MessageItem key={msg.id} msg={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
