'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { FactorCard } from '@/components/factors/FactorCard';
import { FactorModal } from '@/components/factors/FactorModal';
import type { Factor, Allocation, FactorAsset } from '@/lib/factors/types';

export default function FactorsPage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFactor, setEditingFactor] = useState<Factor | undefined>();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/factors');
      if (res.ok) {
        const data = await res.json();
        setFactors(data.factors || []);
        setAllocations(data.allocations || []);
      }
    } catch (err) {
      console.error('Failed to fetch factors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAllocated = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const unallocated = 100 - totalAllocated;

  const handleSave = async (data: { name: string; description: string; color: string; assets: FactorAsset[] }) => {
    if (editingFactor) {
      const res = await fetch(`/api/factors/${editingFactor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update factor');
      }
    } else {
      const res = await fetch('/api/factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to create factor');
      }
    }
    setEditingFactor(undefined);
    await fetchData();
  };

  const handleDelete = async (factor: Factor) => {
    if (!confirm(`Delete "${factor.name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/factors/${factor.id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete factor:', err);
    }
  };

  const handleEdit = (factor: Factor) => {
    setEditingFactor(factor);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="magic-circle-loader">
              <div className="magic-circle-inner" />
            </div>
            <p className="text-[var(--text-secondary)] font-cinzel text-sm tracking-wide">
              Loading factors...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">Factor Builder</h1>
            <p className="text-[var(--text-muted)] mt-1">
              Define investment factors and allocate portfolio capital
            </p>
          </div>
          <button
            onClick={() => {
              setEditingFactor(undefined);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Factor
          </button>
        </div>

        {/* Allocation Summary */}
        <div className="gradient-card p-5 rounded-2xl mb-6 filigree-corners">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Portfolio Allocation</p>
              <div className="flex items-center gap-4 mt-1">
                {allocations.map((alloc) => {
                  const factor = factors.find((f) => f.id === alloc.factorId);
                  if (!factor) return null;
                  return (
                    <div key={alloc.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: factor.color }} />
                      <span className="text-sm text-[var(--gb-parchment)]">{factor.name}</span>
                      <span className="text-sm text-[var(--text-muted)] tabular-nums">{alloc.percentage}%</span>
                    </div>
                  );
                })}
                {unallocated > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-subtle)]" />
                    <span className="text-sm text-[var(--text-muted)]">Cash</span>
                    <span className="text-sm text-[var(--text-subtle)] tabular-nums">{unallocated}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Unallocated</p>
              <p className="text-2xl font-bold text-[var(--gb-parchment)] tabular-nums font-cinzel">
                {unallocated}%
              </p>
            </div>
          </div>

          {/* Allocation bar */}
          <div className="mt-3 h-2 bg-[var(--gb-azure-deep)] rounded-full overflow-hidden flex">
            {allocations.map((alloc) => {
              const factor = factors.find((f) => f.id === alloc.factorId);
              if (!factor) return null;
              return (
                <div
                  key={alloc.id}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${alloc.percentage}%`,
                    backgroundColor: factor.color,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Factor Grid */}
        {factors.length === 0 ? (
          <div className="gradient-card p-12 rounded-2xl text-center filigree-corners">
            <p className="text-[var(--text-muted)] mb-4">No factors defined yet</p>
            <button
              onClick={() => {
                setEditingFactor(undefined);
                setShowModal(true);
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Factor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {factors.map((factor) => (
              <FactorCard
                key={factor.id}
                factor={factor}
                allocation={allocations.find((a) => a.factorId === factor.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <FactorModal
          factor={editingFactor}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingFactor(undefined);
          }}
        />
      )}
    </div>
  );
}
