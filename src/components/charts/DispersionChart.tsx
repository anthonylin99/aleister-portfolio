'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SMAData } from '@/types/sma';
import { cn } from '@/lib/utils';
import { Plus, Eye, Loader2, Check, Pencil } from 'lucide-react';

interface DispersionChartProps {
  data: SMAData[];
  maxDeviation?: number; // For scaling, auto-calculated if not provided
  onAddToPortfolio?: (ticker: string) => Promise<void>;
  onAddToWatchlist?: (ticker: string) => Promise<void>;
}

export function DispersionChart({ data, maxDeviation, onAddToPortfolio, onAddToWatchlist }: DispersionChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] py-12">
        No data available
      </div>
    );
  }

  // Calculate max deviation for scaling if not provided
  const max =
    maxDeviation ||
    Math.max(...data.map((d) => Math.abs(d.deviation)), 10);

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <DispersionBar
          key={item.ticker}
          item={item}
          maxDeviation={max}
          onAddToPortfolio={onAddToPortfolio}
          onAddToWatchlist={onAddToWatchlist}
        />
      ))}
    </div>
  );
}

interface DispersionBarProps {
  item: SMAData;
  maxDeviation: number;
  onAddToPortfolio?: (ticker: string) => Promise<void>;
  onAddToWatchlist?: (ticker: string) => Promise<void>;
}

type ActionState = 'idle' | 'loading' | 'success';

function DispersionBar({ item, maxDeviation, onAddToPortfolio, onAddToWatchlist }: DispersionBarProps) {
  const [portfolioState, setPortfolioState] = useState<ActionState>('idle');
  const [watchlistState, setWatchlistState] = useState<ActionState>('idle');

  const isNegative = item.deviation < 0;
  const absDeviation = Math.abs(item.deviation);
  const barWidth = Math.min((absDeviation / maxDeviation) * 100, 100);

  const handleAddToPortfolio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToPortfolio || portfolioState !== 'idle') return;

    setPortfolioState('loading');
    try {
      await onAddToPortfolio(item.ticker);
      setPortfolioState('success');
      setTimeout(() => setPortfolioState('idle'), 2000);
    } catch {
      setPortfolioState('idle');
    }
  };

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToWatchlist || watchlistState !== 'idle') return;

    setWatchlistState('loading');
    try {
      await onAddToWatchlist(item.ticker);
      setWatchlistState('success');
      setTimeout(() => setWatchlistState('idle'), 2000);
    } catch {
      setWatchlistState('idle');
    }
  };

  return (
    <div className="flex items-center gap-3 group hover:bg-[var(--gb-azure-deep)]/30 rounded-lg p-2 -mx-2 transition-colors">
      {/* Ticker - clickable to view/edit */}
      <Link
        href={`/holdings/${item.ticker}`}
        className="w-16 text-sm font-mono font-semibold text-[var(--gb-parchment)] shrink-0 hover:text-[var(--gb-gold)] transition-colors"
      >
        {item.ticker}
      </Link>

      {/* Bar chart centered at 0 */}
      <div className="flex-1 flex items-center h-8">
        {/* Left side (negative/below SMA) */}
        <div className="flex-1 flex justify-end">
          {isNegative && (
            <div
              className="h-6 rounded-l-md bg-gradient-to-l from-red-500 to-red-600 transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          )}
        </div>

        {/* Center line (0%) */}
        <div className="w-px h-8 bg-slate-600 shrink-0" />

        {/* Right side (positive/above SMA) */}
        <div className="flex-1 flex justify-start">
          {!isNegative && (
            <div
              className="h-6 rounded-r-md bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          )}
        </div>
      </div>

      {/* Deviation % */}
      <div
        className={cn(
          'w-20 text-right text-sm font-mono shrink-0',
          isNegative ? 'text-red-400' : 'text-emerald-400'
        )}
      >
        {isNegative ? '' : '+'}
        {item.deviation.toFixed(1)}%
      </div>

      {/* Price vs SMA on hover */}
      <div className="w-32 text-right text-xs text-[var(--text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block">
        ${item.currentPrice.toFixed(2)} / ${item.sma.toFixed(2)}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Edit button - always shown */}
        <Link
          href={`/holdings/${item.ticker}`}
          className="p-1.5 rounded-md text-xs font-medium transition-all bg-[var(--gb-azure)]/50 text-[var(--text-secondary)] hover:bg-slate-600/50 hover:text-[var(--gb-parchment)]"
          title="View & Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Link>
        {onAddToPortfolio && (
          <button
            onClick={handleAddToPortfolio}
            disabled={portfolioState !== 'idle'}
            className={cn(
              'p-1.5 rounded-md text-xs font-medium transition-all',
              portfolioState === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-[var(--gb-gold)]/20 text-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/80/30'
            )}
            title="Add to Portfolio"
          >
            {portfolioState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : portfolioState === 'success' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        {onAddToWatchlist && (
          <button
            onClick={handleAddToWatchlist}
            disabled={watchlistState !== 'idle'}
            className={cn(
              'p-1.5 rounded-md text-xs font-medium transition-all',
              watchlistState === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            )}
            title="Add to Watchlist"
          >
            {watchlistState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : watchlistState === 'success' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Header component with scale labels
export function DispersionChartHeader({ maxDeviation = 20 }: { maxDeviation?: number }) {
  return (
    <div className="flex items-center gap-3 px-2 mb-2 text-xs text-[var(--text-subtle)]">
      <div className="w-16 shrink-0">Ticker</div>
      <div className="flex-1 flex items-center">
        <div className="flex-1 text-right pr-2">-{maxDeviation.toFixed(0)}%</div>
        <div className="w-px h-3 bg-slate-600" />
        <div className="flex-1 text-left pl-2">+{maxDeviation.toFixed(0)}%</div>
      </div>
      <div className="w-20 text-right shrink-0">Deviation</div>
      <div className="w-32 shrink-0 hidden sm:block" />
    </div>
  );
}
