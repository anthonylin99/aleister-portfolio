'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { CategoryData } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface CategoryHoldingsSectionProps {
  data: CategoryData[];
  totalValue: number;
}

export function CategoryHoldingsSection({ data, totalValue }: CategoryHoldingsSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeData = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="flex flex-col xl:flex-row">
        {/* Pie Chart - Left Side */}
        <div className="xl:w-[380px] p-6 flex items-center justify-center">
          <div className="relative w-[280px] h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={130}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ activeIndex: activeIndex !== null ? activeIndex : undefined } as any)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={(props: any) => (
                    <Sector
                      {...props}
                      outerRadius={props.outerRadius + 8}
                      style={{
                        filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.5))',
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
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                        transition: 'opacity 0.2s ease, filter 0.2s ease',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label - Shows hovered category or total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeData ? (
                <>
                  <div 
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: activeData.color }}
                  />
                  <span className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums">
                    {formatPercentage(activeData.percentage)}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)] text-center px-4 mt-1 max-w-[140px] leading-tight">
                    {activeData.name}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)] mt-1">
                    {activeData.holdings.length} holding{activeData.holdings.length > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm text-[var(--text-muted)] font-medium">Total</span>
                  <span className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums">
                    {formatCurrency(totalValue)}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)] mt-1">
                    {data.length} categories
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Table - Right Side */}
        <div className="flex-1 border-t xl:border-t-0 xl:border-l border-[var(--gb-gold-border)]/30">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-b border-[var(--gb-gold-border)]/30 text-sm font-medium text-[var(--text-muted)]">
            <span>Category</span>
            <span className="text-right w-28">Value</span>
            <span className="text-right w-20">Weight</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-800/50">
            {data.map((category, index) => (
              <div 
                key={category.name}
                className={`grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 transition-colors cursor-pointer ${
                  activeIndex === index ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Name & Count */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--gb-parchment)] truncate">{category.name}</p>
                    <p className="text-xs text-[var(--text-subtle)]">
                      {category.holdings.length} {category.holdings.length === 1 ? 'holding' : 'holdings'}
                    </p>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right w-28">
                  <p className="font-semibold text-[var(--gb-parchment)] tabular-nums">
                    {formatCurrency(category.value)}
                  </p>
                </div>

                {/* Allocation */}
                <div className="text-right w-20">
                  <p className="font-medium text-[var(--gb-parchment)] tabular-nums">
                    {formatPercentage(category.percentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-t border-[var(--gb-gold-border)]/30 bg-[var(--gb-azure-deep)]/30">
            <span className="font-medium text-[var(--text-muted)]">Total</span>
            <span className="text-right w-28 font-bold text-[var(--gb-parchment)] tabular-nums">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-right w-20 font-medium text-[var(--gb-parchment)] tabular-nums">
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
