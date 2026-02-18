'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Save,
  History,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Category, categoryColors } from '@/types/portfolio';
import { useVisibility } from '@/lib/visibility-context';
import { PINModal } from '@/components/ui/PINModal';

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  description: string;
  notes?: string;
}

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  ticker: string;
  shares: number;
  price: number;
  date: string;
  brokerage?: string;
  notes?: string;
}

const categories: Category[] = [
  'Space & Satellite',
  'Crypto Infrastructure',
  'Fintech',
  'AI Infrastructure',
  'Digital Asset Treasury',
  'Big Tech',
  'Defense Tech',
];

export default function AdminPage() {
  const { isVisible, isPINModalOpen, openPINModal, closePINModal, unlockWithPIN, correctPIN } = useVisibility();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Admin requires PIN authentication
  const isAuthenticated = isVisible;

  // Edit state
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editShares, setEditShares] = useState<number>(0);
  const [editCostBasis, setEditCostBasis] = useState<number>(0);

  // Add new holding form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHolding, setNewHolding] = useState({
    ticker: '',
    name: '',
    shares: 0,
    costBasis: 0,
    category: 'Fintech' as Category,
    description: '',
  });

  // Transaction form
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'BUY' as 'BUY' | 'SELL',
    ticker: '',
    shares: 0,
    price: 0,
    date: new Date().toISOString().split('T')[0],
    brokerage: 'Fidelity',
    notes: '',
  });

  // Fetch holdings and transactions
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [holdingsRes, transactionsRes] = await Promise.all([
        fetch('/api/holdings'),
        fetch('/api/transactions?limit=20'),
      ]);

      const holdingsData = await holdingsRes.json();
      const transactionsData = await transactionsRes.json();

      setHoldings(holdingsData.holdings || []);
      setTransactions(transactionsData.transactions || []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Start editing a holding
  function startEdit(holding: Holding) {
    setEditingTicker(holding.ticker);
    setEditShares(holding.shares);
    setEditCostBasis(holding.costBasis || 0);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingTicker(null);
    setEditShares(0);
    setEditCostBasis(0);
  }

  // Save edited holding
  async function saveEdit() {
    if (!editingTicker) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/holdings/${editingTicker}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shares: editShares,
          costBasis: editCostBasis || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setSuccess(`Updated ${editingTicker}`);
      cancelEdit();
      fetchData();

      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  // Delete holding
  async function deleteHolding(ticker: string) {
    if (!confirm(`Are you sure you want to delete ${ticker}?`)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/holdings/${ticker}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setSuccess(`Deleted ${ticker}`);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to delete holding');
    } finally {
      setSaving(false);
    }
  }

  // Add new holding
  async function addHolding(e: React.FormEvent) {
    e.preventDefault();

    if (!newHolding.ticker || !newHolding.name || !newHolding.shares) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHolding),
      });

      if (!res.ok) throw new Error('Failed to add');

      setSuccess(`Added ${newHolding.ticker}`);
      setShowAddForm(false);
      setNewHolding({
        ticker: '',
        name: '',
        shares: 0,
        costBasis: 0,
        category: 'Fintech',
        description: '',
      });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to add holding');
    } finally {
      setSaving(false);
    }
  }

  // Log transaction
  async function logTransaction(e: React.FormEvent) {
    e.preventDefault();

    if (!newTransaction.ticker || !newTransaction.shares || !newTransaction.price) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) throw new Error('Failed to log transaction');

      setSuccess(`Logged ${newTransaction.type} ${newTransaction.shares} shares of ${newTransaction.ticker}`);
      setShowTransactionForm(false);
      setNewTransaction({
        type: 'BUY',
        ticker: '',
        shares: 0,
        price: 0,
        date: new Date().toISOString().split('T')[0],
        brokerage: 'Fidelity',
        notes: '',
      });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to log transaction');
    } finally {
      setSaving(false);
    }
  }

  // Show PIN lock screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative flex items-center justify-center">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10">
          <div className="glass-card p-8 rounded-2xl text-center max-w-md filigree-corners">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gb-gold)]/20 to-[var(--gb-crystal-blue)]/10 flex items-center justify-center border border-[var(--gb-gold-border)]">
              <Lock className="w-10 h-10 text-[var(--gb-gold)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--gb-parchment)] mb-2 font-cinzel">Admin Access Required</h2>
            <p className="text-[var(--text-muted)] mb-6">
              Enter your PIN to access the Holdings Manager and modify portfolio data.
            </p>
            <button
              onClick={openPINModal}
              className="px-6 py-3 bg-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/80 text-[var(--gb-parchment)] font-medium rounded-xl transition-colors"
            >
              Enter PIN
            </button>
            <Link
              href="/"
              className="block mt-4 text-[var(--text-subtle)] hover:text-[var(--text-secondary)] text-sm transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <PINModal
          isOpen={isPINModalOpen}
          onClose={closePINModal}
          onSuccess={unlockWithPIN}
          correctPIN={correctPIN}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative flex items-center justify-center">
        <div className="stripe-gradient-bg" />
        <div className="sky-sparkles" />
        <div className="relative z-10 flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[var(--gb-gold)] animate-spin" />
          <span className="text-[var(--text-muted)] font-cinzel">Loading...</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--gb-parchment)] font-cinzel">Holdings Manager</h1>
            <p className="text-[var(--text-muted)]">Manage your portfolio holdings and track transactions</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--gb-azure-deep)] hover:bg-[var(--gb-azure)] rounded-lg text-[var(--gb-parchment)] transition-colors"
            >
              <History className="w-4 h-4" />
              Log Transaction
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/80 rounded-lg text-[var(--gb-parchment)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Holding
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400">{success}</p>
          </div>
        )}

        {/* Add Holding Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto filigree-corners">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--gb-parchment)] font-cinzel">Add New Holding</h2>
                <button onClick={() => setShowAddForm(false)} className="text-[var(--text-muted)] hover:text-[var(--gb-parchment)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={addHolding} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Ticker *</label>
                    <input
                      type="text"
                      value={newHolding.ticker}
                      onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      placeholder="ASTS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Shares *</label>
                    <input
                      type="number"
                      value={newHolding.shares || ''}
                      onChange={(e) => setNewHolding({ ...newHolding, shares: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={newHolding.name}
                    onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                    placeholder="AST SpaceMobile"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Category *</label>
                    <select
                      value={newHolding.category}
                      onChange={(e) => setNewHolding({ ...newHolding, category: e.target.value as Category })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Cost Basis</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newHolding.costBasis || ''}
                      onChange={(e) => setNewHolding({ ...newHolding, costBasis: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      placeholder="45.50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Description</label>
                  <textarea
                    value={newHolding.description}
                    onChange={(e) => setNewHolding({ ...newHolding, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30 resize-none"
                    rows={3}
                    placeholder="Brief description of the company..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/80 disabled:opacity-50 rounded-lg text-[var(--gb-parchment)] transition-colors"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Holding
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 rounded-2xl max-w-lg w-full filigree-corners">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--gb-parchment)] font-cinzel">Log Transaction</h2>
                <button onClick={() => setShowTransactionForm(false)} className="text-[var(--text-muted)] hover:text-[var(--gb-parchment)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={logTransaction} className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'BUY' })}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2",
                      newTransaction.type === 'BUY'
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[var(--gb-azure-deep)] text-[var(--text-muted)] border border-[var(--gb-gold-border)]"
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'SELL' })}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2",
                      newTransaction.type === 'SELL'
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-[var(--gb-azure-deep)] text-[var(--text-muted)] border border-[var(--gb-gold-border)]"
                    )}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Sell
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Ticker *</label>
                    <select
                      value={newTransaction.ticker}
                      onChange={(e) => setNewTransaction({ ...newTransaction, ticker: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      required
                    >
                      <option value="">Select...</option>
                      {holdings.map(h => (
                        <option key={h.ticker} value={h.ticker}>{h.ticker}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Shares *</label>
                    <input
                      type="number"
                      value={newTransaction.shares || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, shares: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTransaction.price || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      placeholder="110.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-1">Date *</label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Brokerage</label>
                  <select
                    value={newTransaction.brokerage}
                    onChange={(e) => setNewTransaction({ ...newTransaction, brokerage: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                  >
                    <option value="Fidelity">Fidelity</option>
                    <option value="Schwab">Schwab</option>
                    <option value="Robinhood">Robinhood</option>
                    <option value="IBKR">Interactive Brokers</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Notes</label>
                  <input
                    type="text"
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] rounded-lg text-[var(--gb-parchment)] focus:border-[var(--gb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--gb-parchment)] transition-colors disabled:opacity-50",
                      newTransaction.type === 'BUY'
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Log {newTransaction.type === 'BUY' ? 'Buy' : 'Sell'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8 filigree-corners">
          <div className="p-4 border-b border-[var(--gb-gold-border)]">
            <h2 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Current Holdings</h2>
            <p className="text-sm text-[var(--text-muted)]">{holdings.length} positions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--gb-gold-border)] bg-[var(--gb-azure-deep)]/50">
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-muted)]">Ticker</th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-muted)]">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-muted)] hidden md:table-cell">Category</th>
                  <th className="text-right p-4 text-sm font-semibold text-[var(--text-muted)]">Shares</th>
                  <th className="text-right p-4 text-sm font-semibold text-[var(--text-muted)] hidden sm:table-cell">Cost Basis</th>
                  <th className="text-right p-4 text-sm font-semibold text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const isEditing = editingTicker === holding.ticker;
                  const color = categoryColors[holding.category];

                  return (
                    <tr
                      key={holding.ticker}
                      className="border-b border-[var(--gb-gold-border)]/50 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-bold text-[var(--gb-parchment)]">{holding.ticker}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[var(--text-secondary)]">{holding.name}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {holding.category}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editShares}
                            onChange={(e) => setEditShares(Number(e.target.value))}
                            className="w-24 px-2 py-1 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold)] rounded text-[var(--gb-parchment)] text-right focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                            autoFocus
                          />
                        ) : (
                          <span className="text-[var(--gb-parchment)] tabular-nums">{holding.shares.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-4 text-right hidden sm:table-cell">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editCostBasis || ''}
                            onChange={(e) => setEditCostBasis(Number(e.target.value))}
                            className="w-24 px-2 py-1 bg-[var(--gb-azure-deep)] border border-[var(--gb-gold)] rounded text-[var(--gb-parchment)] text-right focus:outline-none focus:ring-1 focus:ring-[var(--gb-gold)]/30"
                            placeholder="—"
                          />
                        ) : (
                          <span className="text-[var(--text-muted)] tabular-nums">
                            {holding.costBasis ? formatCurrency(holding.costBasis) : '—'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-[var(--text-muted)] hover:bg-[var(--gb-azure)] rounded-lg transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(holding)}
                              className="p-2 text-[var(--text-muted)] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-azure)] rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteHolding(holding.ticker)}
                              className="p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/20 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden mb-8 filigree-corners">
            <div className="p-4 border-b border-[var(--gb-gold-border)]">
              <h2 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Recent Transactions</h2>
              <p className="text-sm text-[var(--text-muted)]">Last {transactions.length} transactions</p>
            </div>

            <div className="divide-y divide-slate-800">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      txn.type === 'BUY' ? "bg-emerald-500/20" : "bg-red-500/20"
                    )}>
                      {txn.type === 'BUY'
                        ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                        : <TrendingDown className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-[var(--gb-parchment)]">
                        {txn.type} {txn.shares} {txn.ticker}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        @ ${txn.price.toFixed(2)} • {txn.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-medium",
                      txn.type === 'BUY' ? "text-emerald-400" : "text-red-400"
                    )}>
                      {txn.type === 'BUY' ? '-' : '+'}${(txn.shares * txn.price).toLocaleString()}
                    </p>
                    {txn.brokerage && (
                      <p className="text-xs text-[var(--text-subtle)]">{txn.brokerage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8 filigree-corners">
          <div className="p-4 border-b border-[var(--gb-gold-border)]">
            <h2 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Data Management</h2>
            <p className="text-sm text-[var(--text-muted)]">Clear cached data and manage internal storage</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--gb-azure-deep)]/40 rounded-xl">
              <div>
                <p className="font-medium text-[var(--gb-parchment)]">Clear User Portfolio</p>
                <p className="text-sm text-[var(--text-muted)]">Remove all holdings from your portfolio (fixes duplicates)</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to clear your entire portfolio? This cannot be undone.')) return;
                  setSaving(true);
                  try {
                    const res = await fetch('/api/user/portfolio', { method: 'DELETE' });
                    if (res.ok) {
                      setSuccess('Portfolio cleared successfully');
                      fetchData();
                    } else {
                      throw new Error('Failed to clear portfolio');
                    }
                  } catch {
                    setError('Failed to clear portfolio');
                  } finally {
                    setSaving(false);
                    setTimeout(() => setSuccess(null), 3000);
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Clear Portfolio
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--gb-azure-deep)]/40 rounded-xl">
              <div>
                <p className="font-medium text-[var(--gb-parchment)]">Clear Local Storage</p>
                <p className="text-sm text-[var(--text-muted)]">Reset watchlist, theme settings, and cached data</p>
              </div>
              <button
                onClick={() => {
                  if (!confirm('Clear all local browser data? This includes watchlist and preferences.')) return;
                  localStorage.clear();
                  setSuccess('Local storage cleared - refresh the page');
                  setTimeout(() => setSuccess(null), 3000);
                }}
                className="px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600/30 transition-colors"
              >
                Clear Local Data
              </button>
            </div>
          </div>
        </div>

        {/* Redis Note */}
        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-400">
            <strong>Note:</strong> Holdings management requires Upstash Redis to be configured.
            Without Redis, holdings are read-only from the portfolio.json file.
            Add your Upstash credentials to .env.local to enable full CRUD functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
