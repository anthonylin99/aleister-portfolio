'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCircle, useAuth } from '@/lib/hooks';
import { Leaderboard } from '@/components/circle/Leaderboard';
import { ActivityFeed } from '@/components/circle/ActivityFeed';
import { InviteCard } from '@/components/circle/InviteCard';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CirclePage() {
  const router = useRouter();
  const { circle, loading, refresh: refreshCircle } = useCircle();
  const { user } = useAuth();
  const [mode, setMode] = useState<'join' | 'create' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [circleName, setCircleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/circle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join guild');
        return;
      }
      // Wait for Redis propagation, then refresh without full reload
      await new Promise((r) => setTimeout(r, 300));
      refreshCircle();
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!circleName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: circleName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to found guild');
        return;
      }
      // Wait for Redis propagation, then refresh without full reload
      await new Promise((r) => setTimeout(r, 300));
      refreshCircle();
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="magic-circle-loader">
              <div className="magic-circle-inner" />
            </div>
            <p className="text-[var(--text-secondary)] font-cinzel text-sm tracking-wide">
              Summoning guild records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No circle — show join/create options
  if (!circle) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--gb-parchment)] mb-1 font-cinzel">Guild</h1>
            <p className="text-[var(--text-muted)] text-sm">
              Compete with fellow Skyfarers on portfolio performance
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="gradient-card filigree-corners">
              <div className="relative z-10 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--gb-gold)]/20 border border-[var(--gb-gold-border)] flex items-center justify-center">
                  <Users className="w-8 h-8 text-[var(--gb-gold)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">
                  Join or Found a Guild
                </h2>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Guilds let you see how your portfolio performs against fellow Skyfarers.
                  Only percentages are shared — never dollar amounts.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setMode('join')}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                      mode === 'join'
                        ? 'bg-[var(--gb-gold)]/10 border-[var(--gb-gold-border-strong)]'
                        : 'bg-[var(--gb-azure-deep)]/30 border-[var(--gb-gold-border)]/30 hover:border-[var(--gb-gold-border)]/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        mode === 'join'
                          ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)]'
                          : 'bg-[var(--gb-azure-deep)] text-[var(--text-muted)]'
                      )}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[var(--gb-parchment)] font-medium text-sm">
                        Join with Invite Code
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">
                        Enter a code from a fellow Skyfarer
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode('create')}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                      mode === 'create'
                        ? 'bg-[var(--gb-gold)]/10 border-[var(--gb-gold-border-strong)]'
                        : 'bg-[var(--gb-azure-deep)]/30 border-[var(--gb-gold-border)]/30 hover:border-[var(--gb-gold-border)]/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        mode === 'create'
                          ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)]'
                          : 'bg-[var(--gb-azure-deep)] text-[var(--text-muted)]'
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[var(--gb-parchment)] font-medium text-sm">
                        Found a New Guild
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">
                        Establish your own order
                      </p>
                    </div>
                  </button>
                </div>

                {mode === 'join' && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase().trim())
                      }
                      placeholder="Enter invite code"
                      maxLength={8}
                      className="w-full px-4 py-3 bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)] rounded-xl text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold-border-strong)] text-center uppercase tracking-widest font-mono"
                    />
                    <button
                      onClick={handleJoin}
                      disabled={submitting || !inviteCode.trim()}
                      className="btn-primary w-full justify-center"
                    >
                      {submitting ? (
                        <div className="magic-circle-loader" style={{ width: '1rem', height: '1rem' }}>
                          <div className="magic-circle-inner" />
                        </div>
                      ) : (
                        'Join Guild'
                      )}
                    </button>
                  </div>
                )}

                {mode === 'create' && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={circleName}
                      onChange={(e) => setCircleName(e.target.value)}
                      placeholder="Guild name"
                      className="w-full px-4 py-3 bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)] rounded-xl text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold-border-strong)]"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={submitting || !circleName.trim()}
                      className="btn-primary w-full justify-center"
                    >
                      {submitting ? (
                        <div className="magic-circle-loader" style={{ width: '1rem', height: '1rem' }}>
                          <div className="magic-circle-inner" />
                        </div>
                      ) : (
                        'Found Guild'
                      )}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-[var(--negative)] text-sm mt-3">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has circle — show leaderboard + activity
  const isOwner = circle.ownerId === user?.id;

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--gb-parchment)] mb-1 font-cinzel">
            {circle.name}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {circle.members.length} member{circle.members.length !== 1 ? 's' : ''}{' '}
            · Performance shown as percentages only
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - 2/3 width */}
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>

          {/* Sidebar: Invite + Activity - 1/3 width */}
          <div className="space-y-6">
            {isOwner && (
              <InviteCard
                inviteCode={circle.inviteCode}
                circleName={circle.name}
              />
            )}
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
