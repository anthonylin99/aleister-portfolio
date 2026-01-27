'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks';

export function LandingHero() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section with Background Image */}
      <section 
        className="relative flex-1 flex items-center justify-center min-h-[800px] h-screen"
        style={{
          backgroundImage: 'url(/prometheus truth dragon.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark Overlay for Text Readability - Strong overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-6 tracking-tight leading-none drop-shadow-2xl font-sans">
            PROMETHEUS ETF
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-200 mb-12 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-sans">
            The modern portfolio tracker bringing fire to your finances.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xl rounded-xl transition-all duration-200 shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 hover:scale-105 active:scale-95 font-sans"
          >
            Get Started
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
