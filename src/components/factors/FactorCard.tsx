'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Factor, Allocation } from '@/lib/factors/types';

interface FactorCardProps {
  factor: Factor;
  allocation?: Allocation;
  onEdit: (factor: Factor) => void;
  onDelete: (factor: Factor) => void;
}

export function FactorCard({ factor, allocation, onEdit, onDelete }: FactorCardProps) {
  const isAllocated = allocation && allocation.percentage > 0;

  return (
    <div className="gradient-card p-5 rounded-2xl relative overflow-hidden group filigree-corners">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: factor.color }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: factor.color }}
            />
            <h3 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">
              {factor.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(factor)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--gb-gold)] transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(factor)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {factor.description && (
          <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
            {factor.description}
          </p>
        )}

        {/* Assets */}
        <div className="space-y-1.5 mb-3">
          {factor.assets.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between text-sm">
              <span className="text-[var(--gb-parchment)] font-mono">{asset.symbol}</span>
              <span className="text-[var(--text-muted)] tabular-nums">
                {(asset.weight * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Allocation Status */}
        <div className="pt-3 border-t border-[var(--gb-gold-border)]">
          {isAllocated ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Allocated</span>
              <span className="text-sm font-bold text-[var(--gb-gold)] tabular-nums">
                {allocation.percentage}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-[var(--text-subtle)]">Not allocated</span>
          )}
        </div>
      </div>
    </div>
  );
}
