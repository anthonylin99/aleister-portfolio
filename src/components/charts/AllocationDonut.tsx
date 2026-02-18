'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { CategoryData } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';

/**
 * AllocationDonut - "Navigator's Compass"
 *
 * Granblue Design:
 * - Outer brass/gold ring effect via stroke
 * - Center shows compass-style data with Cinzel font
 * - Crystal blue glow on hover segments
 */

interface AllocationDonutProps {
  data: CategoryData[];
  totalValue: number;
}

export function AllocationDonut({ data, totalValue }: AllocationDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { isVisible } = useVisibility();

  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] font-cinzel text-sm">Calibrating compass...</p>
      </div>
    );
  }

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeData = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="relative h-[280px] animate-scale-in">
      {/* Outer brass ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[240px] h-[240px] rounded-full border-2 border-[var(--gb-gold-border)] opacity-40" />
        <div className="absolute w-[244px] h-[244px] rounded-full border border-[var(--gb-gold)]/20" />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={115}
            paddingAngle={2}
            dataKey="value"
            stroke="rgba(212, 175, 55, 0.3)"
            strokeWidth={1}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ activeIndex: activeIndex !== null ? activeIndex : undefined } as any)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activeShape={(props: any) => (
              <Sector
                {...props}
                outerRadius={props.outerRadius + 6}
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.3))',
                  cursor: 'pointer',
                }}
              />
            )}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: activeIndex === null || activeIndex === index
                    ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                    : 'none',
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Compass Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {activeData ? (
          <>
            <div
              className="w-3 h-3 rounded-full mb-1 ring-2 ring-[var(--gb-gold)]/30"
              style={{ backgroundColor: activeData.color }}
            />
            <span className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums font-cinzel">
              {formatPercentage(activeData.percentage)}
            </span>
            <span className="text-sm text-[var(--text-secondary)] text-center px-4 mt-1 max-w-[120px] leading-tight">
              {activeData.name}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm text-[var(--gb-gold)] font-medium font-cinzel">Fleet Value</span>
            <span className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums font-cinzel">
              {isVisible ? formatCurrency(totalValue) : '$------'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
