// Factor Builder types

export interface FactorAsset {
  symbol: string;
  weight: number; // 0-1, all weights in a factor must sum to 1.0
  type?: 'equity' | 'crypto';
  notes?: string;
}

export interface Factor {
  id: string; // slugified name
  name: string;
  description?: string;
  color: string; // hex color
  assets: FactorAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface Allocation {
  id: string;
  factorId: string;
  percentage: number; // 0-100, all allocations must sum to <= 100
  allocatedAt: string;
  updatedAt: string;
}

// Command parser types — deterministic regex, no LLM

export type ParsedCommand =
  | { type: 'allocate'; factorName: string; percentage: number }
  | { type: 'reallocate'; factorName: string; percentage: number }
  | { type: 'deallocate'; factorName: string }
  | { type: 'rebalance'; factorName?: string }
  | { type: 'buy'; symbol: string; qty?: number; notional?: number; limitPrice?: number }
  | { type: 'sell'; symbol: string; qty?: number; notional?: number; limitPrice?: number }
  | { type: 'close'; symbol: string }
  | { type: 'close_all' }
  | { type: 'cancel_orders'; orderId?: string }
  | { type: 'positions' }
  | { type: 'pnl' }
  | { type: 'account' }
  | { type: 'orders' }
  | { type: 'history'; period?: string }
  | { type: 'factors' }
  | { type: 'factor_detail'; factorName: string }
  | { type: 'price'; symbol: string }
  | { type: 'help' }
  | { type: 'error'; message: string };
