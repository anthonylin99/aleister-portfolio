'use client';

import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { BenchmarkChart } from '@/components/charts/BenchmarkChart';
import { RiskMetricsCard } from '@/components/cards/RiskMetricsCard';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { usePortfolio, useHistoricalData, useETF, useRiskMetrics } from '@/lib/hooks';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { categoryColors, Category } from '@/types/portfolio';
import { 
  Compass, 
  Globe,
  Satellite,
  Bitcoin,
  Coins,
  Cpu,
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<Category, React.ReactNode> = {
  'Space & Satellite': <Satellite className="w-5 h-5" />,
  'Crypto Infrastructure': <Bitcoin className="w-5 h-5" />,
  'Fintech': <Coins className="w-5 h-5" />,
  'AI Infrastructure': <Cpu className="w-5 h-5" />,
  'Digital Asset Treasury': <Building2 className="w-5 h-5" />,
  'Big Tech': <Globe className="w-5 h-5" />,
  'Defense Tech': <Shield className="w-5 h-5" />,
};

export default function ETFPage() {
  const { holdings, summary, categories } = usePortfolio();
  const { data: historicalData, loading: chartLoading, range, setRange } = useHistoricalData('ALL');
  const { etf } = useETF();
  const { metrics: riskMetrics, loading: riskLoading } = useRiskMetrics(range === 'ALL' ? '1Y' : range);
  const { isVisible } = useVisibility();

  const isPositive = etf ? etf.totalReturn >= 0 : true;

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Hero Section */}
      <div className="glass-card p-8 lg:p-10 rounded-3xl mb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    ${etf?.ticker || 'ALIN'}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium">
                    Prometheus ETF
                  </span>
                </div>
                <p className="text-slate-400 mt-1">
                  Personal Investment Portfolio • Inception Jan 24, 2026
                </p>
              </div>
            </div>

            {/* Current Price */}
            {etf && (
              <div className="text-left lg:text-right">
                <p className="text-5xl font-bold text-white tabular-nums">
                  {isVisible ? `$${etf.currentPrice.toFixed(2)}` : '$••••••'}
                </p>
                <div className="flex items-center gap-3 mt-1 lg:justify-end">
                  <span className={cn(
                    "flex items-center gap-1 text-lg font-medium",
                    isPositive ? "text-emerald-400" : "text-red-400"
                  )}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {formatPercentagePrecise(etf.totalReturnPercent)} all time
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Net Assets</p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {isVisible ? formatCurrency(summary.totalValue) : '$••••••'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Holdings</p>
              <p className="text-2xl font-bold text-white">{holdings.length}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Day Change</p>
              <p className={cn(
                "text-2xl font-bold tabular-nums",
                summary.dayChange >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {formatPercentagePrecise(summary.dayChangePercent)}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Inception</span>
              </div>
              <p className="text-2xl font-bold text-white">Jan 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Chart */}
      <div className="mb-8">
        <TradingViewChart
          data={historicalData}
          loading={chartLoading}
          range={range}
          onRangeChange={setRange}
          ticker={etf?.ticker || 'ALIN'}
          currentPrice={etf?.currentPrice}
          priceChange={etf?.totalReturn || 0}
          priceChangePercent={etf?.totalReturnPercent || 0}
        />
      </div>

      {/* Risk Metrics */}
      {riskMetrics && !riskLoading && (
        <div className="mb-8">
          <RiskMetricsCard metrics={riskMetrics} />
        </div>
      )}

      {/* Benchmark Comparison */}
      <div className="mb-8">
        <BenchmarkChart range={range === 'ALL' ? '1Y' : range} />
      </div>

      {/* Category Weightings */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Category Weightings</h2>
        <div className="space-y-4">
          {categories.map((category) => {
            const color = categoryColors[category.name];
            return (
              <div key={category.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span style={{ color }}>{categoryIcons[category.name]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{category.name}</p>
                      <p className="text-sm text-slate-400">
                        {category.holdings.length} holding{category.holdings.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white tabular-nums">
                      {formatPercentage(category.percentage)}
                    </p>
                    <p className="text-sm text-slate-400 tabular-nums">
                      {isVisible ? formatCurrency(category.value) : '$••••••'}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Holdings */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">All Holdings</h2>
          <Link 
            href="/holdings" 
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            View Details <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-3 text-sm font-semibold text-slate-400">#</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-400">Holding</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-400 hidden md:table-cell">Category</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-400">Price</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-400 hidden sm:table-cell">Shares</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-400">Value</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-400">Weight</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => {
                const color = categoryColors[holding.category];
                const dayPositive = holding.dayChangePercent >= 0;
                return (
                  <tr 
                    key={holding.ticker}
                    className="border-b border-slate-800/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <span className="text-slate-500 font-medium">{index + 1}</span>
                    </td>
                    <td className="p-3">
                      <Link href={`/holdings/${holding.ticker}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <CompanyLogo ticker={holding.ticker} size="sm" />
                        <div>
                          <p className="font-semibold text-white">{holding.ticker}</p>
                          <p className="text-sm text-slate-400 hidden sm:block">{holding.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span 
                        className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-[11px] font-medium text-center leading-tight max-w-[85px]"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {holding.category}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-medium text-white tabular-nums">
                        {isVisible ? `$${holding.currentPrice.toFixed(2)}` : '$••••'}
                      </p>
                      <p className={cn(
                        "text-xs tabular-nums",
                        dayPositive ? "text-emerald-400" : "text-red-400"
                      )}>
                        {formatPercentagePrecise(holding.dayChangePercent)}
                      </p>
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      <span className="text-slate-300 tabular-nums">{isVisible ? holding.shares.toLocaleString() : '••••'}</span>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-bold text-white tabular-nums">
                        {isVisible ? formatCurrency(holding.value) : '$••••••'}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-medium text-white tabular-nums">
                        {formatPercentage(holding.weight)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-slate-900/30 border border-slate-800">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Disclaimer:</strong> $ALIN (Prometheus ETF) is a 
          hypothetical personal portfolio for educational and tracking purposes only. 
          This is not a registered investment fund. Historical performance is calculated 
          based on actual stock prices but assumes constant share holdings since inception.
          Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
