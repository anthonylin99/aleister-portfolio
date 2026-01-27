'use client';

import { useTheme } from '@/lib/theme-context';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export function BitcoinRain() {
  const { showBitcoinRain } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles for the left side only
    const newParticles: Particle[] = [];
    const count = 15; // Number of falling bitcoins

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // 0-100px from left edge
        delay: Math.random() * 20, // Random start delay
        duration: 10 + Math.random() * 10, // 10-20 seconds to fall
        size: 12 + Math.random() * 10, // 12-22px
        opacity: 0.15 + Math.random() * 0.15, // More visible: 0.15-0.30
      });
    }
    setParticles(newParticles);
  }, []);

  if (!showBitcoinRain) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-32 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="bitcoin-rain-particle"
          style={{
            left: `${particle.x}px`,
            animationDuration: `${particle.duration}s, 5s`,
            animationDelay: `${particle.delay}s, ${particle.delay}s`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        >
          ₿
        </div>
      ))}
    </div>
  );
}
