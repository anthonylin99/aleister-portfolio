'use client';

import { useState, useEffect } from 'react';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CircleAction = 'join' | 'skip' | null;

interface DefaultCircle {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
}

interface JoinCircleStepProps {
  data: {
    action: CircleAction;
    inviteCode: string;
    circleName: string;
  };
  onChange: (data: {
    action: CircleAction;
    inviteCode: string;
    circleName: string;
  }) => void;
}

export function JoinCircleStep({ data, onChange }: JoinCircleStepProps) {
  const [defaultCircle, setDefaultCircle] = useState<DefaultCircle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDefault() {
      try {
        const res = await fetch('/api/circle/default');
        const json = await res.json();
        setDefaultCircle(json.circle || null);
      } catch {
        setDefaultCircle(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDefault();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-1">Join a Circle</h2>
          <p className="text-[var(--text-muted)] text-sm">
            Circles let you compete with friends on portfolio performance
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[var(--gb-gold)] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-1">Join a Circle</h2>
        <p className="text-[var(--text-muted)] text-sm">
          Circles let you compete with friends on portfolio performance
        </p>
      </div>

      {defaultCircle ? (
        <div className="space-y-3">
          {/* Default circle card */}
          <button
            onClick={() =>
              onChange({
                ...data,
                action: 'join',
                inviteCode: defaultCircle.inviteCode,
              })
            }
            className={cn(
              'w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left',
              data.action === 'join'
                ? 'bg-[var(--gb-gold)]/10 border-[var(--gb-gold-border-strong)] ring-1 ring-[var(--gb-gold)]/20'
                : 'bg-[var(--gb-azure-deep)]/30 border-[var(--gb-gold-border)]/30 hover:border-[var(--gb-gold-border)]/50'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                data.action === 'join'
                  ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)]'
                  : 'bg-[var(--gb-azure-deep)] text-[var(--text-muted)]'
              )}
            >
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[var(--gb-parchment)] font-semibold">{defaultCircle.name}</p>
              <p className="text-[var(--text-muted)] text-sm">
                {defaultCircle.memberCount} {defaultCircle.memberCount === 1 ? 'member' : 'members'}
              </p>
            </div>
            <ArrowRight className={cn(
              "w-5 h-5 transition-colors",
              data.action === 'join' ? 'text-[var(--gb-gold)]' : 'text-[var(--text-subtle)]'
            )} />
          </button>

          {/* Skip option */}
          <button
            onClick={() =>
              onChange({ ...data, action: 'skip', inviteCode: '' })
            }
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'skip'
                ? 'bg-[var(--gb-azure)]/30 border-[var(--gb-gold-border)]/50 ring-1 ring-slate-500/20'
                : 'bg-[var(--gb-azure-deep)]/20 border-[var(--gb-gold-border)]/20 hover:border-[var(--gb-gold-border)]/40'
            )}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--gb-azure-deep)] text-[var(--text-muted)]">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] font-medium text-sm">Skip for now</p>
              <p className="text-[var(--text-subtle)] text-xs">You can join a circle later</p>
            </div>
          </button>
        </div>
      ) : (
        /* No default circle — show manual join or skip */
        <div className="space-y-3">
          <button
            onClick={() => onChange({ ...data, action: 'join' })}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'join'
                ? 'bg-[var(--gb-gold)]/10 border-[var(--gb-gold-border-strong)] ring-1 ring-[var(--gb-gold)]/20'
                : 'bg-[var(--gb-azure-deep)]/30 border-[var(--gb-gold-border)]/30 hover:border-[var(--gb-gold-border)]/50'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                data.action === 'join'
                  ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)]'
                  : 'bg-[var(--gb-azure-deep)] text-[var(--text-muted)]'
              )}
            >
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[var(--gb-parchment)] font-medium text-sm">Join a Circle</p>
              <p className="text-[var(--text-muted)] text-xs">Enter an invite code from a friend</p>
            </div>
          </button>

          <button
            onClick={() =>
              onChange({ ...data, action: 'skip', inviteCode: '' })
            }
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'skip'
                ? 'bg-[var(--gb-azure)]/30 border-[var(--gb-gold-border)]/50 ring-1 ring-slate-500/20'
                : 'bg-[var(--gb-azure-deep)]/20 border-[var(--gb-gold-border)]/20 hover:border-[var(--gb-gold-border)]/40'
            )}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--gb-azure-deep)] text-[var(--text-muted)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] font-medium text-sm">Skip for now</p>
              <p className="text-[var(--text-subtle)] text-xs">You can join or create a circle later</p>
            </div>
          </button>

          {/* Manual invite code input */}
          {data.action === 'join' && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Invite Code
              </label>
              <input
                type="text"
                value={data.inviteCode}
                onChange={(e) =>
                  onChange({
                    ...data,
                    inviteCode: e.target.value.toUpperCase().trim(),
                  })
                }
                placeholder="e.g., A1B2C3D4"
                maxLength={8}
                className="w-full px-4 py-3 bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)] rounded-xl text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold-border-strong)] focus:ring-1 focus:ring-[var(--gb-gold)]/25 transition-colors uppercase tracking-widest font-mono text-center text-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
