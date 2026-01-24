'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Holdings', href: '/holdings', icon: Wallet },
  { name: 'ETF Overview', href: '/etf', icon: FileText },
];

interface SidebarData {
  totalValue: number;
  dayChangePercent: number;
  holdingsCount: number;
  etfPrice: number;
  etfChange: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricesRes, etfRes] = await Promise.all([
          fetch('/api/prices'),
          fetch('/api/etf'),
        ]);
        
        const prices = await pricesRes.json();
        const etf = await etfRes.json();
        
        setData({
          totalValue: prices.summary?.totalValue || 0,
          dayChangePercent: prices.summary?.dayChangePercent || 0,
          holdingsCount: prices.holdings?.length || 0,
          etfPrice: etf.currentPrice || 100,
          etfChange: etf.dayChangePercent || 0,
        });
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    }
    
    fetchData();
  }, []);

  const isPositive = (data?.dayChangePercent || 0) >= 0;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card text-white"
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

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-72 transform transition-transform duration-300 ease-out",
        "bg-[#080812]/90 backdrop-blur-xl border-r border-[rgba(139,92,246,0.15)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="p-6 border-b border-[rgba(139,92,246,0.1)]">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PathFinder</h1>
              <span className="text-xs font-medium text-violet-400 tracking-widest">ETF</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-4">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white border border-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-violet-400" : "text-slate-500"
                )} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(139,92,246,0.1)]">
          {/* $ALIN Price */}
          <div className="glass-card p-4 rounded-xl mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">$ALIN</span>
              {data && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  data.etfChange >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {data.etfChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercentagePrecise(data.etfChange)}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              ${data?.etfPrice.toFixed(2) || '100.00'}
            </p>
          </div>

          {/* Portfolio Summary */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isPositive ? "bg-emerald-500/20" : "bg-red-500/20"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400">Portfolio Value</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {data ? formatCurrency(data.totalValue) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              )}>
                {data ? formatPercentagePrecise(data.dayChangePercent) : '—'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                {data?.holdingsCount || 0} Holdings
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
