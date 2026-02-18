'use client';

import { cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { LucideIcon } from 'lucide-react';

/**
 * StatCard - "Summon Stone" display with magical glow
 *
 * Granblue Design:
 * - Glowing blue inner shadow
 * - Ornate gold frame with filigree corners
 * - Cinzel serif font for values
 * - Gold-bordered circular icon
 */

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
  isCurrency?: boolean;
  gradient?: 1 | 2 | 3 | 4 | 5;
}

const gradientStyles = {
  1: {
    bg: 'linear-gradient(135deg, rgba(93, 173, 226, 0.12) 0%, rgba(27, 59, 95, 0.2) 100%)',
    border: 'rgba(212, 175, 55, 0.4)',
    icon: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(93, 173, 226, 0.2))',
    iconBorder: 'var(--gb-gold)',
    iconColor: 'var(--gb-gold)',
  },
  2: {
    bg: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(27, 59, 95, 0.2) 100%)',
    border: 'rgba(212, 175, 55, 0.35)',
    icon: 'linear-gradient(135deg, rgba(232, 200, 74, 0.25), rgba(212, 175, 55, 0.2))',
    iconBorder: 'var(--gb-gold-light)',
    iconColor: 'var(--gb-gold-light)',
  },
  3: {
    bg: 'linear-gradient(135deg, rgba(52, 152, 219, 0.12) 0%, rgba(27, 59, 95, 0.2) 100%)',
    border: 'rgba(212, 175, 55, 0.35)',
    icon: 'linear-gradient(135deg, rgba(93, 173, 226, 0.25), rgba(52, 152, 219, 0.2))',
    iconBorder: 'var(--gb-crystal-blue)',
    iconColor: 'var(--gb-crystal-blue)',
  },
  4: {
    bg: 'linear-gradient(135deg, rgba(93, 173, 226, 0.1) 0%, rgba(52, 152, 219, 0.08) 100%)',
    border: 'rgba(212, 175, 55, 0.3)',
    icon: 'linear-gradient(135deg, rgba(52, 152, 219, 0.25), rgba(93, 173, 226, 0.2))',
    iconBorder: 'var(--gb-mana-blue)',
    iconColor: 'var(--gb-mana-blue)',
  },
  5: {
    bg: 'linear-gradient(135deg, rgba(232, 200, 74, 0.08) 0%, rgba(212, 175, 55, 0.06) 100%)',
    border: 'rgba(212, 175, 55, 0.35)',
    icon: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(184, 150, 12, 0.2))',
    iconBorder: 'var(--gb-gold-dark)',
    iconColor: 'var(--gb-gold-dark)',
  },
};

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  isCurrency = false,
  gradient = 1
}: StatCardProps) {
  const { isVisible } = useVisibility();
  const style = gradientStyles[gradient];

  const shouldMask = isCurrency || value.includes('$');
  const displayValue = shouldMask && !isVisible ? '$------' : value;

  return (
    <div
      className={cn(
        "stat-card relative p-5 rounded-xl animate-fade-in-up overflow-hidden group filigree-corners",
        className
      )}
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
    >
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gb-gold)] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-[1.5px]"
            style={{
              background: style.icon,
              borderColor: style.iconBorder,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-[var(--gb-parchment)] tabular-nums mb-1 tracking-tight font-cinzel">
        {displayValue}
      </p>

      {change && (
        <p className={cn(
          "text-sm font-medium flex items-center gap-1",
          changeType === 'positive' && "text-[var(--positive)]",
          changeType === 'negative' && "text-[var(--negative)]",
          changeType === 'neutral' && "text-[var(--text-secondary)]"
        )}>
          {changeType === 'positive' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
          )}
          {changeType === 'negative' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />
          )}
          {change}
        </p>
      )}

      {/* Magical inner glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gb-crystal-blue)]/5 via-transparent to-[var(--gb-gold)]/5" />
        <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 30px rgba(93, 173, 226, 0.08)' }} />
      </div>
    </div>
  );
}
