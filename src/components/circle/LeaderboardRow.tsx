'use client';

import { cn } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface RankedMember {
  userId: string;
  name: string;
  etfTicker: string;
  avatarColor: string;
  periodReturn: number;
  rank: number;
  holdingsCount: number;
}

interface LeaderboardRowProps {
  member: RankedMember;
  isCurrentUser: boolean;
}

export function LeaderboardRow({ member, isCurrentUser }: LeaderboardRowProps) {
  const isPositive = member.periodReturn >= 0;
  const initials = member.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-colors',
        isCurrentUser
          ? 'bg-[var(--gb-gold)]/10 border border-[var(--gb-gold-border)]'
          : 'bg-[var(--gb-azure-deep)]/20 border border-[var(--gb-gold-border)]/20 hover:bg-[var(--gb-azure-deep)]/40'
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {member.rank <= 3 ? (
          <Trophy
            className={cn(
              'w-5 h-5 mx-auto',
              member.rank === 1
                ? 'text-amber-400'
                : member.rank === 2
                  ? 'text-[var(--text-secondary)]'
                  : 'text-amber-700'
            )}
          />
        ) : (
          <span className="text-[var(--text-subtle)] font-mono text-sm">
            {member.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--gb-parchment)] font-bold text-xs flex-shrink-0"
        style={{ backgroundColor: member.avatarColor }}
      >
        {initials}
      </div>

      {/* Name & Ticker */}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--gb-parchment)] font-medium text-sm truncate">
          {member.name}
          {isCurrentUser && (
            <span className="text-[var(--gb-gold)] text-xs ml-2">(you)</span>
          )}
        </p>
        <p className="text-[var(--text-subtle)] text-xs font-mono">
          ${member.etfTicker} · {member.holdingsCount} holdings
        </p>
      </div>

      {/* Return */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        <span
          className={cn(
            'font-mono font-semibold text-sm',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {isPositive ? '+' : ''}
          {member.periodReturn.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
