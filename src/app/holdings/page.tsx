'use client';

import { Header } from '@/components/layout/Header';
import { HoldingsTable } from '@/components/tables/HoldingsTable';
import { CategoryHoldingsSection } from '@/components/charts/CategoryHoldingsSection';
import { usePortfolio } from '@/lib/hooks';
import { RefreshCw } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

export default function HoldingsPage() {
  const { holdings, summary, categories, loading, refresh, cached } = usePortfolio();

  if (loading && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading holdings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <Header 
          title="Holdings"
          subtitle="Manage and track all portfolio positions"
        />
        
        <button
          onClick={refresh}
          disabled={loading}
          className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">
            {loading ? 'Refreshing...' : 'Refresh'}
          </span>
          {cached && summary.lastUpdated && (
            <span className="text-xs text-slate-500">
              ({getRelativeTime(summary.lastUpdated)})
            </span>
          )}
        </button>
      </div>

      {/* Category Overview with Pie Chart */}
      <div className="mb-8">
        <CategoryHoldingsSection data={categories} totalValue={summary.totalValue} />
      </div>

      {/* Individual Holdings Table */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">All Holdings</h3>
        <HoldingsTable holdings={holdings} totalValue={summary.totalValue} />
      </div>
    </div>
  );
}
