'use client';

import { useState } from 'react';
import { useTheme, AccentColor } from '@/lib/theme-context';
import { Settings, Sun, Moon, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const accentOptions: { id: AccentColor; name: string; color: string }[] = [
  { id: 'violet', name: 'Violet', color: '#8b5cf6' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
];

export function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, accent, showBitcoinRain, setMode, setAccent, toggleBitcoinRain } = useTheme();

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full glass-card flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/50 transition-all shadow-lg"
        title="Theme Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative glass-card p-6 rounded-2xl w-full max-w-sm">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              Theme Settings
            </h2>

            {/* Mode Toggle */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-400 mb-3 block">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('dark')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all',
                    mode === 'dark'
                      ? 'bg-slate-800 text-white border border-violet-500/50'
                      : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:text-white'
                  )}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => setMode('light')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all',
                    mode === 'light'
                      ? 'bg-white text-slate-900 border border-violet-500/50'
                      : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:text-white'
                  )}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-400 mb-3 block">Accent Color</label>
              <div className="grid grid-cols-6 gap-2">
                {accentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAccent(option.id)}
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all',
                      accent === option.id && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                    )}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  />
                ))}
              </div>
            </div>

            {/* Bitcoin Rain Toggle */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-3 block">Effects</label>
              <button
                onClick={toggleBitcoinRain}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                  showBitcoinRain
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:text-white'
                )}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Bitcoin Snow ₿
                </span>
                <span className="text-xs">{showBitcoinRain ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              Settings are saved locally
            </p>
          </div>
        </div>
      )}
    </>
  );
}
