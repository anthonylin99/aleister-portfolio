import { redis, isRedisAvailable } from './redis';
import { Holding, Category } from '@/types/portfolio';
import portfolioData from '@/data/portfolio.json';

// Redis key constants
const HOLDINGS_KEY = 'portfolio:holdings';
const ETF_CONFIG_KEY = 'etf:config';
const TRANSACTIONS_KEY = 'transactions:index';

export interface HoldingData {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  description: string;
  exchange?: string;
  addedAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  ticker: string;
  shares: number;
  price: number;
  date: string;
  brokerage?: string;
  notes?: string;
}

// Get all holdings - from Redis if available, otherwise from JSON file
export async function getHoldings(): Promise<Holding[]> {
  if (!isRedisAvailable()) {
    return portfolioData.holdings as Holding[];
  }

  try {
    const holdingsData = await redis!.hgetall(HOLDINGS_KEY);
    
    if (!holdingsData || Object.keys(holdingsData).length === 0) {
      // Redis empty, return from JSON and optionally seed Redis
      return portfolioData.holdings as Holding[];
    }
    
    return Object.values(holdingsData).map((data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed as Holding;
    });
  } catch (error) {
    console.error('Redis error, falling back to JSON:', error);
    return portfolioData.holdings as Holding[];
  }
}

// Get a single holding
export async function getHolding(ticker: string): Promise<Holding | null> {
  if (!isRedisAvailable()) {
    const holdings = portfolioData.holdings as Holding[];
    return holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase()) || null;
  }

  try {
    const data = await redis!.hget(HOLDINGS_KEY, ticker.toUpperCase());
    if (!data) return null;
    
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed as Holding;
  } catch (error) {
    console.error('Redis error:', error);
    return null;
  }
}

// Add or update a holding
export async function upsertHolding(holding: HoldingData): Promise<boolean> {
  if (!isRedisAvailable()) {
    console.warn('Redis not available. Cannot update holdings.');
    return false;
  }

  try {
    const ticker = holding.ticker.toUpperCase();
    const data: HoldingData = {
      ...holding,
      ticker,
      addedAt: holding.addedAt || new Date().toISOString(),
    };
    
    await redis!.hset(HOLDINGS_KEY, { [ticker]: JSON.stringify(data) });
    return true;
  } catch (error) {
    console.error('Failed to upsert holding:', error);
    return false;
  }
}

// Update shares for a holding
export async function updateShares(ticker: string, shares: number): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const existing = await getHolding(ticker);
    if (!existing) return false;
    
    const updated = { ...existing, shares };
    await redis!.hset(HOLDINGS_KEY, { [ticker.toUpperCase()]: JSON.stringify(updated) });
    return true;
  } catch (error) {
    console.error('Failed to update shares:', error);
    return false;
  }
}

// Delete a holding
export async function deleteHolding(ticker: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    await redis!.hdel(HOLDINGS_KEY, ticker.toUpperCase());
    return true;
  } catch (error) {
    console.error('Failed to delete holding:', error);
    return false;
  }
}

// Log a transaction
export async function logTransaction(transaction: Omit<Transaction, 'id'>): Promise<string | null> {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullTransaction: Transaction = {
      ...transaction,
      id,
    };
    
    // Store transaction
    await redis!.hset(`transactions:${id}`, fullTransaction as unknown as Record<string, unknown>);
    
    // Add to index (sorted set by timestamp)
    const timestamp = new Date(transaction.date).getTime();
    await redis!.zadd(TRANSACTIONS_KEY, { score: timestamp, member: id });
    
    // Update holding shares
    const holding = await getHolding(transaction.ticker);
    if (holding) {
      const newShares = transaction.type === 'BUY' 
        ? holding.shares + transaction.shares
        : Math.max(0, holding.shares - transaction.shares);
      await updateShares(transaction.ticker, newShares);
    }
    
    return id;
  } catch (error) {
    console.error('Failed to log transaction:', error);
    return null;
  }
}

// Get transaction history
export async function getTransactions(limit = 50): Promise<Transaction[]> {
  if (!isRedisAvailable()) {
    return [];
  }

  try {
    // Get transaction IDs from sorted set (most recent first)
    const ids = await redis!.zrange(TRANSACTIONS_KEY, 0, limit - 1, { rev: true });
    
    if (!ids || ids.length === 0) return [];
    
    const transactions: Transaction[] = [];
    for (const id of ids) {
      const data = await redis!.hgetall(`transactions:${id}`);
      if (data) {
        transactions.push(data as unknown as Transaction);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return [];
  }
}

// Initialize Redis with portfolio data from JSON
export async function seedRedisFromJSON(): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const holdings = portfolioData.holdings as Holding[];
    
    for (const holding of holdings) {
      const data: HoldingData = {
        ...holding,
        addedAt: new Date().toISOString(),
      };
      await redis!.hset(HOLDINGS_KEY, { [holding.ticker]: JSON.stringify(data) });
    }
    
    console.log(`Seeded ${holdings.length} holdings to Redis`);
    return true;
  } catch (error) {
    console.error('Failed to seed Redis:', error);
    return false;
  }
}
