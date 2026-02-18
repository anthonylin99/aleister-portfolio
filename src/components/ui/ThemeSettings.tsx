'use client';

import { useState } from 'react';
import { useTheme, AccentColor } from '@/lib/theme-context';
import { Settings, X, Sparkles, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeSettings - Skyfarer theme customization modal
 */

const accentOptions: { id: AccentColor; name: string; color: string }[] = [
  { id: 'skyfarer', name: 'Skyfarer', color: '#D4AF37' },
  { id: 'gold', name: 'Gold', color: '#E8C84A' },
  { id: 'blue', name: 'Crystal', color: '#5DADE2' },
  { id: 'emerald', name: 'Emerald', color: '#2ECC71' },
  { id: 'amber', name: 'Amber', color: '#F39C12' },
  { id: 'rose', name: 'Ember', color: '#E74C3C' },
];

export function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { accent, showBitcoinRain, setAccent, toggleBitcoinRain } = useTheme();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-all shadow-lg border border-[var(--gb-gold-border)] hover:border-[var(--gb-gold-border-strong)] bg-[var(--gb-azure-deep)]/90 backdrop-blur-sm hover:scale-105"
        title="Theme Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="gradient-card relative w-full max-w-sm animate-scale-in filigree-corners">
            <div className="card-gradient-animated opacity-10" />

            <div className="relative z-10 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--gb-parchment)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-[var(--gb-parchment)] mb-6 flex items-center gap-2 font-cinzel">
                <Palette className="w-5 h-5 text-[var(--gb-gold)]" />
                Arcana Settings
              </h2>

              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-3 block font-cinzel">
                  Accent Crystal
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {accentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAccent(option.id)}
                      className={cn(
                        'w-10 h-10 rounded-xl transition-all hover:scale-110',
                        accent === option.id &&
                          'ring-2 ring-[var(--gb-gold)] ring-offset-2 ring-offset-[var(--gb-azure-deep)] scale-110'
                      )}
                      style={{ backgroundColor: option.color }}
                      title={option.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-subtle)] mt-2">
                  Attuned: {accentOptions.find((o) => o.id === accent)?.name}
                </p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-3 block font-cinzel">
                  Effects
                </label>
                <button
                  onClick={toggleBitcoinRain}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                    showBitcoinRain
                      ? 'bg-[var(--gb-gold)]/15 text-[var(--gb-gold)] border border-[var(--gb-gold-border)]'
                      : 'bg-white/5 text-[var(--text-muted)] border border-white/10 hover:text-[var(--gb-parchment)] hover:border-[var(--gb-gold-border)]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Mana Snow
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      showBitcoinRain
                        ? 'bg-[var(--gb-gold)]/20'
                        : 'bg-white/10'
                    )}
                  >
                    {showBitcoinRain ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              <p className="text-xs text-[var(--text-subtle)] text-center mt-6">
                Settings are saved locally in your browser
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
