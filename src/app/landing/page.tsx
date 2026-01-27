'use client';

import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <LandingHero />
    </div>
  );
}
