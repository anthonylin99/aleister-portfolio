'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { usePortfolioViewing } from '@/lib/portfolio-context';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

/**
 * Header - Granblue Skyfarer portfolio header
 *
 * Design:
 * - Cinzel serif for title and value (like a ship's nameplate)
 * - Gold gradient text on hover
 * - Parchment-colored text hierarchy
 * - Crystal blue/gold glow accents
 */

interface HeaderProps {
  title: string;
  subtitle?: string;
  totalValue?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: string;
}

export function Header({
  title,
  subtitle,
  totalValue,
  change = 0,
  changePercent = 0,
  lastUpdated
}: HeaderProps) {
  const isPositive = change >= 0;
  const { isVisible } = useVisibility();
  const { isViewingOther } = usePortfolioViewing();

  return (
    <header className="mb-8 relative">
      {/* Subtle gold glow behind header */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[var(--gb-gold)]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Title Section */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--gb-parchment)] tracking-tight hover:glow-text-stripe transition-all cursor-default font-cinzel">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--text-secondary)] text-lg mt-1 font-medium font-cinzel">{subtitle}</p>
          )}
        </div>

        {/* Portfolio Value Section */}
        {totalValue !== undefined && (
          <div className="flex flex-col lg:items-end gap-3 animate-fade-in-up delay-100">
            <div className="flex items-baseline gap-4">
              {isViewingOther ? (
                <span className="text-2xl lg:text-3xl font-bold text-[var(--text-subtle)] italic font-cinzel">
                  Percentages only
                </span>
              ) : (
                <span className="text-4xl lg:text-5xl font-bold text-[var(--gb-parchment)] tabular-nums tracking-tight font-cinzel">
                  {isVisible ? formatCurrency(totalValue) : '$------'}
                </span>
              )}

              {/* Performance Badge - Ornate pill */}
              <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border
                ${isPositive
                  ? 'bg-[var(--positive)]/12 text-[var(--positive)] border-[var(--positive)]/25'
                  : 'bg-[var(--negative)]/12 text-[var(--negative)] border-[var(--negative)]/25'
                }
              `}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="tabular-nums">
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Day Change Amount */}
            {!isViewingOther && change !== 0 && (
              <div className={`
                text-sm font-medium flex items-center gap-1
                ${isPositive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}
              `}>
                <span className="text-[var(--text-subtle)]">Today:</span>
                <span className="tabular-nums">
                  {isVisible
                    ? `${isPositive ? '+' : ''}${formatCurrency(change)}`
                    : '------'
                  }
                </span>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-[var(--text-subtle)] text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatDate(lastUpdated)}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gb-gold)] animate-pulse" />
                <span className="text-[var(--gb-gold)] text-xs font-medium font-cinzel">Scrying</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
