'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { DispersionChart, DispersionChartHeader } from '@/components/charts/DispersionChart';
import { SMAData, SMAPeriod, SMA_PERIODS } from '@/types/sma';
import { cn } from '@/lib/utils';
import { TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { useUserPortfolio } from '@/lib/hooks';
import { ScrollBanner } from '@/components/ui/ScrollBanner';

type DataSource = 'portfolio' | 'watchlist';

interface SMAResponse {
  data: SMAData[];
  period: number;
  source: string;
  portfolioType?: string;
  calculatedAt: string;
}

export default function DipFinderPage() {
  const [source, setSource] = useState<DataSource>('portfolio');
  const [period, setPeriod] = useState<SMAPeriod>(50);
  const [data, setData] = useState<SMAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { refresh: refreshPortfolio } = useUserPortfolio();

  // Handler to add a ticker to the user's portfolio
  const handleAddToPortfolio = useCallback(async (ticker: string) => {
    const res = await fetch('/api/holdings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        shares: 0,
        costBasis: 0,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add to portfolio');
    }
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Handler to add a ticker to the user's watchlist
  const handleAddToWatchlist = useCallback(async (ticker: string) => {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add to watchlist');
    }
  }, []);

  const fetchSMAData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/sma?source=${source}&period=${period}&portfolioType=personal`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch SMA data');
      }
      const result: SMAResponse = await res.json();
      setData(result.data);
      setLastUpdated(result.calculatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [source, period]);

  useEffect(() => {
    fetchSMAData();
  }, [fetchSMAData]);

  const maxDeviation = data.length > 0
    ? Math.max(...data.map((d) => Math.abs(d.deviation)), 10)
    : 20;

  // Separate dips (below SMA) from gains (above SMA)
  const dips = data.filter((d) => d.deviation < 0);
  const gains = data.filter((d) => d.deviation >= 0);

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      {/* Granblue Sky Background */}
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        {/* Header */}
        <Header
          title="Dip Scout"
          subtitle="Scout stocks trading below their moving average"
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
          {/* Data Source Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)] font-cinzel">Source:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSource('portfolio')}
                className={cn('game-toggle', source === 'portfolio' && 'active')}
              >
                Portfolio
              </button>
              <button
                onClick={() => setSource('watchlist')}
                className={cn('game-toggle', source === 'watchlist' && 'active')}
              >
                Watchlist
              </button>
            </div>
          </div>

          {/* SMA Period Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)] font-cinzel">SMA Period:</span>
            <div className="flex gap-1">
              {SMA_PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn('game-toggle', period === p && 'active')}
                >
                  {p}D
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchSMAData}
            disabled={loading}
            className="ml-auto glass-card px-4 py-2 rounded-lg flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors disabled:opacity-50 font-cinzel"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Loading State - Magic Circle */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="magic-circle-loader mb-4">
              <div className="magic-circle-inner" />
            </div>
            <p className="text-[var(--text-secondary)] font-cinzel text-sm tracking-wide">
              Scouting SMA deviation...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="gradient-card p-8 rounded-2xl text-center filigree-corners">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchSMAData}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data.length === 0 && (
          <div className="gradient-card p-10 rounded-2xl text-center max-w-md mx-auto filigree-corners">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--gb-gold)]/20 flex items-center justify-center border border-[var(--gb-gold-border)]">
              <BarChart3 className="w-8 h-8 text-[var(--gb-gold)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">
              No Data Available
            </h2>
            <p className="text-[var(--text-muted)] text-sm">
              {source === 'portfolio'
                ? 'Add holdings to your portfolio to see SMA analysis.'
                : 'Add stocks to your watchlist to see SMA analysis.'}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && data.length > 0 && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl filigree-corners">
                <p className="text-[var(--text-muted)] text-xs mb-1 font-cinzel">Total Stocks</p>
                <p className="text-2xl font-bold text-[var(--gb-parchment)] font-cinzel">{data.length}</p>
              </div>
              <div className="glass-card p-4 rounded-xl filigree-corners">
                <p className="text-[var(--text-muted)] text-xs mb-1 font-cinzel">Below SMA</p>
                <p className="text-2xl font-bold text-red-400 font-cinzel">{dips.length}</p>
              </div>
              <div className="glass-card p-4 rounded-xl filigree-corners">
                <p className="text-[var(--text-muted)] text-xs mb-1 font-cinzel">Above SMA</p>
                <p className="text-2xl font-bold text-emerald-400 font-cinzel">{gains.length}</p>
              </div>
              <div className="glass-card p-4 rounded-xl filigree-corners">
                <p className="text-[var(--text-muted)] text-xs mb-1 font-cinzel">Biggest Dip</p>
                <p className="text-2xl font-bold text-red-400 font-cinzel">
                  {dips.length > 0 ? `${dips[0].deviation.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Dips Section */}
            {dips.length > 0 && (
              <div className="wooden-frame p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <ScrollBanner>Below {period}-Day SMA</ScrollBanner>
                  <span className="text-sm text-[var(--text-subtle)] font-cinzel">
                    ({dips.length} stocks)
                  </span>
                </div>
                <DispersionChartHeader maxDeviation={maxDeviation} />
                <DispersionChart
                  data={dips}
                  maxDeviation={maxDeviation}
                  onAddToPortfolio={handleAddToPortfolio}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              </div>
            )}

            {/* Gains Section */}
            {gains.length > 0 && (
              <div className="parchment-scroll filigree-corners">
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <TrendingDown className="w-5 h-5 text-emerald-400 rotate-180" />
                  <ScrollBanner>Above {period}-Day SMA</ScrollBanner>
                  <span className="text-sm text-[var(--text-subtle)] font-cinzel">
                    ({gains.length} stocks)
                  </span>
                </div>
                <DispersionChartHeader maxDeviation={maxDeviation} />
                <DispersionChart
                  data={gains}
                  maxDeviation={maxDeviation}
                  onAddToPortfolio={handleAddToPortfolio}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-center text-xs text-[var(--text-subtle)] font-cinzel">
                Last scouted: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
