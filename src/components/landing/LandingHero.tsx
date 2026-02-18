'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * LandingHero - Granblue Skyfarer hero with azure sky and golden accents
 */
export function LandingHero() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.15);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col pt-8">
      <section
        ref={heroRef}
        className="relative flex-1 flex items-center justify-center min-h-[800px] h-screen overflow-hidden"
      >
        {/* Granblue Sky Background */}
        <div className="hero-gradient">
          <div
            className="gradient-orb gradient-orb-1"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${scrollY + mousePosition.y * 0.5}px)`,
            }}
          />
          <div
            className="gradient-orb gradient-orb-2"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${scrollY * 0.8 + mousePosition.y * 0.3}px)`,
            }}
          />
          <div
            className="gradient-orb gradient-orb-3"
            style={{
              transform: `translate(${mousePosition.x * 0.2}px, ${scrollY * 0.6 + mousePosition.y * 0.2}px)`,
            }}
          />
          <div className="stream-right absolute inset-0 opacity-30" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gb-azure-deep)]/95 via-[var(--gb-azure-deep)]/80 to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl parchment-scroll" style={{ background: 'linear-gradient(135deg, rgba(253,245,230,0.07) 0%, rgba(13,27,42,0.85) 100%)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gb-gold)]/10 border border-[var(--gb-gold-border)] mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-[var(--gb-gold)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                AI-Powered Fleet Intelligence
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100 font-cinzel">
              <span className="text-[var(--gb-parchment)]">Chart your course</span>
              <br />
              <span className="glow-text-stripe">across the skies.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10 animate-fade-in-up delay-200">
              The Skyfarer&apos;s portfolio tracker bringing fire to your finances.
              AI analysis, real-time scrying, and insights to navigate the markets.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4"
              >
                Board the Ship
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/explore"
                className="btn-secondary text-lg px-8 py-4"
              >
                Explore Horizons
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--gb-gold-border)] animate-fade-in-up delay-400">
              <p className="text-sm text-[var(--text-muted)] mb-4 font-cinzel">Trusted by Skyfarers tracking</p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-[var(--gb-parchment)] font-cinzel">$2M+</div>
                  <div className="text-sm text-[var(--text-muted)]">Fleet Value</div>
                </div>
                <div className="w-px h-10 bg-[var(--gb-gold-border)]" />
                <div>
                  <div className="text-2xl font-bold text-[var(--gb-parchment)] font-cinzel">500+</div>
                  <div className="text-sm text-[var(--text-muted)]">Relics Tracked</div>
                </div>
                <div className="w-px h-10 bg-[var(--gb-gold-border)]" />
                <div>
                  <div className="text-2xl font-bold text-[var(--gb-parchment)] font-cinzel">Real-time</div>
                  <div className="text-sm text-[var(--text-muted)]">Scrying Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in-up delay-500">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-[var(--gb-gold)]/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 rounded-full bg-[var(--gb-gold)] animate-bounce" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
