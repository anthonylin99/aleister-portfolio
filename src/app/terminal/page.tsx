'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CommandInput } from '@/components/terminal/CommandInput';
import { MessageList, type TerminalMessage } from '@/components/terminal/MessageList';
import { DashboardPanel } from '@/components/terminal/DashboardPanel';
import type { AlpacaAccount, AlpacaPosition } from '@/lib/alpaca/types';
import type { Factor, Allocation } from '@/lib/factors/types';

type HistoryData = {
  timestamp: number[];
  equity: number[];
  profit_loss: number[];
  profit_loss_pct: number[];
} | null;

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export default function TerminalPage() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [executing, setExecuting] = useState(false);

  // Dashboard state
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [history, setHistory] = useState<HistoryData>(null);

  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshDashboard = useCallback(async () => {
    try {
      const [accRes, posRes, facRes, histRes] = await Promise.all([
        fetch('/api/alpaca/account'),
        fetch('/api/alpaca/positions'),
        fetch('/api/factors'),
        fetch('/api/alpaca/history?period=1M&timeframe=1D'),
      ]);

      if (accRes.ok) setAccount(await accRes.json());
      if (posRes.ok) setPositions(await posRes.json());
      if (facRes.ok) {
        const data = await facRes.json();
        setFactors(data.factors || []);
        setAllocations(data.allocations || []);
      }
      if (histRes.ok) setHistory(await histRes.json());
    } catch {
      // Silent fail — dashboard refresh is best-effort
    }
  }, []);

  // Initial load + 30s refresh
  useEffect(() => {
    refreshDashboard();
    refreshTimer.current = setInterval(refreshDashboard, 30000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshDashboard]);

  const addMessage = useCallback((msg: Omit<TerminalMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId(), timestamp: Date.now() }]);
  }, []);

  // Format response data into terminal-friendly text
  const formatResponse = useCallback((type: string, data: unknown, message: string): { msgType: TerminalMessage['type']; content: string } => {
    switch (type) {
      case 'account': {
        const acc = data as AlpacaAccount;
        if (!acc) return { msgType: 'success', content: message };
        const lines = [
          message,
          '',
          `  Equity:        $${parseFloat(acc.equity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          `  Cash:          $${parseFloat(acc.cash).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          `  Buying Power:  $${parseFloat(acc.buying_power).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          `  Status:        ${acc.status}`,
        ];
        return { msgType: 'table', content: lines.join('\n') };
      }

      case 'positions': {
        const pos = data as AlpacaPosition[];
        if (!pos || pos.length === 0) return { msgType: 'info', content: 'No open positions.' };
        const header = '  Symbol     Qty        Avg Entry    Current      P&L';
        const divider = '  ' + '-'.repeat(60);
        const rows = pos.map((p) => {
          const sym = p.symbol.padEnd(10);
          const qty = parseFloat(p.qty).toFixed(p.asset_class === 'crypto' ? 4 : 0).padStart(10);
          const avg = `$${parseFloat(p.avg_entry_price).toFixed(2)}`.padStart(12);
          const cur = `$${parseFloat(p.current_price).toFixed(2)}`.padStart(12);
          const pl = parseFloat(p.unrealized_pl);
          const plStr = `${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}`.padStart(10);
          return `  ${sym}${qty}${avg}${cur}${plStr}`;
        });
        return { msgType: 'table', content: [message, '', header, divider, ...rows].join('\n') };
      }

      case 'pnl': {
        const pnl = data as Array<{ symbol: string; unrealizedPl: string; unrealizedPlPct: string }>;
        if (!pnl || pnl.length === 0) return { msgType: 'info', content: 'No P&L data.' };
        const rows = pnl.map((p) => {
          const pl = parseFloat(p.unrealizedPl);
          const pct = (parseFloat(p.unrealizedPlPct) * 100).toFixed(2);
          return `  ${p.symbol.padEnd(10)} ${pl >= 0 ? '+' : ''}$${pl.toFixed(2).padStart(10)}  (${pct}%)`;
        });
        return { msgType: 'table', content: [message, '', ...rows].join('\n') };
      }

      case 'orders': {
        const orders = data as Array<{ symbol: string; side: string; qty: string; type: string; status: string }>;
        if (!orders || orders.length === 0) return { msgType: 'info', content: 'No open orders.' };
        const rows = orders.map((o) =>
          `  ${o.side.toUpperCase().padEnd(5)} ${o.symbol.padEnd(10)} ${(o.qty || '').padStart(8)} ${o.type.padEnd(8)} ${o.status}`
        );
        return { msgType: 'table', content: [message, '', ...rows].join('\n') };
      }

      case 'help':
        return { msgType: 'help', content: typeof data === 'string' ? data : message };

      case 'buy':
      case 'sell':
      case 'close':
      case 'close_all':
      case 'cancel_orders':
      case 'allocate':
      case 'reallocate':
      case 'deallocate':
      case 'rebalance':
        return { msgType: 'success', content: message };

      case 'price': {
        const trade = data as { price: string; size: number; timestamp: string } | null;
        if (!trade) return { msgType: 'info', content: message };
        return { msgType: 'success', content: `${message}\n  Price: $${parseFloat(trade.price).toFixed(2)}` };
      }

      case 'factors': {
        const facs = data as Factor[];
        if (!facs || facs.length === 0) return { msgType: 'info', content: 'No factors defined. Create one on /factors.' };
        const rows = facs.map((f) => {
          const assets = f.assets.map((a) => `${a.symbol}:${(a.weight * 100).toFixed(0)}%`).join(', ');
          return `  ${f.name.padEnd(20)} [${assets}]`;
        });
        return { msgType: 'table', content: [message, '', ...rows].join('\n') };
      }

      case 'factor_detail': {
        const f = data as Factor;
        if (!f) return { msgType: 'info', content: message };
        const assets = f.assets.map((a) => `    ${a.symbol.padEnd(10)} ${(a.weight * 100).toFixed(0)}%`);
        return { msgType: 'table', content: [`${f.name}${f.description ? ` — ${f.description}` : ''}`, '', '  Assets:', ...assets].join('\n') };
      }

      case 'history':
        return { msgType: 'success', content: message };

      case 'error':
        return { msgType: 'error', content: message };

      default:
        return { msgType: 'info', content: message };
    }
  }, []);

  const handleCommand = useCallback(async (command: string) => {
    addMessage({ type: 'command', content: command });
    setExecuting(true);

    try {
      const res = await fetch('/api/alpaca/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const json = await res.json();
      const { msgType, content } = formatResponse(json.type, json.data, json.message);
      addMessage({ type: msgType, content, data: json.data });

      // Refresh dashboard after trade/allocation commands
      if (['buy', 'sell', 'close', 'close_all', 'allocate', 'reallocate', 'deallocate', 'rebalance'].includes(json.type)) {
        setTimeout(refreshDashboard, 1000);
      }
    } catch (err) {
      addMessage({
        type: 'error',
        content: err instanceof Error ? err.message : 'Failed to execute command',
      });
    } finally {
      setExecuting(false);
    }
  }, [addMessage, formatResponse, refreshDashboard]);

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#0a0a0f]">
      {/* Left Panel — Command History */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--gb-gold-border)]/30">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--gb-gold-border)]/30 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-[var(--text-subtle)] font-mono">aleister ~ terminal</span>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input */}
        <CommandInput onSubmit={handleCommand} disabled={executing} />
      </div>

      {/* Right Panel — Live Dashboard */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-[#0a0a0f] border-l border-[var(--gb-gold-border)]/30">
        <div className="px-4 py-3 border-b border-[var(--gb-gold-border)]/30">
          <span className="text-xs text-[var(--text-subtle)] font-mono uppercase tracking-wider">Live Dashboard</span>
        </div>
        <DashboardPanel
          account={account}
          positions={positions}
          factors={factors}
          allocations={allocations}
          history={history}
        />
      </div>
    </div>
  );
}
