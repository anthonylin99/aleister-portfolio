'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatPercentagePrecise } from '@/lib/utils';
import { HoldingWithPrice } from '@/types/portfolio';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import Link from 'next/link';

interface TodaysMoversProps {
  holdings: HoldingWithPrice[];
  maxItems?: number;
}

export function TodaysMovers({ holdings, maxItems = 3 }: TodaysMoversProps) {
  const sorted = [...holdings].sort(
    (a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent)
  );

  const gainers = sorted
    .filter((h) => h.dayChangePercent > 0)
    .slice(0, maxItems);
  const losers = sorted
    .filter((h) => h.dayChangePercent < 0)
    .slice(0, maxItems);

  if (gainers.length === 0 && losers.length === 0) {
    return (
      <div className="glass-card p-5 rounded-2xl filigree-corners">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 font-cinzel">Wind Report</h3>
        <p className="text-sm text-[var(--text-muted)]">Calm skies - no significant movement</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-2xl filigree-corners">
      <h3 className="text-sm font-medium text-[var(--gb-gold)] mb-4 font-cinzel">Wind Report</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Gainers - Tailwinds */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[var(--positive)]" />
            <span className="text-xs font-medium text-[var(--positive)] font-cinzel">Tailwinds</span>
          </div>
          <div className="space-y-2">
            {gainers.length > 0 ? (
              gainers.map((h) => (
                <Link
                  key={h.ticker}
                  href={`/holdings/${h.ticker}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--gb-gold)]/5 transition-colors"
                >
                  <CompanyLogo ticker={h.ticker} domain={h.logoDomain} size="xs" />
                  <span className="text-sm font-medium text-[var(--gb-parchment)] flex-1 font-cinzel">{h.ticker}</span>
                  <span className="text-sm text-[var(--positive)] tabular-nums">
                    {formatPercentagePrecise(h.dayChangePercent)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No tailwinds today</p>
            )}
          </div>
        </div>

        {/* Losers - Headwinds */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-[var(--negative)]" />
            <span className="text-xs font-medium text-[var(--negative)] font-cinzel">Headwinds</span>
          </div>
          <div className="space-y-2">
            {losers.length > 0 ? (
              losers.map((h) => (
                <Link
                  key={h.ticker}
                  href={`/holdings/${h.ticker}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--negative)]/5 transition-colors"
                >
                  <CompanyLogo ticker={h.ticker} domain={h.logoDomain} size="xs" />
                  <span className="text-sm font-medium text-[var(--gb-parchment)] flex-1 font-cinzel">{h.ticker}</span>
                  <span className="text-sm text-[var(--negative)] tabular-nums">
                    {formatPercentagePrecise(h.dayChangePercent)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No headwinds today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
