'use client';

import { cn } from '@/lib/utils';
import { EquityCurve } from './EquityCurve';
import type { AlpacaAccount, AlpacaPosition } from '@/lib/alpaca/types';
import type { Factor, Allocation } from '@/lib/factors/types';

interface DashboardPanelProps {
  account: AlpacaAccount | null;
  positions: AlpacaPosition[];
  factors: Factor[];
  allocations: Allocation[];
  history: { timestamp: number[]; equity: number[]; profit_loss: number[]; profit_loss_pct: number[] } | null;
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)]">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-subtle)] font-mono">{label}</p>
      <p className="text-lg font-bold text-[var(--gb-parchment)] tabular-nums font-mono mt-0.5">{value}</p>
      {sub && (
        <p className={cn(
          'text-xs tabular-nums font-mono mt-0.5',
          positive === undefined ? 'text-[var(--text-muted)]' : positive ? 'text-emerald-400' : 'text-red-400'
        )}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function DashboardPanel({ account, positions, factors, allocations, history }: DashboardPanelProps) {
  const equity = account ? parseFloat(account.equity) : 0;
  const cash = account ? parseFloat(account.cash) : 0;
  const dayPl = account ? parseFloat(account.equity) - parseFloat(account.last_equity) : 0;
  const dayPlPct = account && parseFloat(account.last_equity) > 0
    ? ((dayPl / parseFloat(account.last_equity)) * 100)
    : 0;

  const totalAllocated = allocations.reduce((sum, a) => sum + a.percentage, 0);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Account Summary */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-[var(--text-subtle)] font-mono mb-2">Account</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Equity"
            value={`$${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />
          <StatCard
            label="Cash"
            value={`$${cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />
          <StatCard
            label="Day P&L"
            value={`${dayPl >= 0 ? '+' : ''}$${dayPl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            sub={`${dayPlPct >= 0 ? '+' : ''}${dayPlPct.toFixed(2)}%`}
            positive={dayPl >= 0}
          />
          <StatCard
            label="Buying Power"
            value={`$${account ? parseFloat(account.buying_power).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}`}
          />
        </div>
      </div>

      {/* Allocation Breakdown */}
      {allocations.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-subtle)] font-mono mb-2">Allocation</h3>
          <div className="space-y-1.5">
            {allocations.map((alloc) => {
              const factor = factors.find((f) => f.id === alloc.factorId);
              if (!factor) return null;
              return (
                <div key={alloc.id} className="flex items-center gap-2 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: factor.color }} />
                  <span className="text-[var(--gb-parchment)] truncate flex-1">{factor.name}</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{alloc.percentage}%</span>
                </div>
              );
            })}
            {100 - totalAllocated > 0 && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[var(--text-subtle)]" />
                <span className="text-[var(--text-muted)] truncate flex-1">Cash</span>
                <span className="text-[var(--text-subtle)] tabular-nums">{100 - totalAllocated}%</span>
              </div>
            )}
          </div>
          {/* Bar */}
          <div className="mt-2 h-1.5 bg-[var(--gb-azure-deep)] rounded-full overflow-hidden flex">
            {allocations.map((alloc) => {
              const factor = factors.find((f) => f.id === alloc.factorId);
              if (!factor) return null;
              return (
                <div
                  key={alloc.id}
                  className="h-full"
                  style={{ width: `${alloc.percentage}%`, backgroundColor: factor.color }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Equity Curve */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-[var(--text-subtle)] font-mono mb-2">Equity Curve</h3>
        <EquityCurve data={history} />
      </div>

      {/* Positions */}
      {positions.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-subtle)] font-mono mb-2">
            Positions ({positions.length})
          </h3>
          <div className="space-y-1">
            {positions.map((pos) => {
              const pl = parseFloat(pos.unrealized_pl);
              const plPct = parseFloat(pos.unrealized_plpc) * 100;
              return (
                <div key={pos.asset_id} className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--gb-parchment)] font-medium">{pos.symbol}</span>
                    <span className="text-[var(--text-subtle)]">{parseFloat(pos.qty).toFixed(pos.asset_class === 'crypto' ? 6 : 0)}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'tabular-nums',
                      pl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
