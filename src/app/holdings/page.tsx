'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { HoldingsTable } from '@/components/tables/HoldingsTable';
import { CategoryHoldingsSection } from '@/components/charts/CategoryHoldingsSection';
import { usePortfolio, useUserPortfolio, useUserProfile } from '@/lib/hooks';
import { RefreshCw, Plus, Wallet, Flame, Search, X, Loader2 } from 'lucide-react';
import { getRelativeTime, cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

export default function HoldingsPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Use the appropriate hook based on auth status
  const publicPortfolio = usePortfolio();
  const userPortfolio = useUserPortfolio();
  const { profile } = useUserProfile();

  // Select data based on auth status
  const { holdings, summary, categories, loading, refresh, cached } = isAuthenticated
    ? userPortfolio
    : publicPortfolio;

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ ticker: string; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/search/tickers?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddTicker = async (ticker: string) => {
    // Clear search results immediately to close dropdown
    setSearchResults([]);
    setAdding(ticker);
    try {
      const res = await fetch('/api/user/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, shares: 1 }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSearchQuery('');
        refresh();
      }
    } catch (err) {
      console.error('Failed to add ticker:', err);
    } finally {
      setAdding(null);
    }
  };

  if (loading && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="magic-circle-loader">
              <div className="magic-circle-inner" />
            </div>
            <p className="text-[var(--text-secondary)] font-cinzel text-sm tracking-wide">Scrying relics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for authenticated users with no holdings
  if (isAuthenticated && holdings.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <Header
              title="Armory"
              subtitle="Manage and track all relics in your fleet"
            />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center text-center">
            <div className="gradient-card p-10 rounded-2xl max-w-lg filigree-corners">
              <div className="card-gradient-animated opacity-10" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[var(--gb-gold)] bg-gradient-to-br from-[var(--gb-gold)]/20 to-[var(--gb-crystal-blue)]/15 flex items-center justify-center shadow-lg shadow-[var(--gb-gold)]/20">
                  <Wallet className="w-8 h-8 text-[var(--gb-gold)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">
                  Your armory is empty
                </h2>
                <p className="text-[var(--text-secondary)] mb-8">
                  Acquire your first relic to begin tracking your fleet&apos;s fortune.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Acquire First Relic
                  </button>
                  <Link
                    href="/"
                    className="btn-secondary"
                  >
                    <Flame className="w-4 h-4" />
                    View Aleister
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Relic Modal */}
        {showAddModal && (
          <AddTickerModal
            searchQuery={searchQuery}
            searchResults={searchResults}
            searching={searching}
            adding={adding}
            existingTickers={holdings.map(h => h.ticker.toUpperCase())}
            portfolioName={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Fleet'}
            onSearch={handleSearch}
            onAdd={handleAddTicker}
            onClose={() => {
              setShowAddModal(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      {/* Granblue sky background */}
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <Header
            title="Armory"
            subtitle={isAuthenticated && profile?.etfTicker ? `$${profile.etfTicker} Fleet` : "Manage and track all relics in your fleet"}
          />

          <div className="flex flex-wrap gap-2 self-start">
            {isAuthenticated && (
              <button
                onClick={() => setShowAddModal(true)}
                className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-[var(--gb-gold)] hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border-strong)] transition-all font-cinzel"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Relic</span>
              </button>
            )}

            {!isAuthenticated && (
              <Link
                href="/"
                className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-[var(--gb-gold)] hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border-strong)] transition-all font-cinzel"
              >
                <Flame className="w-4 h-4" />
                <span className="text-sm">Aleister</span>
              </Link>
            )}

            <button
              onClick={refresh}
              disabled={loading}
              className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border-strong)] transition-all disabled:opacity-50 font-cinzel"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {loading ? 'Scrying...' : 'Re-scry'}
              </span>
              {cached && summary.lastUpdated && (
                <span className="text-xs text-[var(--text-subtle)]">
                  ({getRelativeTime(summary.lastUpdated)})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Individual Holdings Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[var(--gb-parchment)] mb-4 font-cinzel">All Relics</h3>
          <HoldingsTable holdings={holdings} totalValue={summary.totalValue} onRefresh={refresh} />
        </div>

        {/* Category Overview with Pie Chart */}
        <div>
          <CategoryHoldingsSection data={categories} totalValue={summary.totalValue} />
        </div>
      </div>

      {/* Add Relic Modal */}
      {showAddModal && (
        <AddTickerModal
          searchQuery={searchQuery}
          searchResults={searchResults}
          searching={searching}
          adding={adding}
          existingTickers={holdings.map(h => h.ticker.toUpperCase())}
          portfolioName={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Fleet'}
          onSearch={handleSearch}
          onAdd={handleAddTicker}
          onClose={() => {
            setShowAddModal(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
      )}
    </div>
  );
}

interface AddTickerModalProps {
  searchQuery: string;
  searchResults: Array<{ ticker: string; name: string }>;
  searching: boolean;
  adding: string | null;
  existingTickers: string[];
  portfolioName: string;
  onSearch: (query: string) => void;
  onAdd: (ticker: string) => void;
  onClose: () => void;
}

function AddTickerModal({
  searchQuery,
  searchResults,
  searching,
  adding,
  existingTickers,
  portfolioName,
  onSearch,
  onAdd,
  onClose,
}: AddTickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative gradient-card p-6 rounded-2xl w-full max-w-md filigree-corners">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--gb-parchment)] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">Add Relic</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Adding to: <span className="text-[var(--gb-gold)] font-cinzel">{portfolioName}</span></p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by ticker or relic name..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)] rounded-xl text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold-border-strong)] focus:ring-1 focus:ring-[var(--gb-gold)]/25 transition-colors font-cinzel"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {searching && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="magic-circle-loader" style={{ width: '48px', height: '48px' }}>
                <div className="magic-circle-inner" />
              </div>
              <p className="text-[var(--text-secondary)] font-cinzel text-xs tracking-wide">Consulting the Oracle...</p>
            </div>
          )}

          {!searching && searchResults.length === 0 && searchQuery.length > 0 && (
            <p className="text-center text-[var(--text-subtle)] py-8 font-cinzel text-sm">No relics found in the archives</p>
          )}

          {!searching && searchResults.map((result) => {
            const isInPortfolio = existingTickers.includes(result.ticker.toUpperCase());

            return (
              <button
                key={result.ticker}
                onClick={() => onAdd(result.ticker)}
                disabled={adding === result.ticker}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  isInPortfolio
                    ? "bg-[var(--gb-gold)]/10 border border-[var(--gb-gold-border)]"
                    : "hover:bg-[var(--gb-azure)]/50 disabled:opacity-50"
                )}
              >
                <CompanyLogo ticker={result.ticker} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--gb-parchment)] font-cinzel">{result.ticker}</p>
                    {isInPortfolio && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gb-gold)]/20 text-[var(--gb-gold)] font-cinzel">
                        In Armory
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] truncate">{result.name}</p>
                  {isInPortfolio && (
                    <p className="text-xs text-[var(--gb-gold)] mt-1">Click to reinforce this relic</p>
                  )}
                </div>
                {adding === result.ticker ? (
                  <Loader2 className="w-5 h-5 text-[var(--gb-gold)] animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-[var(--gb-gold)]" />
                )}
              </button>
            );
          })}
        </div>

        {searchQuery.length === 0 && (
          <p className="text-center text-[var(--text-subtle)] text-sm py-4 font-cinzel">
            Speak a ticker symbol or relic name to scry the archives
          </p>
        )}
      </div>
    </div>
  );
}
