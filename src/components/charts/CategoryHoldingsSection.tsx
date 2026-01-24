'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryData } from '@/types/portfolio';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

interface CategoryHoldingsSectionProps {
  data: CategoryData[];
  totalValue: number;
}

export function CategoryHoldingsSection({ data, totalValue }: CategoryHoldingsSectionProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
        <h3 className="text-lg font-semibold text-white">Portfolio</h3>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col xl:flex-row">
        {/* Pie Chart - Left Side */}
        <div className="xl:w-[400px] p-6 flex items-center justify-center">
          <div className="relative w-full h-[300px] max-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Table - Right Side */}
        <div className="flex-1 border-t xl:border-t-0 xl:border-l border-slate-700/30">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-b border-slate-700/30 text-sm font-medium text-slate-400">
            <span>Name</span>
            <span className="text-right w-28">Value</span>
            <span className="text-right w-20">Allocation</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-800/50">
            {data.map((category, index) => (
              <div 
                key={category.name}
                className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Name & Count */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{category.name}</p>
                    <p className="text-sm text-slate-500">
                      {category.holdings.length} {category.holdings.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right w-28">
                  <p className="font-semibold text-white tabular-nums">
                    {formatCurrency(category.value)}
                  </p>
                </div>

                {/* Allocation */}
                <div className="text-right w-20">
                  <p className="font-medium text-white tabular-nums">
                    {formatPercentage(category.percentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-t border-slate-700/30 bg-slate-900/30">
            <span className="font-medium text-slate-400">Total</span>
            <span className="text-right w-28 font-bold text-white tabular-nums">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-right w-20 font-medium text-white tabular-nums">
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload as CategoryData;
  
  return (
    <div className="glass-card p-3 border border-violet-500/30 shadow-xl rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-medium text-white">{data.name}</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-white tabular-nums">
          {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-slate-400">
          {formatPercentage(data.percentage)} of portfolio
        </p>
        <p className="text-xs text-slate-500">
          {data.holdings.length} holding{data.holdings.length > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
