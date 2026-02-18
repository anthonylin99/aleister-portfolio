'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface EquityCurveProps {
  data: { timestamp: number[]; equity: number[]; profit_loss: number[]; profit_loss_pct: number[] } | null;
}

export function EquityCurve({ data }: EquityCurveProps) {
  if (!data || !data.timestamp || data.timestamp.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-[var(--text-subtle)] text-xs font-mono">
        No history data
      </div>
    );
  }

  const chartData = data.timestamp.map((ts, i) => ({
    date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: data.equity[i],
    pnl: data.profit_loss[i],
  }));

  const minEquity = Math.min(...chartData.map((d) => d.equity));
  const maxEquity = Math.max(...chartData.map((d) => d.equity));
  const padding = (maxEquity - minEquity) * 0.1 || 100;

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-subtle)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minEquity - padding, maxEquity + padding]}
            tick={{ fill: 'var(--text-subtle)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: '#0a0a0f',
              border: '1px solid var(--gb-gold-border)',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
            formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Equity']}
            labelStyle={{ color: 'var(--text-muted)' }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="var(--gb-gold)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--gb-gold)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
