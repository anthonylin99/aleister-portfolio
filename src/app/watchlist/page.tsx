'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Star, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getCollectionsForTicker } from '@/data/collections-seed';
import { ScrollBanner } from '@/components/ui/ScrollBanner';

interface WatchlistStock {
  ticker: string;
  name?: string;
  price?: number;
  dayChangePercent?: number;
}

export default function WatchlistPage() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [stocks, setStocks] = useState<Record<string, WatchlistStock>>({});
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState('');

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aleister-watchlist-tickers');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTickers(parsed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Fetch prices for watchlist tickers
  useEffect(() => {
    if (tickers.length === 0) return;

    async function fetchPrices() {
      try {
        const res = await fetch(`/api/historical/compare?tickers=${tickers.join(',')}&range=1D`);
        const json = await res.json();
        const data = json.data || {};
        const newStocks: Record<string, WatchlistStock> = {};

        for (const ticker of tickers) {
          const candles = data[ticker] || [];
          const last = candles[candles.length - 1];
          const prev = candles.length >= 2 ? candles[candles.length - 2] : null;

          newStocks[ticker] = {
            ticker,
            price: last?.close,
            dayChangePercent: prev && prev.close > 0
              ? ((last.close - prev.close) / prev.close) * 100
              : undefined,
          };
        }

        setStocks(newStocks);
      } catch (err) {
        console.error('Failed to fetch watchlist prices:', err);
      }
    }

    fetchPrices();
  }, [tickers]);

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => {
      const next = prev.filter((t) => t !== ticker);
      localStorage.setItem('aleister-watchlist-tickers', JSON.stringify(next));
      return next;
    });
  }, []);

  const addTicker = useCallback(() => {
    const t = addInput.trim().toUpperCase();
    if (!t) return;
    setTickers((prev) => {
      if (prev.includes(t)) return prev;
      const next = [...prev, t];
      localStorage.setItem('aleister-watchlist-tickers', JSON.stringify(next));
      return next;
    });
    setAddInput('');
  }, [addInput]);

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        {/* Back Button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <ScrollBanner className="text-2xl">Watch Tower</ScrollBanner>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Track stocks you&apos;re interested in. Data saved to your browser.
            </p>
          </div>
        </div>

        {/* Add Ticker */}
        <div className="parchment-card p-4 rounded-xl mb-6 flex items-center gap-3 filigree-corners">
          <input
            type="text"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTicker()}
            placeholder="Add ticker (e.g. NVDA, AAPL)"
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold)] text-sm"
          />
          <button
            onClick={addTicker}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--gb-gold)] text-[var(--gb-parchment)] hover:bg-[var(--gb-gold)]/80 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Watchlist */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--gb-gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickers.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center filigree-corners">
            <Star className="w-12 h-12 text-[var(--text-subtle)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] mb-2 font-cinzel">Your watch tower is empty</p>
            <p className="text-sm text-[var(--text-subtle)] mb-4">
              Add tickers above or star stocks from any collection
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gb-gold)] text-[var(--gb-parchment)] rounded-lg hover:bg-[var(--gb-gold)]/80 transition-colors text-sm"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="parchment-scroll filigree-corners">
            <div className="divide-y divide-[var(--gb-gold-border)]/30">
              {tickers.map((ticker) => {
                const stock = stocks[ticker];
                const isPositive = (stock?.dayChangePercent ?? 0) >= 0;
                const relatedCollections = getCollectionsForTicker(ticker);

                return (
                  <div key={ticker} className="flex items-center gap-3 p-3 parchment-row rounded-xl">
                    <Link href={`/holdings/${ticker}`} className="flex-shrink-0">
                      <CompanyLogo ticker={ticker} size="md" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/holdings/${ticker}`} className="font-semibold text-[var(--gb-parchment)] hover:text-[var(--gb-gold)] transition-colors">
                        {ticker}
                      </Link>
                      {relatedCollections.length > 0 && (
                        <p className="text-xs text-[var(--text-subtle)] truncate">
                          In: {relatedCollections.map((c) => c.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {stock?.price !== undefined ? (
                        <>
                          <p className="font-semibold text-[var(--gb-parchment)] tabular-nums">
                            {formatCurrency(stock.price)}
                          </p>
                          {stock.dayChangePercent !== undefined && (
                            <p className={cn(
                              'flex items-center gap-0.5 text-sm font-medium justify-end',
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            )}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {formatPercentagePrecise(stock.dayChangePercent)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="w-16 h-4 bg-[var(--gb-azure-deep)] rounded animate-pulse" />
                      )}
                    </div>
                    <button
                      onClick={() => removeTicker(ticker)}
                      className="p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-red-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
