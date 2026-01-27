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
    <nav className="fixed top-8 left-0 right-0 z-50 bg-[#050510]/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white hover:text-violet-400 transition-colors tracking-tight">
            Prometheus
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleScroll('features');
              }}
            >
              Features
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleScroll('about');
              }}
            >
              About
            </a>
          </div>

          {/* Dashboard Link */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
