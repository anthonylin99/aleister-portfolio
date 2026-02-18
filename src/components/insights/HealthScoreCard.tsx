'use client';

import { cn } from '@/lib/utils';
import type { PortfolioHealth } from '@/types/insights';
import { Activity, Shield, TrendingUp, Grid3X3 } from 'lucide-react';

interface HealthScoreCardProps {
  health: PortfolioHealth;
}

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 55) return 'text-[#D4AF37]';
    if (score >= 35) return 'text-amber-400';
    return 'text-red-400';
  };

  const getAssessmentBadge = (assessment: PortfolioHealth['assessment']) => {
    const styles = {
      excellent: 'bg-emerald-500/20 text-emerald-400',
      good: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      fair: 'bg-amber-500/20 text-amber-400',
      needs_attention: 'bg-red-500/20 text-red-400',
    };
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      needs_attention: 'Needs Attention',
    };
    return (
      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', styles[assessment])}>
        {labels[assessment]}
      </span>
    );
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-semibold text-[var(--gb-parchment)]">Portfolio Health</h3>
        </div>
        {getAssessmentBadge(health.assessment)}
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('text-5xl font-bold tabular-nums', getScoreColor(health.score))}>
          {health.score}
        </div>
        <div className="flex-1">
          <div className="h-3 bg-[var(--gb-azure-deep)] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                health.score >= 75 ? 'bg-emerald-500' :
                health.score >= 55 ? 'bg-[#D4AF37]' :
                health.score >= 35 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${health.score}%` }}
            />
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">{health.summary}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--gb-gold-border)]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="text-xs">Diversity</span>
          </div>
          <p className={cn('text-lg font-semibold', getScoreColor(health.breakdown.diversification))}>
            {health.breakdown.diversification}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Momentum</span>
          </div>
          <p className={cn('text-lg font-semibold', getScoreColor(health.breakdown.momentum))}>
            {health.breakdown.momentum}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs">Balance</span>
          </div>
          <p className={cn('text-lg font-semibold', getScoreColor(health.breakdown.riskBalance))}>
            {health.breakdown.riskBalance}
          </p>
        </div>
      </div>
    </div>
  );
}
