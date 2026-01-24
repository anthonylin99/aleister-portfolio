'use client';

import { RiskMetrics } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface RiskMetricsCardProps {
  metrics: RiskMetrics;
  className?: string;
}

export function RiskMetricsCard({ metrics, className }: RiskMetricsCardProps) {
  return (
    <div className={cn("glass-card p-6 rounded-2xl", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricBox 
          label="Volatility (Ann.)" 
          value={`${(metrics.volatility * 100).toFixed(1)}%`}
          tooltip="Annualized standard deviation of daily returns. Higher = more volatile."
          status={metrics.volatility > 0.4 ? 'high' : metrics.volatility > 0.25 ? 'medium' : 'low'}
        />
        <MetricBox 
          label="Sharpe Ratio" 
          value={metrics.sharpeRatio.toFixed(2)}
          tooltip="Risk-adjusted return. Higher is better. >1 is good, >2 is excellent."
          status={metrics.sharpeRatio > 1.5 ? 'good' : metrics.sharpeRatio > 0.5 ? 'neutral' : 'bad'}
        />
        <MetricBox 
          label="Max Drawdown" 
          value={`${(metrics.maxDrawdown * 100).toFixed(1)}%`}
          tooltip="Largest peak-to-trough decline. How much you could have lost."
          status="negative"
        />
        <MetricBox 
          label="Beta" 
          value={metrics.beta.toFixed(2)}
          tooltip="Volatility relative to S&P 500. 1.0 = market, >1 = more volatile."
          status={metrics.beta > 1.5 ? 'high' : metrics.beta < 0.8 ? 'low' : 'neutral'}
        />
        <MetricBox 
          label="Sortino Ratio" 
          value={metrics.sortinoRatio > 100 ? '∞' : metrics.sortinoRatio.toFixed(2)}
          tooltip="Like Sharpe but only penalizes downside volatility. Higher is better."
          status={metrics.sortinoRatio > 2 ? 'good' : metrics.sortinoRatio > 1 ? 'neutral' : 'bad'}
        />
      </div>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  tooltip: string;
  status?: 'good' | 'neutral' | 'bad' | 'high' | 'medium' | 'low' | 'negative';
}

function MetricBox({ label, value, tooltip, status }: MetricBoxProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-emerald-400';
      case 'bad': return 'text-red-400';
      case 'high': return 'text-amber-400';
      case 'negative': return 'text-red-400';
      case 'low': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 group relative">
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
        {label}
        <div className="relative">
          <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-slate-700 shadow-xl pointer-events-none max-w-[200px] text-wrap">
            {tooltip}
          </div>
        </div>
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", getStatusColor())}>
        {value}
      </div>
    </div>
  );
}
