'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';

interface ThemeSettings {
  mode: ThemeMode;
  accent: AccentColor;
  showBitcoinRain: boolean;
}

interface ThemeContextType extends ThemeSettings {
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  toggleBitcoinRain: () => void;
  toggleMode: () => void;
}

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  accent: 'violet',
  showBitcoinRain: true,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const accentColors: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
  violet: { primary: '#8b5cf6', secondary: '#6366f1', glow: 'rgba(139, 92, 246, 0.15)' },
  blue: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.15)' },
  emerald: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.15)' },
  amber: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.15)' },
  rose: { primary: '#f43f5e', secondary: '#e11d48', glow: 'rgba(244, 63, 94, 0.15)' },
  cyan: { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.15)' },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prometheus-theme');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
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

    // Mode
    root.classList.remove('light', 'dark');
    root.classList.add(settings.mode);

    // Light mode backgrounds
    if (settings.mode === 'light') {
      root.style.setProperty('--bg-primary', '#f8fafc');
      root.style.setProperty('--bg-secondary', '#f1f5f9');
      root.style.setProperty('--bg-tertiary', '#e2e8f0');
      root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--bg-card-hover', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-primary', `${colors.primary}30`);
      root.style.setProperty('--border-secondary', 'rgba(100, 116, 139, 0.3)');
    } else {
      root.style.setProperty('--bg-primary', '#050510');
      root.style.setProperty('--bg-secondary', '#0a0a1a');
      root.style.setProperty('--bg-tertiary', '#12122a');
      root.style.setProperty('--bg-card', 'rgba(15, 15, 35, 0.6)');
      root.style.setProperty('--bg-card-hover', 'rgba(20, 20, 45, 0.8)');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-primary', `${colors.primary}33`);
      root.style.setProperty('--border-secondary', 'rgba(100, 116, 139, 0.2)');
    }

    // Accent colors
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--gradient-glow', `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 60%)`);

    // Save to localStorage
    localStorage.setItem('prometheus-theme', JSON.stringify(settings));
  }, [settings, mounted]);

  const setMode = (mode: ThemeMode) => setSettings((s) => ({ ...s, mode }));
  const setAccent = (accent: AccentColor) => setSettings((s) => ({ ...s, accent }));
  const toggleBitcoinRain = () => setSettings((s) => ({ ...s, showBitcoinRain: !s.showBitcoinRain }));
  const toggleMode = () => setSettings((s) => ({ ...s, mode: s.mode === 'dark' ? 'light' : 'dark' }));

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        ...settings,
        setMode,
        setAccent,
        toggleBitcoinRain,
        toggleMode,
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
