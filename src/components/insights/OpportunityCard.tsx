'use client';

import { cn } from '@/lib/utils';
import type { Opportunity } from '@/types/insights';
import { Lightbulb, TrendingDown, TrendingUp, Percent, Zap } from 'lucide-react';
import Link from 'next/link';

interface OpportunityCardProps {
  opportunities: Opportunity[];
}

export function OpportunityCard({ opportunities }: OpportunityCardProps) {
  if (opportunities.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-semibold text-[var(--gb-parchment)]">Opportunities</h3>
        </div>
        <p className="text-[var(--text-muted)] text-sm">No clear opportunities detected right now. Check back later.</p>
      </div>
    );
  }

  const getOpportunityIcon = (type: Opportunity['type']) => {
    switch (type) {
      case 'dip_buy':
        return <TrendingDown className="w-5 h-5 text-emerald-400" />;
      case 'take_profit':
        return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case 'rebalance':
        return <Percent className="w-5 h-5 text-[#D4AF37]" />;
      case 'momentum_entry':
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTypeLabel = (type: Opportunity['type']) => {
    switch (type) {
      case 'dip_buy':
        return 'Dip Buy';
      case 'take_profit':
        return 'Take Profit';
      case 'rebalance':
        return 'Rebalance';
      case 'momentum_entry':
        return 'Momentum Entry';
    }
  };

  const getTypeColor = (type: Opportunity['type']) => {
    switch (type) {
      case 'dip_buy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'take_profit':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'rebalance':
        return 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30';
      case 'momentum_entry':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
        <h3 className="text-lg font-semibold text-[var(--gb-parchment)]">Opportunities</h3>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp, i) => (
          <div
            key={`${opp.type}-${i}`}
            className={cn(
              'p-4 rounded-xl border',
              getTypeColor(opp.type)
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              {getOpportunityIcon(opp.type)}
              <span className="font-semibold text-[var(--gb-parchment)]">{getTypeLabel(opp.type)}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{opp.rationale}</p>
            <div className="flex flex-wrap gap-2">
              {opp.tickers.slice(0, 5).map(ticker => (
                <Link
                  key={ticker}
                  href={`/holdings/${ticker}`}
                  className="px-2.5 py-1 rounded-md bg-[var(--gb-azure-deep)]/80 text-sm font-medium text-[var(--gb-parchment)] hover:bg-[var(--gb-azure)]/80 transition-colors"
                >
                  {ticker}
                </Link>
              ))}
              {opp.tickers.length > 5 && (
                <span className="px-2.5 py-1 rounded-md bg-[var(--gb-azure-deep)]/50 text-sm text-[var(--text-muted)]">
                  +{opp.tickers.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
