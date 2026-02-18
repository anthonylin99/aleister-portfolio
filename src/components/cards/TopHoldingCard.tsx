'use client';

import Link from 'next/link';
import { HoldingWithPrice, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

/**
 * TopHoldingCard - "Relic Card" with magical aura
 *
 * Granblue Design:
 * - Gold border frame with filigree corners
 * - Green/Red magical aura for profit/loss
 * - SSR sparkle effect on high performers (>3% daily)
 * - Cinzel font for values
 * - Hover: lift + golden drop-shadow
 */

interface TopHoldingCardProps {
  holding: HoldingWithPrice;
  rank: number;
  portfolioPercentage: number;
}

export function TopHoldingCard({ holding, rank, portfolioPercentage }: TopHoldingCardProps) {
  const color = categoryColors[holding.category];
  const isPositive = holding.dayChangePercent >= 0;
  const isSSR = Math.abs(holding.dayChangePercent) > 3;
  const { isVisible } = useVisibility();

  return (
    <Link
      href={`/holdings/${holding.ticker}`}
      className={cn(
        "holding-card relative block group animate-fade-in-up filigree-corners",
        isPositive ? "positive" : "negative",
        isSSR && "ssr-sparkle"
      )}
    >
      {/* Gold gradient border on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-[var(--gb-gold)]/60 via-[var(--gb-gold-light)]/30 to-[var(--gb-gold)]/60">
          <div className="w-full h-full rounded-xl bg-[var(--bg-secondary)]" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header with logo and rank */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CompanyLogo ticker={holding.ticker} domain={holding.logoDomain} size="lg" />
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-[var(--bg-primary)] shadow-lg border border-[var(--gb-gold-dark)] font-cinzel"
                style={{
                  background: `linear-gradient(135deg, var(--gb-gold), var(--gb-gold-light))`,
                }}
              >
                {rank}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[var(--gb-parchment)] group-hover:text-[var(--gb-gold)] transition-colors flex items-center gap-1 font-cinzel">
                {holding.ticker}
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-[var(--text-muted)] truncate max-w-[120px]">
                {holding.name}
              </p>
            </div>
          </div>
        </div>

        {/* Value and change */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums tracking-tight font-cinzel">
              {isVisible ? formatCurrency(holding.value) : '$------'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={cn(
              "flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "text-[var(--positive)] bg-[var(--positive)]/10"
                : "text-[var(--negative)] bg-[var(--negative)]/10"
            )}>
              {isPositive
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {formatPercentagePrecise(holding.dayChangePercent)}
            </span>
            <span className="text-[var(--text-muted)] tabular-nums font-medium">
              {formatPercentage(portfolioPercentage)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[var(--gb-gold-border)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
          <span>{isVisible ? `${holding.shares.toLocaleString()} shares` : '---- shares'}</span>
          <span className="tabular-nums">
            {isVisible && Number.isFinite(holding.currentPrice)
              ? `$${holding.currentPrice.toFixed(2)}`
              : '$----'
            }
          </span>
        </div>
      </div>
    </Link>
  );
}
