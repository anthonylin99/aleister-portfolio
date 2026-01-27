'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingHero() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.3); // Parallax factor
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col pt-8"> {/* pt-8 for ticker tape */}
      {/* Hero Section with Background Image and Parallax */}
      <section 
        ref={heroRef}
        className="relative flex-1 flex items-center justify-center min-h-[800px] h-screen overflow-hidden"
      >
        {/* Parallax Background Image */}
        <div 
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{
            backgroundImage: 'url("/prometheus%20truth%20dragon.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${scrollY}px)`,
            willChange: 'transform',
          }}
        />
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/90 via-[#050510]/80 to-[#050510]/95" />
        
        {/* Accent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/15 via-transparent to-transparent" />
        
        {/* Radial spotlight effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-6 tracking-tight leading-none font-sans"
            style={{
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 8px 40px rgba(139, 92, 246, 0.2)',
            }}
          >
            PROMETHEUS ETF
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-200 mb-12 font-light max-w-3xl mx-auto leading-relaxed font-sans"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            The modern portfolio tracker bringing fire to your finances.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 text-white font-semibold text-xl rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-sans"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
            }}
          >
            Get Started
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
