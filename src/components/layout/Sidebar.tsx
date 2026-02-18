'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Compass,
  Menu,
  X,
  Users,
  LogIn,
  LogOut,
  TrendingDown,
  Star,
  Layers,
  TerminalSquare,
} from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SidebarData {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  etfPrice: number;
  etfChange: number;
  etfChangePercent: number;
  etfTicker?: string;
}

const publicNav = [
  { name: 'Bridge', href: '/', icon: LayoutDashboard },
  { name: 'Armory', href: '/holdings', icon: Wallet },
  { name: 'Horizons', href: '/explore', icon: Compass },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
  { name: 'Manifest', href: '/etf', icon: FileText },
];

const authNav = [
  { name: 'Bridge', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Armory', href: '/holdings', icon: Wallet },
  { name: 'Factors', href: '/factors', icon: Layers },
  { name: 'Terminal', href: '/terminal', icon: TerminalSquare },
  { name: 'Scout', href: '/dip-finder', icon: TrendingDown },
  { name: 'Horizons', href: '/explore', icon: Compass },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
  { name: 'Circle', href: '/circle', icon: Users },
  { name: 'Manifest', href: '/etf', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SidebarData | null>(null);

  const navigation = isAuthenticated ? authNav : publicNav;

  useEffect(() => {
    async function fetchData() {
      try {
        if (isAuthenticated) {
          const res = await fetch('/api/user/portfolio');
          if (res.ok) {
            const portfolio = await res.json();
            setData({
              totalValue: portfolio.summary?.totalValue || 0,
              dayChange: portfolio.summary?.dayChange || 0,
              dayChangePercent: portfolio.summary?.dayChangePercent || 0,
              holdingsCount: portfolio.holdings?.length || 0,
              etfPrice: 0,
              etfChange: 0,
              etfChangePercent: 0,
              etfTicker: undefined,
            });

            const profileRes = await fetch('/api/user/profile');
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setData((prev) =>
                prev
                  ? { ...prev, etfTicker: profile.etfTicker }
                  : prev
              );
            }
          }
        } else {
          const [pricesRes, etfRes] = await Promise.all([
            fetch('/api/prices'),
            fetch('/api/etf'),
          ]);

          const prices = await pricesRes.json();
          const etf = await etfRes.json();

          setData({
            totalValue: prices.summary?.totalValue || 0,
            dayChange: prices.summary?.dayChange || 0,
            dayChangePercent: prices.summary?.dayChangePercent || 0,
            holdingsCount: prices.holdings?.length || 0,
            etfPrice: etf.currentPrice || 100,
            etfChange: etf.dayChange || 0,
            etfChangePercent: etf.dayChangePercent || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const isPositive = (data?.dayChangePercent || 0) >= 0;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card text-[var(--gb-gold)]"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Command Deck Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-56 transform transition-transform duration-300 ease-out",
        "bg-[#0A1628]/95 backdrop-blur-xl border-r border-[var(--gb-gold-border)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Ship Emblem / Logo Section */}
        <div className="p-4 border-b border-[var(--gb-gold-border)]">
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--gb-gold)] shadow-lg shadow-[var(--gb-gold)]/20 group-hover:shadow-[var(--gb-gold)]/40 transition-shadow">
                <Image
                  src="/aleister.png"
                  alt="Aleister"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gold ring glow */}
              <div className="absolute inset-0 rounded-full border border-[var(--gb-gold-light)] opacity-0 group-hover:opacity-50 transition-opacity scale-110" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--gb-parchment)] tracking-tight font-cinzel">Aleister</h1>
              <span className="text-xs font-medium text-[var(--gb-gold)] tracking-widest font-cinzel">SKYFARER</span>
            </div>
          </Link>
        </div>

        {/* Command Deck Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="text-xs font-semibold text-[var(--gb-gold-dark)] uppercase tracking-wider px-4 mb-4 font-cinzel">
            Command Deck
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[var(--gb-gold)]/15 to-[var(--gb-azure)]/30 text-[var(--gb-parchment)] border border-[var(--gb-gold-border-strong)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-gold)]/5"
                )}
              >
                {/* Gold circle border around icon */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                  isActive
                    ? "border-[var(--gb-gold)] bg-[var(--gb-gold)]/10 shadow-[0_0_8px_var(--gb-gold-border)]"
                    : "border-[var(--text-subtle)] bg-transparent"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[var(--gb-gold)]" : "text-[var(--text-muted)]"
                  )} />
                </div>
                <span className="font-cinzel text-xs tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gb-gold)] shadow-lg shadow-[var(--gb-gold)]/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats Summary */}
        <div className="absolute bottom-8 left-0 right-0 p-4 border-t border-[var(--gb-gold-border)]">
          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-[var(--gb-azure)]/50 hover:bg-[var(--gb-azure)]/70 border border-[var(--gb-gold-border)] text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-cinzel text-xs">Disembark</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-[var(--gb-gold)]/15 hover:bg-[var(--gb-gold)]/25 border border-[var(--gb-gold-border-strong)] text-[var(--gb-gold)] hover:text-[var(--gb-gold-light)] transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-cinzel text-xs">Board Ship</span>
            </Link>
          )}

          {/* ETF Price */}
          {!isAuthenticated && data && (
            <div className="glass-card p-3 rounded-xl mb-3 filigree-corners">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)] font-cinzel">$ALIN</span>
              </div>
              <p className="text-xl font-bold text-[var(--gb-parchment)] tabular-nums font-cinzel">
                ${data.etfPrice.toFixed(2)}
              </p>
              <p className={cn(
                "text-xs font-medium mt-1 tabular-nums",
                data.etfChangePercent >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}>
                {formatPercentagePrecise(data.etfChangePercent)} ({data.etfChange >= 0 ? '+' : ''}${Math.abs(data.etfChange).toFixed(2)})
              </p>
            </div>
          )}

          {/* Portfolio Summary */}
          <div className="glass-card p-3 rounded-xl filigree-corners">
            <div className="flex items-center gap-3">
              {isAuthenticated && session?.user ? (
                session.user.email?.toLowerCase() === 'anthonylin99@gmail.com' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--gb-gold)] flex-shrink-0">
                    <Image
                      src="/profile.png"
                      alt="Anthony"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm flex-shrink-0 border-2 border-[var(--gb-gold)]"
                    style={{ backgroundColor: 'var(--gb-gold)' }}
                  >
                    {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--gb-gold)] flex-shrink-0">
                  <Image
                    src="/profile.png"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-secondary)] font-cinzel">
                  {isAuthenticated
                    ? data?.etfTicker
                      ? `$${data.etfTicker}`
                      : 'Fleet Value'
                    : 'Fleet Value'}
                </p>
                {data && (
                  <p className={cn(
                    "text-base font-medium mt-0.5 tabular-nums",
                    isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
                  )}>
                    {formatPercentagePrecise(data.dayChangePercent)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
