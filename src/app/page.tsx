'use client';

import { TickerTape } from '@/components/landing/TickerTape';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingSections } from '@/components/landing/LandingSections';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050510]">
      <TickerTape />
      <LandingNav />
      <LandingHero />
      <LandingSections />
    </div>
  );
}
