'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockRow } from '@/components/collections/StockRow';
import { TickerStrip } from '@/components/collections/TickerStrip';
import { getCollectionById, getCategoryById } from '@/data/collections-seed';
import type { CollectionStockWithPrice } from '@/lib/collection-service';

interface CollectionDetail {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  methodology: string;
  riskLevel: string;
  tags: string[];
  stocks: CollectionStockWithPrice[];
  category: { id: string; name: string; color: string; description: string; icon: string };
}

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const staticCollection = getCollectionById(id);
  const category = staticCollection ? getCategoryById(staticCollection.categoryId) : null;

  const fetchPrices = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${id}${forceRefresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const json = await res.json();
        setCollection(json.collection);
      }
    } catch (err) {
      console.error('Failed to fetch collection:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aleister-watchlist-tickers');
      if (stored) setWatchlist(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const toggleWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      localStorage.setItem('aleister-watchlist-tickers', JSON.stringify([...next]));

      // Also update server-side watchlist
      const visitorId = localStorage.getItem('aleister-visitor-id');
      if (visitorId) {
        if (next.has(ticker)) {
          fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-visitor-id': visitorId },
            body: JSON.stringify({ ticker }),
          });
        } else {
          fetch(`/api/watchlist?ticker=${ticker}`, {
            method: 'DELETE',
            headers: { 'x-visitor-id': visitorId },
          });
        }
      }
      return next;
    });
  }, []);

  if (!staticCollection || !category) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="gradient-card p-8 rounded-2xl text-center max-w-md filigree-corners">
            <div className="relative z-10">
              <p className="text-[var(--text-muted)] mb-4">Collection not found</p>
              <Link
                href="/explore"
                className="px-4 py-2 bg-[var(--gb-gold)] text-[var(--gb-parchment)] rounded-lg hover:bg-[var(--gb-gold)]/80 transition-colors inline-block"
              >
                Back to Horizons
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayStocks = collection?.stocks || staticCollection.stocks.map((s) => ({ ...s }));

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
          Back to Horizons
        </Link>

        {/* Hero */}
        <div className="gradient-card p-8 rounded-3xl mb-6 relative overflow-hidden filigree-corners">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gb-gold)]/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getCategoryEmoji(category.icon)}</span>
              <h1 className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">{staticCollection.name}</h1>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </span>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  staticCollection.riskLevel === 'low' && 'bg-emerald-500/20 text-emerald-400',
                  staticCollection.riskLevel === 'moderate' && 'bg-blue-500/20 text-blue-400',
                  staticCollection.riskLevel === 'high' && 'bg-[var(--gb-gold)]/20 text-[var(--gb-gold)]',
                  staticCollection.riskLevel === 'very-high' && 'bg-red-500/20 text-red-400'
                )}
              >
                {staticCollection.riskLevel === 'very-high'
                  ? 'Very High'
                  : staticCollection.riskLevel.charAt(0).toUpperCase() + staticCollection.riskLevel.slice(1)}{' '}
                Risk
              </span>
              <span className="text-sm text-[var(--text-subtle)]">
                {staticCollection.methodology.replace(/-/g, ' ')} · {staticCollection.stocks.length} stocks
              </span>
            </div>
            <p className="text-[var(--text-muted)] max-w-2xl">{staticCollection.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {staticCollection.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-md bg-[var(--gb-azure-deep)]/80 text-xs text-[var(--text-muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker Strip */}
        {collection && (
          <div className="mb-6">
            <TickerStrip stocks={collection.stocks} />
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Holdings list - 7 cols */}
          <div className="lg:col-span-7">
            <div className="gradient-card p-6 rounded-2xl filigree-corners">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[var(--gb-parchment)] font-cinzel">Holdings</h2>
                  <button
                    onClick={() => fetchPrices(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--gb-azure-deep)] text-[var(--text-muted)] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-azure)] transition-colors text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    Refresh Prices
                  </button>
                </div>

                <div className="divide-y divide-[var(--gb-gold-border)]">
                  {displayStocks.map((stock, i) => (
                    <StockRow
                      key={stock.ticker}
                      stock={stock as CollectionStockWithPrice}
                      rank={i + 1}
                      holdingsPercent={displayStocks.length > 0 ? 100 / displayStocks.length : 0}
                      isWatchlisted={watchlist.has(stock.ticker)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            {/* Performance Summary Card */}
            {collection && (
              <div className="gradient-card p-5 rounded-2xl filigree-corners">
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 font-cinzel">Collection Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Top Gainer</p>
                      {(() => {
                        const stocks = collection.stocks.filter(s => s.dayChangePercent !== undefined);
                        const topGainer = stocks.length > 0
                          ? stocks.reduce((best, s) => (s.dayChangePercent ?? 0) > (best.dayChangePercent ?? 0) ? s : best)
                          : null;
                        if (!topGainer) return <p className="text-[var(--text-subtle)]">—</p>;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--gb-parchment)]">{topGainer.ticker}</span>
                            <span className="text-emerald-400 text-sm">+{(topGainer.dayChangePercent ?? 0).toFixed(1)}%</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Top Loser</p>
                      {(() => {
                        const stocks = collection.stocks.filter(s => s.dayChangePercent !== undefined);
                        const topLoser = stocks.length > 0
                          ? stocks.reduce((worst, s) => (s.dayChangePercent ?? 0) < (worst.dayChangePercent ?? 0) ? s : worst)
                          : null;
                        if (!topLoser) return <p className="text-[var(--text-subtle)]">—</p>;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--gb-parchment)]">{topLoser.ticker}</span>
                            <span className="text-red-400 text-sm">{(topLoser.dayChangePercent ?? 0).toFixed(1)}%</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Average Change</p>
                      {(() => {
                        const stocks = collection.stocks.filter(s => s.dayChangePercent !== undefined);
                        if (stocks.length === 0) return <p className="text-[var(--text-subtle)]">—</p>;
                        const avg = stocks.reduce((sum, s) => sum + (s.dayChangePercent ?? 0), 0) / stocks.length;
                        return (
                          <p className={cn(
                            "font-semibold",
                            avg >= 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {avg >= 0 ? '+' : ''}{avg.toFixed(2)}%
                          </p>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Positive / Negative</p>
                      {(() => {
                        const stocks = collection.stocks.filter(s => s.dayChangePercent !== undefined);
                        const positive = stocks.filter(s => (s.dayChangePercent ?? 0) >= 0).length;
                        const negative = stocks.length - positive;
                        return (
                          <p className="font-semibold text-[var(--gb-parchment)]">
                            <span className="text-emerald-400">{positive}</span>
                            {' / '}
                            <span className="text-red-400">{negative}</span>
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Info Card */}
            <div className="gradient-card p-5 rounded-2xl filigree-corners">
              <div className="relative z-10">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 font-cinzel">About {category.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{category.description}</p>
                <div className="mt-4 pt-3 border-t border-[var(--gb-gold-border)]">
                  <p className="text-xs text-[var(--text-subtle)]">Methodology</p>
                  <p className="text-sm text-[var(--gb-parchment)] mt-1 capitalize">{staticCollection.methodology.replace(/-/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="gradient-card p-5 rounded-2xl filigree-corners">
              <div className="relative z-10">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 font-cinzel">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-subtle)]">Total Stocks</span>
                    <span className="text-sm font-medium text-[var(--gb-parchment)]">{staticCollection.stocks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-subtle)]">Risk Level</span>
                    <span className={cn(
                      "text-sm font-medium",
                      staticCollection.riskLevel === 'low' && 'text-emerald-400',
                      staticCollection.riskLevel === 'moderate' && 'text-blue-400',
                      staticCollection.riskLevel === 'high' && 'text-[var(--gb-gold)]',
                      staticCollection.riskLevel === 'very-high' && 'text-red-400'
                    )}>
                      {staticCollection.riskLevel === 'very-high' ? 'Very High' : staticCollection.riskLevel.charAt(0).toUpperCase() + staticCollection.riskLevel.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-subtle)]">Category</span>
                    <span className="text-sm font-medium" style={{ color: category.color }}>{category.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    Anchor: '\u2693',
    Cpu: '\u{1F4BB}',
    Gem: '\u{1F48E}',
    Coins: '\u{1FA99}',
    Rocket: '\u{1F680}',
    Crown: '\u{1F451}',
    Brain: '\u{1F9E0}',
    Shield: '\u{1F6E1}',
    Atom: '\u269B\uFE0F',
    Sun: '\u2600\uFE0F',
    Heart: '\u{1F9E0}', // Brain/mind for healthcare/biotech
    Pickaxe: '\u26CF\uFE0F', // Pickaxe for mining
  };
  return map[icon] || '\u{1F4CA}';
}
