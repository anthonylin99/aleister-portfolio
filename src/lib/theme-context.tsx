'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * ThemeProvider - Granblue Skyfarer theme system
 *
 * Design Philosophy:
 * - Azure sky theme optimized for financial data
 * - Gold accent as the primary highlight
 * - Crystal blue secondary accents
 */

export type AccentColor = 'skyfarer' | 'gold' | 'blue' | 'emerald' | 'amber' | 'rose';

interface ThemeSettings {
  accent: AccentColor;
  showBitcoinRain: boolean;
}

interface ThemeContextType extends ThemeSettings {
  setAccent: (accent: AccentColor) => void;
  toggleBitcoinRain: () => void;
}

const defaultSettings: ThemeSettings = {
  accent: 'skyfarer',
  showBitcoinRain: true,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Granblue Skyfarer accent colors
const accentColors: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
  skyfarer: { primary: '#D4AF37', secondary: '#5DADE2', glow: 'rgba(212, 175, 55, 0.2)' },
  gold: { primary: '#D4AF37', secondary: '#E8C84A', glow: 'rgba(212, 175, 55, 0.25)' },
  blue: { primary: '#5DADE2', secondary: '#3498DB', glow: 'rgba(93, 173, 226, 0.2)' },
  emerald: { primary: '#2ECC71', secondary: '#1ABC9C', glow: 'rgba(46, 204, 113, 0.2)' },
  amber: { primary: '#F39C12', secondary: '#E67E22', glow: 'rgba(243, 156, 18, 0.2)' },
  rose: { primary: '#E74C3C', secondary: '#C0392B', glow: 'rgba(231, 76, 60, 0.2)' },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aleister-theme');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: convert old theme names to skyfarer
        const accent = (['cyan', 'stripe', 'violet'].includes(parsed.accent)) ? 'skyfarer' : (parsed.accent || defaultSettings.accent);
        setSettings({
          accent,
          showBitcoinRain: parsed.showBitcoinRain ?? defaultSettings.showBitcoinRain,
        });
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colors = accentColors[settings.accent];

    // Always dark mode
    root.classList.remove('light');
    root.classList.add('dark');

    // Granblue Skyfarer theme colors
    root.style.setProperty('--bg-primary', '#0D1B2A');
    root.style.setProperty('--bg-secondary', '#122640');
    root.style.setProperty('--bg-tertiary', '#1B3B5F');
    root.style.setProperty('--bg-elevated', '#1F4570');
    root.style.setProperty('--bg-card', 'rgba(27, 59, 95, 0.4)');
    root.style.setProperty('--bg-card-hover', 'rgba(27, 59, 95, 0.6)');

    // Text colors - parchment tones
    root.style.setProperty('--text-primary', '#FDF5E6');
    root.style.setProperty('--text-secondary', '#B8C6D4');
    root.style.setProperty('--text-muted', '#7A8FA0');
    root.style.setProperty('--text-subtle', '#556677');

    // Borders - gold-accented
    root.style.setProperty('--border-primary', `rgba(${hexToRgb(colors.primary)}, 0.25)`);
    root.style.setProperty('--border-secondary', 'rgba(212, 175, 55, 0.15)');
    root.style.setProperty('--card-border', `rgba(${hexToRgb(colors.primary)}, 0.25)`);
    root.style.setProperty('--card-border-hover', `rgba(${hexToRgb(colors.primary)}, 0.45)`);

    // Accent colors - dynamic based on selection
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--accent-glow', colors.glow);
    root.style.setProperty('--gradient-glow', `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 60%)`);

    // Skyfarer gradient colors
    root.style.setProperty('--stripe-purple', '#D4AF37');
    root.style.setProperty('--stripe-violet', '#E8C84A');
    root.style.setProperty('--stripe-fuchsia', '#5DADE2');
    root.style.setProperty('--stripe-pink', '#3498DB');
    root.style.setProperty('--stripe-coral', '#1ABC9C');
    root.style.setProperty('--stripe-amber', '#F39C12');

    // Save to localStorage
    localStorage.setItem('aleister-theme', JSON.stringify(settings));
  }, [settings, mounted]);

  const setAccent = (accent: AccentColor) => setSettings((s) => ({ ...s, accent }));
  const toggleBitcoinRain = () => setSettings((s) => ({ ...s, showBitcoinRain: !s.showBitcoinRain }));

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        ...settings,
        setAccent,
        toggleBitcoinRain,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper to convert hex to RGB for rgba() usage
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '212, 175, 55'; // Default to Skyfarer Gold
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
