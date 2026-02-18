'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ScrollBanner } from '@/components/ui/ScrollBanner';
import { OrnateDivider } from '@/components/ui/OrnateDivider';

/**
 * LandingSections - Granblue Skyfarer bento grid with golden accents
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5';
  className?: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, gradient, className = '', delay = 0 }: FeatureCardProps) {
  return (
    <div
      className={`bento-card ${gradient} ${className} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gb-gold)]/30 to-transparent" />

      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--gb-gold)]/10 backdrop-blur flex items-center justify-center border border-[var(--gb-gold-border)]">
          {icon}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-[var(--gb-parchment)] mb-2 font-cinzel">{title}</h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>

      <div className="mt-4 flex items-center gap-2 text-[var(--gb-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium font-cinzel">Learn more</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}

function LargeFeatureCard({
  title,
  description,
  visual,
  gradient,
  className = '',
  delay = 0,
}: {
  title: string;
  description: string;
  visual: React.ReactNode;
  gradient: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5';
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`bento-card ${gradient} ${className} animate-fade-in-up group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 mb-6 relative min-h-[200px] rounded-xl overflow-hidden bg-[var(--gb-gold)]/5">
          {visual}
        </div>

        <h3 className="text-2xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">{title}</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LandingSections() {
  return (
    <>
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gb-gold)]/10 border border-[var(--gb-gold-border)] mb-6">
              <Sparkles className="w-4 h-4 text-[var(--gb-gold)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Arcana</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--gb-parchment)] mb-4 tracking-tight font-cinzel">
              Everything you need
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Powerful tools to track, analyze, and optimize your fleet
            </p>
            <OrnateDivider className="max-w-md mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LargeFeatureCard
              title="Real-Time Fleet Scrying"
              description="Monitor your relics with live price updates. See your fleet value change in real-time throughout the trading day."
              gradient="gradient-1"
              className="lg:col-span-2 lg:row-span-2"
              delay={0}
              visual={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full p-6">
                    <div className="absolute inset-6 flex items-end justify-around gap-2">
                      {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 68].map((height, i) => (
                        <div
                          key={i}
                          className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[var(--gb-gold)] to-[var(--gb-crystal-blue)] opacity-60"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--gb-gold)]/20 to-transparent" />
                  </div>
                </div>
              }
            />

            <FeatureCard
              icon={<Target className="w-6 h-6 text-[var(--gb-crystal-blue)]" />}
              title="AI Oracle"
              description="Get AI-powered investment research and thesis validation with Claude"
              gradient="gradient-2"
              delay={100}
            />

            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-[var(--positive)]" />}
              title="Benchmark Comparison"
              description="Compare your performance against SPY, QQQ, and major indices"
              gradient="gradient-3"
              delay={200}
            />

            <FeatureCard
              icon={<Users className="w-6 h-6 text-[var(--gb-gold)]" />}
              title="Skyfarer Guilds"
              description="Share your fleet with friends and see how your guild performs"
              gradient="gradient-5"
              delay={300}
            />

            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[var(--gb-crystal-blue)]" />}
              title="Catalyst Tracking"
              description="Never miss an earnings report, dividend, or market-moving event"
              gradient="gradient-4"
              delay={400}
            />

            <LargeFeatureCard
              title="Risk Analytics"
              description="Understand your fleet's risk profile with volatility metrics, drawdown analysis, and sector concentration insights."
              gradient="gradient-2"
              className="lg:col-span-2"
              delay={500}
              visual={
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.2)"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="20"
                        strokeDasharray="150 251.2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="20"
                        strokeDasharray="60 251.2"
                        strokeDashoffset="-150"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#5DADE2" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2ECC71" />
                          <stop offset="100%" stopColor="#1ABC9C" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--gb-parchment)] font-cinzel">72%</div>
                        <div className="text-xs text-[var(--text-secondary)]">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 stream-right opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--gb-azure-deep)]/50 to-[var(--gb-azure-deep)]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <ScrollBanner className="mb-6 text-sm">About Aleister</ScrollBanner>

              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--gb-parchment)] mb-6 tracking-tight font-cinzel">
                Awakening the
                <span className="glow-text-stripe"> adept investor</span>
              </h2>

              <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
                Aleister Crowley taught that true magick is the science and art of causing change
                in conformity with Will. Every thesis is an invocation, every conviction trade an act of Will.
              </p>

              <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
                The financial establishment guards its secrets like the old mystery schools. Aleister
                exists to awaken you&mdash;democratizing access to sophisticated portfolio tracking, AI-powered
                analysis, and transparent investment methodology.
              </p>

              <Link href="/dashboard" className="btn-primary">
                Start Tracking
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="gradient-card p-8 filigree-corners">
                <div className="card-gradient-animated opacity-20" />

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--gb-gold)] to-[var(--gb-crystal-blue)] p-[2px]">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-[var(--gb-azure-deep)]">
                      <Image
                        src="/aleister.png"
                        alt="Aleister"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center p-4 rounded-xl bg-[var(--gb-gold)]/5 border border-[var(--gb-gold-border)]">
                      <div className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">$2M+</div>
                      <div className="text-sm text-[var(--text-muted)]">Tracked</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[var(--gb-gold)]/5 border border-[var(--gb-gold-border)]">
                      <div className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">24/7</div>
                      <div className="text-sm text-[var(--text-muted)]">Monitoring</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[var(--gb-gold)]/5 border border-[var(--gb-gold-border)]">
                      <div className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">AI</div>
                      <div className="text-sm text-[var(--text-muted)]">Powered</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[var(--gb-gold)]/5 border border-[var(--gb-gold-border)]">
                      <div className="text-3xl font-bold text-[var(--positive)] font-cinzel">+18%</div>
                      <div className="text-sm text-[var(--text-muted)]">YTD</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--gb-gold)]/30 to-transparent blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gb-crystal-blue)]/30 to-transparent blur-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--gb-parchment)] mb-6 tracking-tight font-cinzel">
            Ready to set sail on
            <br />
            <span className="glow-text-stripe">your journey?</span>
          </h2>

          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Join fellow Skyfarers using Aleister to navigate the markets with confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-lg px-10 py-5">
              Embark Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
