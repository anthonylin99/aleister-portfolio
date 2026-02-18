'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLeaderboard, useAuth } from '@/lib/hooks';
import { LeaderboardRow } from './LeaderboardRow';
import { Loader2, BarChart3 } from 'lucide-react';

type Range = '1W' | '1M' | 'YTD';

const RANGES: { label: string; value: Range }[] = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'YTD', value: 'YTD' },
];

export function Leaderboard() {
  const [range, setRange] = useState<Range>('YTD');
  const { rankings, loading, error } = useLeaderboard(range);
  const { user } = useAuth();

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[var(--gb-gold)]" />
          <h2 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Guild Rankings</h2>
        </div>

        {/* Range Toggle */}
        <div className="flex bg-[var(--gb-azure-deep)]/50 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                range === r.value
                  ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--gb-parchment)]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[var(--gb-gold)] animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm text-center py-8">{error}</p>
      ) : rankings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)] text-sm">
            No members with portfolio data yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((member) => (
            <LeaderboardRow
              key={member.userId}
              member={member}
              isCurrentUser={member.userId === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
