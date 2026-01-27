'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, Target, TrendingUp, Users, Zap, Shield } from 'lucide-react';

// Premium 3D glassmorphism icon container
function FeatureIcon({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  return (
    <div className="relative w-16 h-16 mb-6">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-40"
        style={{ background: gradient }}
      />
      {/* Glass container */}
      <div 
        className="relative w-full h-full rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10"
        style={{ 
          background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function LandingSections() {
  return (
    <>
      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#050510]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Features</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to track and analyze your portfolio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-Time Tracking */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)">
                <BarChart3 className="w-7 h-7 text-violet-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Monitor your portfolio with live price updates and performance metrics
              </p>
            </div>

            {/* AI Analysis */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)">
                <Target className="w-7 h-7 text-purple-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Get AI-powered investment research and thesis validation
              </p>
            </div>

            {/* Benchmark Comparison */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">Benchmark Comparison</h3>
              <p className="text-slate-400 leading-relaxed">
                Compare your performance against SPY, QQQ, and other benchmarks
              </p>
            </div>

            {/* Social Portfolio */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                <Users className="w-7 h-7 text-amber-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">Social Portfolio</h3>
              <p className="text-slate-400 leading-relaxed">
                Share your ETF with friends and compete on leaderboards
              </p>
            </div>

            {/* Catalyst Tracking */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)">
                <Zap className="w-7 h-7 text-cyan-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">Catalyst Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Track upcoming earnings, events, and catalysts for your holdings
              </p>
            </div>

            {/* Risk Metrics */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-rose-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10">
              <FeatureIcon gradient="linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)">
                <Shield className="w-7 h-7 text-rose-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold text-white mb-3">Risk Metrics</h3>
              <p className="text-slate-400 leading-relaxed">
                Analyze volatility, drawdowns, and risk-adjusted returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#050510] to-[#0a0a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            {/* Prometheus Logo with Premium Styling */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 to-purple-600/40 blur-2xl" />
              {/* Ring glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 animate-pulse" />
              {/* Image container */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-violet-500/50 shadow-2xl shadow-violet-500/30">
                <Image
                  src="/prometheus.png"
                  alt="Prometheus ETF"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">About Prometheus ETF</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
              In Greek mythology, Prometheus defied the gods to steal fire from Mount Olympus and gift it to humanity—giving mortals the power that was once reserved only for the divine.
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Today, the financial markets remain a modern Olympus. Prometheus ETF brings that fire to retail investors—democratizing access to sophisticated portfolio tracking, AI-powered analysis, and transparent investment methodology.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-5 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-2xl hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)',
            }}
          >
            Explore the Portfolio
          </Link>
        </div>
      </section>
    </>
  );
}
