'use client';

import { usePathname } from 'next/navigation';
import { BitcoinRain } from '@/components/effects/BitcoinRain';

export function ConditionalEffects() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  // Don't show background effects on landing page
  if (isLanding) {
    return null;
  }

  return (
    <>
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      
      {/* Bitcoin Rain Effect */}
      <BitcoinRain />
    </>
  );
}
