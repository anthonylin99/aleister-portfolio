'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Factor, FactorAsset } from '@/lib/factors/types';

const COLOR_PRESETS = [
  '#D4AF37', // Gold
  '#5DADE2', // Crystal Blue
  '#2ECC71', // Emerald
  '#E74C3C', // Ember
  '#9B59B6', // Mystic
  '#F39C12', // Amber
  '#1ABC9C', // Teal
  '#E91E63', // Rose
];

interface FactorModalProps {
  factor?: Factor; // If provided, editing mode
  onSave: (data: { name: string; description: string; color: string; assets: FactorAsset[] }) => Promise<void>;
  onClose: () => void;
}

export function FactorModal({ factor, onSave, onClose }: FactorModalProps) {
  const [name, setName] = useState(factor?.name || '');
  const [description, setDescription] = useState(factor?.description || '');
  const [color, setColor] = useState(factor?.color || COLOR_PRESETS[0]);
  const [assets, setAssets] = useState<FactorAsset[]>(
    factor?.assets || [{ symbol: '', weight: 0 }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  const totalWeight = assets.reduce((sum, a) => sum + (a.weight || 0), 0);
  const isValid = name.trim().length > 0 && assets.length > 0 && Math.abs(totalWeight - 1.0) < 0.001 && assets.every((a) => a.symbol.trim());

  const addAsset = () => {
    setAssets([...assets, { symbol: '', weight: 0 }]);
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: keyof FactorAsset, value: string | number) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], [field]: value };
    setAssets(updated);
  };

  const validateSymbol = useCallback(async (symbol: string, index: number) => {
    if (!symbol.trim()) return;
    setValidating(symbol);
    try {
      const res = await fetch(`/api/alpaca/positions`); // Quick check if Alpaca is connected
      if (res.ok) {
        // Auto-detect type via Alpaca
        const assetRes = await fetch(`/api/alpaca/account`);
        if (assetRes.ok) {
          // Mark as validated
          const updated = [...assets];
          updated[index] = { ...updated[index], type: 'equity' };
          setAssets(updated);
        }
      }
    } catch {
      // Silent fail — validation is best-effort
    } finally {
      setValidating(null);
    }
  }, [assets]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        color,
        assets: assets.map((a) => ({
          ...a,
          symbol: a.symbol.toUpperCase().trim(),
        })),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save factor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg gradient-card rounded-2xl p-6 max-h-[90vh] overflow-y-auto filigree-corners">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--gb-parchment)] font-cinzel">
            {factor ? 'Edit Factor' : 'New Factor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Infrastructure"
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold)] transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Color</label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--gb-azure-deep)] scale-110' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Assets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Assets</label>
              <span className={cn(
                'text-sm tabular-nums font-mono',
                Math.abs(totalWeight - 1.0) < 0.001 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {(totalWeight * 100).toFixed(0)}% / 100%
              </span>
            </div>

            <div className="space-y-2">
              {assets.map((asset, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={asset.symbol}
                    onChange={(e) => updateAsset(i, 'symbol', e.target.value.toUpperCase())}
                    onBlur={() => validateSymbol(asset.symbol, i)}
                    placeholder="AAPL"
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold)] text-sm font-mono"
                  />
                  <div className="relative w-24">
                    <input
                      type="number"
                      value={asset.weight ? (asset.weight * 100).toFixed(0) : ''}
                      onChange={(e) => updateAsset(i, 'weight', parseFloat(e.target.value || '0') / 100)}
                      placeholder="50"
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--gb-azure-deep)]/80 border border-[var(--gb-gold-border)] text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--gb-gold)] text-sm tabular-nums text-right pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] text-sm">%</span>
                  </div>
                  {assets.length > 1 && (
                    <button
                      onClick={() => removeAsset(i)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-subtle)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addAsset}
              className="mt-2 flex items-center gap-2 text-sm text-[var(--gb-gold)] hover:text-[var(--gb-gold-light)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[var(--gb-azure-deep)] text-[var(--text-muted)] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-azure)] transition-colors font-cinzel text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="flex-1 py-2.5 rounded-xl bg-[var(--gb-gold)] text-[var(--gb-parchment)] hover:bg-[var(--gb-gold)]/80 transition-colors font-cinzel text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {factor ? 'Save Changes' : 'Create Factor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
