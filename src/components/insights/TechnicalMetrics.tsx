'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { TechnicalSignal, SignalStrength } from '@/types/insights';
import { Activity, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import Link from 'next/link';

interface TechnicalMetricsProps {
  signals: TechnicalSignal[];
}

export function TechnicalMetrics({ signals }: TechnicalMetricsProps) {
  // Initialize as null to prevent infinite re-render loop
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync selectedTicker when signals change (e.g., on initial load or refresh)
  useEffect(() => {
    if (signals.length > 0) {
      // Only update if current selection is invalid or null
      const isValidSelection = selectedTicker && signals.some(s => s.ticker === selectedTicker);
      if (!isValidSelection) {
        setSelectedTicker(signals[0].ticker);
      }
    } else {
      setSelectedTicker(null);
    }
  }, [signals, selectedTicker]);

  const selectedSignal = signals.find(s => s.ticker === selectedTicker);

  const getSignalBadge = (signal: SignalStrength) => {
    const styles = {
      strong_buy: 'bg-emerald-500/20 text-emerald-400',
      buy: 'bg-emerald-500/15 text-emerald-300',
      hold: 'bg-slate-500/20 text-[var(--text-muted)]',
      sell: 'bg-red-500/15 text-red-300',
      strong_sell: 'bg-red-500/20 text-red-400',
    };
    const labels = {
      strong_buy: 'Strong Buy',
      buy: 'Buy',
      hold: 'Hold',
      sell: 'Sell',
      strong_sell: 'Strong Sell',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles[signal])}>
        {labels[signal]}
      </span>
    );
  };

  const getScoreIcon = (score: number) => {
    if (score > 15) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score < -15) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-[var(--text-muted)]" />;
  };

  if (signals.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-semibold text-[var(--gb-parchment)]">Technical Analysis</h3>
        </div>
        <p className="text-[var(--text-muted)] text-sm">Add holdings to see technical analysis.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-semibold text-[var(--gb-parchment)]">Technical Analysis</h3>
        </div>

        {/* Ticker Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] text-sm hover:bg-[var(--gb-azure)]/80 transition-colors"
          >
            {selectedTicker && (
              <>
                <CompanyLogo ticker={selectedTicker} size="xs" />
                <span>{selectedTicker}</span>
              </>
            )}
            <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', showDropdown && 'rotate-180')} />
          </button>
          {showDropdown && (
            <div className="absolute z-50 right-0 w-48 mt-1 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)]/60 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {signals.map(signal => (
                <button
                  key={signal.ticker}
                  onClick={() => {
                    setSelectedTicker(signal.ticker);
                    setShowDropdown(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--gb-azure)]/50 transition-colors',
                    signal.ticker === selectedTicker ? 'text-[#D4AF37] bg-[var(--gb-azure)]/30' : 'text-[var(--text-secondary)]'
                  )}
                >
                  <CompanyLogo ticker={signal.ticker} size="xs" />
                  <span className="flex-1 text-left">{signal.ticker}</span>
                  {getSignalBadge(signal.overallSignal)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSignal && (
        <div className="space-y-4">
          {/* Overall Signal */}
          <div className="flex items-center justify-between p-3 bg-[var(--gb-azure-deep)]/40 rounded-xl">
            <div className="flex items-center gap-2">
              {getScoreIcon(selectedSignal.signalScore)}
              <span className="text-[var(--gb-parchment)] font-medium">Overall Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold tabular-nums',
                selectedSignal.signalScore > 0 ? 'text-emerald-400' :
                selectedSignal.signalScore < 0 ? 'text-red-400' : 'text-[var(--text-muted)]'
              )}>
                {selectedSignal.signalScore > 0 ? '+' : ''}{selectedSignal.signalScore}
              </span>
              {getSignalBadge(selectedSignal.overallSignal)}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* RSI */}
            <div className="p-3 bg-[var(--gb-azure-deep)]/30 rounded-lg">
              <p className="text-xs text-[var(--text-subtle)] mb-1">RSI (14)</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-lg font-semibold',
                  selectedSignal.rsi.signal === 'oversold' ? 'text-emerald-400' :
                  selectedSignal.rsi.signal === 'overbought' ? 'text-red-400' : 'text-[var(--gb-parchment)]'
                )}>
                  {selectedSignal.rsi.value.toFixed(0)}
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.rsi.signal === 'oversold' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedSignal.rsi.signal === 'overbought' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-[var(--text-muted)]'
                )}>
                  {selectedSignal.rsi.signal}
                </span>
              </div>
            </div>

            {/* MACD */}
            <div className="p-3 bg-[var(--gb-azure-deep)]/30 rounded-lg">
              <p className="text-xs text-[var(--text-subtle)] mb-1">MACD</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-lg font-semibold',
                  selectedSignal.macd.trend === 'bullish' ? 'text-emerald-400' :
                  selectedSignal.macd.trend === 'bearish' ? 'text-red-400' : 'text-[var(--gb-parchment)]'
                )}>
                  {selectedSignal.macd.histogram > 0 ? '+' : ''}{selectedSignal.macd.histogram.toFixed(2)}
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.macd.trend === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedSignal.macd.trend === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-[var(--text-muted)]'
                )}>
                  {selectedSignal.macd.trend}
                </span>
              </div>
            </div>

            {/* 52W Position */}
            <div className="p-3 bg-[var(--gb-azure-deep)]/30 rounded-lg">
              <p className="text-xs text-[var(--text-subtle)] mb-1">52W Range</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--gb-parchment)]">
                  {selectedSignal.fiftyTwoWeek.position.toFixed(0)}%
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.fiftyTwoWeek.signal === 'near_high' ? 'bg-amber-500/20 text-amber-400' :
                  selectedSignal.fiftyTwoWeek.signal === 'near_low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/50 text-[var(--text-muted)]'
                )}>
                  {selectedSignal.fiftyTwoWeek.signal.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Support/Resistance */}
            <div className="p-3 bg-[var(--gb-azure-deep)]/30 rounded-lg">
              <p className="text-xs text-[var(--text-subtle)] mb-1">Support / Resistance</p>
              <div className="text-sm">
                <span className="text-emerald-400">${selectedSignal.supportResistance.support.toFixed(2)}</span>
                <span className="text-[var(--text-subtle)]"> / </span>
                <span className="text-red-400">${selectedSignal.supportResistance.resistance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            href={`/holdings/${selectedSignal.ticker}`}
            className="block w-full text-center py-2 text-sm text-[#D4AF37] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-azure-deep)]/50 rounded-lg transition-colors"
          >
            View {selectedSignal.ticker} Details →
          </Link>
        </div>
      )}
    </div>
  );
}
