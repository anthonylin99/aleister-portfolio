'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { AllocationDonut } from '@/components/charts/AllocationDonut';
import { HoldingsBar } from '@/components/charts/HoldingsBar';
import { TopHoldingCard } from '@/components/cards/TopHoldingCard';
import { StatCard } from '@/components/cards/StatCard';
import { PortfolioSelector, PortfolioView } from '@/components/portfolio/PortfolioSelector';
import { TodaysMovers } from '@/components/dashboard/TodaysMovers';
import { useUserPortfolio, useUserProfile, useAggregatedPortfolio } from '@/lib/hooks';
import { useClearSensitiveData } from '@/lib/use-clear-on-leave';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  PieChart,
  TrendingUp,
  Layers,
  RefreshCw,
  Plus,
  Users,
  Lock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollBanner } from '@/components/ui/ScrollBanner';
import { OrnateDivider } from '@/components/ui/OrnateDivider';

/**
 * UserDashboard - Granblue Skyfarer Bridge
 *
 * The Captain's Bridge - where the Skyfarer views their fleet status,
 * holdings (Relics), and market conditions (Scrying data).
 */

export default function UserDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const { profile, loading: profileLoading } = useUserProfile();
  const [portfolioView, setPortfolioView] = useState<PortfolioView>('personal');

  useClearSensitiveData();

  const userPortfolio = useUserPortfolio();
  const aggregatedPortfolio = useAggregatedPortfolio(portfolioView);

  const { holdings, summary, categories, loading, error, refresh } =
    portfolioView === 'personal'
      ? userPortfolio
      : aggregatedPortfolio;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && profile && !profile.onboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, profileLoading, profile, router]);

  // Magic Circle Loader
  const MagicLoader = ({ message }: { message: string }) => (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />
      <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="magic-circle-loader">
            <div className="magic-circle-inner" />
          </div>
          <p className="text-[var(--text-secondary)] font-cinzel text-sm tracking-wide">{message}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <MagicLoader message="Attuning to the Aether..." />;
  }

  // Sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="gradient-card p-10 text-center max-w-md filigree-corners">
            <div className="card-gradient-animated opacity-10" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[var(--gb-gold)] bg-gradient-to-br from-[var(--gb-gold)]/20 to-[var(--gb-crystal-blue)]/15 flex items-center justify-center shadow-lg shadow-[var(--gb-gold)]/20">
                <Lock className="w-8 h-8 text-[var(--gb-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">
                Skyfarer Access Required
              </h2>
              <p className="text-[var(--text-secondary)] mb-8">
                Board the ship to view your fleet and track your relics across the skies.
              </p>
              <button
                onClick={() => signIn('google')}
                className="btn-primary w-full justify-center"
              >
                <Sparkles className="w-4 h-4" />
                Enter Aleister
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return <MagicLoader message="Consulting the Oracle..." />;
  }

  if (loading && holdings.length === 0) {
    return <MagicLoader message="Scrying market crystals..." />;
  }

  if (error && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="gradient-card p-8 text-center max-w-md filigree-corners">
            <p className="text-[var(--negative)] mb-4">The crystal has shattered: {error}</p>
            <button
              onClick={refresh}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Attune Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topHoldings = holdings.slice(0, 5);

  const getHeaderInfo = () => {
    if (portfolioView === 'combined') {
      return { ticker: 'COMBINED', name: 'Combined Fleet' };
    }
    return {
      ticker: profile?.etfTicker || 'ETF',
      name: profile?.etfName || 'My Fleet',
    };
  };

  const { ticker: etfTicker, name: etfName } = getHeaderInfo();

  // Empty portfolio
  if (holdings.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10">
          <Header
            title={`$${etfTicker}`}
            subtitle={etfName}
            totalValue={0}
            change={0}
            changePercent={0}
            lastUpdated={new Date().toISOString()}
          />
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div className="gradient-card p-10 max-w-md filigree-corners">
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
                <Link href="/holdings" className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" />
                  Acquire First Relic
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      {/* Granblue sky background */}
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        {/* Compass Rose */}
        <div className="flex justify-center mb-2 opacity-40">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="var(--gb-gold)" opacity="0.8"/>
            <circle cx="12" cy="12" r="2" fill="var(--gb-gold)" opacity="0.6"/>
          </svg>
        </div>
        <Header
          title={`$${etfTicker}`}
          subtitle={etfName}
          totalValue={summary.totalValue}
          change={summary.dayChange}
          changePercent={summary.dayChangePercent}
          lastUpdated={summary.lastUpdated}
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <PortfolioSelector
            selected={portfolioView}
            onSelect={setPortfolioView}
            personalLabel={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Fleet'}
          />

          <div className="flex-1" />

          <button
            onClick={refresh}
            disabled={loading}
            className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border-strong)] transition-all disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-cinzel text-xs">{loading ? 'Scrying...' : 'Re-scry'}</span>
          </button>

          {profile?.circleId ? (
            <Link
              href="/circle"
              className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border-strong)] transition-all text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              <span className="font-cinzel text-xs">View Guild</span>
            </Link>
          ) : (
            <Link
              href="/circle"
              className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[var(--gb-gold)] hover:text-[var(--gb-gold-light)] hover:border-[var(--gb-gold-border-strong)] transition-all text-sm font-medium border-[var(--gb-gold-border)]"
            >
              <Users className="w-4 h-4" />
              <span className="font-cinzel text-xs">Join Guild</span>
            </Link>
          )}
        </div>

        <OrnateDivider />

        {/* Summon Stone Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Relics"
            value={summary.holdingsCount.toString()}
            icon={Wallet}
            gradient={1}
          />
          <StatCard
            label="Categories"
            value={summary.categoriesCount.toString()}
            icon={Layers}
            gradient={2}
          />
          <StatCard
            label="Prime Relic"
            value={formatCurrency(topHoldings[0]?.value || 0)}
            change={topHoldings[0]?.ticker}
            changeType="neutral"
            icon={TrendingUp}
            gradient={3}
          />
          <StatCard
            label="Avg. Position"
            value={formatCurrency(summary.totalValue / summary.holdingsCount || 0)}
            icon={PieChart}
            gradient={4}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          <div className="xl:col-span-7 parchment-scroll filigree-corners">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <ScrollBanner>Armory</ScrollBanner>
                  <p className="text-sm text-[var(--text-muted)] mt-2">Relics sorted by value</p>
                </div>
                <span className="text-sm text-[var(--text-subtle)] px-3 py-1 rounded-full bg-[var(--gb-gold)]/5 border border-[var(--gb-gold-border)] font-cinzel">
                  {holdings.length} relics
                </span>
              </div>
              <HoldingsBar holdings={holdings} />
            </div>
          </div>

          <div className="xl:col-span-5 parchment-card filigree-corners p-6">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <ScrollBanner>Navigator</ScrollBanner>
                  <p className="text-sm text-[var(--text-muted)] mt-2">By territory</p>
                </div>
              </div>
              <AllocationDonut data={categories} totalValue={summary.totalValue} />
            </div>
          </div>
        </div>

        {/* Wind Report + Top Holdings */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          <div className="xl:col-span-4">
            <TodaysMovers holdings={holdings} maxItems={3} />
          </div>

          {topHoldings.length > 0 && (
            <div className="xl:col-span-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Prime Relics</h3>
                  <p className="text-sm text-[var(--text-muted)]">Most valuable holdings</p>
                </div>
                <Link
                  href="/holdings"
                  className="text-sm text-[var(--gb-gold)] hover:text-[var(--gb-gold-light)] font-medium transition-colors font-cinzel"
                >
                  View armory
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {topHoldings.slice(0, 4).map((holding, index) => (
                  <TopHoldingCard
                    key={holding.ticker}
                    holding={holding}
                    rank={index + 1}
                    portfolioPercentage={holding.weight}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
