'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/5">
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
                // Smooth scroll to features section (when implemented)
              }}
            >
              Features
            </a>
            <a
              href="#methodology"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                // Smooth scroll to methodology section (when implemented)
              }}
            >
              Methodology
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                // Smooth scroll to about section (when implemented)
              }}
            >
              About
            </a>
          </div>

          {/* Sign In Button */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium border border-white/20 backdrop-blur-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
