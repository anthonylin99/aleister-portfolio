'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolioViewing } from '@/lib/portfolio-context';
import { useSession } from 'next-auth/react';

interface CircleMember {
  userId: string;
  name: string;
  etfTicker: string;
  etfName: string;
  avatarColor: string;
  isCurrentUser: boolean;
}

export function PortfolioSwitcher() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ etfTicker?: string; etfName?: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { viewing, switchToUser, switchToSelf } = usePortfolioViewing();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch circle members
        const res = await fetch('/api/circle/portfolios');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
        
        // Fetch user profile if authenticated
        if (isAuthenticated) {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserProfile(profileData);
          }
        }
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show for authenticated users even without circle members
  if (loading || (!isAuthenticated && members.length <= 1)) {
    return null;
  }

  const currentMember = members.find(m => m.isCurrentUser);
  const myTicker = userProfile?.etfTicker || currentMember?.etfTicker || 'PORTFOLIO';
  const myName = userProfile?.etfName || currentMember?.etfTicker || 'My Portfolio';
  
  // Determine what's currently active
  const activeTicker = viewing ? viewing.etfTicker : myTicker;
  const activeLabel = viewing ? viewing.name : 'My Portfolio';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "bg-[var(--gb-azure-deep)]/60 border border-[var(--gb-gold-border)]/40 hover:border-[var(--gb-gold-border-strong)]",
          viewing ? "text-[var(--gb-gold)]" : "text-[var(--text-secondary)]"
        )}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: viewing
              ? viewing.avatarColor
              : currentMember?.avatarColor || '#D4AF37',
          }}
        />
        <span className="font-mono">${activeTicker}</span>
        {viewing && (
          <span className="text-[var(--text-subtle)] text-xs">({activeLabel})</span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--text-subtle)] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)]/60 rounded-xl shadow-xl overflow-hidden z-50">
          {/* My Portfolio */}
          <div className="px-3 py-2 border-b border-[var(--gb-gold-border)]/40">
            <p className="text-[11px] text-[var(--text-subtle)] uppercase tracking-wider font-semibold">
              My Portfolio
            </p>
          </div>
          <button
            onClick={() => {
              switchToSelf();
              setOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--gb-azure)]/40 transition-colors text-left",
              !viewing && "bg-[var(--gb-gold)]/10"
            )}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentMember?.avatarColor || '#D4AF37' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[var(--gb-parchment)] text-sm font-mono font-semibold">
                  ${myTicker}
                </span>
                <span className="text-[10px] text-[var(--text-subtle)] font-medium">(You)</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs truncate">{myName}</p>
            </div>
            {!viewing && (
              <Check className="w-4 h-4 text-[var(--gb-gold)] flex-shrink-0" />
            )}
          </button>

          {/* Circle Members */}
          {members.length > 1 && (
            <>
              <div className="px-3 py-2 border-b border-t border-[var(--gb-gold-border)]/40">
                <p className="text-[11px] text-[var(--text-subtle)] uppercase tracking-wider font-semibold">
                  Circle Members
                </p>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {members.filter(m => !m.isCurrentUser).map((member) => {
                  const isActive = viewing?.userId === member.userId;

                  return (
                    <button
                      key={member.userId}
                      onClick={() => {
                        switchToUser({
                          userId: member.userId,
                          etfTicker: member.etfTicker,
                          etfName: member.etfName,
                          name: member.name,
                          avatarColor: member.avatarColor,
                        });
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--gb-azure)]/40 transition-colors text-left",
                        isActive && "bg-[var(--gb-gold)]/10"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--gb-parchment)] text-sm font-mono font-semibold">
                            ${member.etfTicker}
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] text-xs truncate">{member.etfName}</p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-[var(--gb-gold)] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
