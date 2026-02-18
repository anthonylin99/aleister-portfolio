'use client';

import Link from 'next/link';

export function LandingNav() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 bg-[var(--gb-azure-deep)]/60 backdrop-blur-xl border-b border-[var(--gb-gold-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold text-[var(--gb-parchment)] hover:text-[var(--gb-gold)] transition-colors tracking-tight font-cinzel">
            Aleister
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] transition-colors text-sm font-medium cursor-pointer font-cinzel"
              onClick={(e) => {
                e.preventDefault();
                handleScroll('features');
              }}
            >
              Features
            </a>
            <a
              href="#about"
              className="text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] transition-colors text-sm font-medium cursor-pointer font-cinzel"
              onClick={(e) => {
                e.preventDefault();
                handleScroll('about');
              }}
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--gb-parchment)] transition-colors text-sm font-medium font-cinzel"
            >
              Bridge
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
