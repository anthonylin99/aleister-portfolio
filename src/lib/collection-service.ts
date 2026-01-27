import {
  collections,
  collectionCategories,
  getCollectionById,
  getCollectionsByCategory,
  getCategoryById,
  getCollectionsForTicker,
  type Collection,
  type CollectionCategory,
} from '@/data/collections-seed';
import { getOptionalRedis } from './redis';

export type { Collection, CollectionCategory };
export { collectionCategories, getCollectionById, getCollectionsByCategory, getCategoryById, getCollectionsForTicker };

// ─── Live price enrichment ──────────────────────────────────

export interface CollectionStockWithPrice {
  ticker: string;
  note?: string;
  name?: string;
  price?: number;
  dayChangePercent?: number;
  marketCap?: number;
}

export interface CollectionWithPrices extends Omit<Collection, 'stocks'> {
  stocks: CollectionStockWithPrice[];
  category: CollectionCategory;
}

const CACHE_TTL = 600; // 10 min - increased for price stability

/**
 * Fetch live quotes for a list of tickers, with optional Redis caching.
 */
async function fetchQuotes(
  tickers: string[],
  forceRefresh = false
): Promise<Record<string, { name?: string; price?: number; dayChangePercent?: number; marketCap?: number }>> {
  const redis = getOptionalRedis();
  const result: Record<string, { name?: string; price?: number; dayChangePercent?: number; marketCap?: number }> = {};

  // Try Redis cache first (unless force refresh)
  const uncached: string[] = [];
  if (redis && !forceRefresh) {
    const cacheKeys = tickers.map((t) => `collection:quote:${t}`);
    const cached = await redis.mget<(string | null)[]>(...cacheKeys);
    for (let i = 0; i < tickers.length; i++) {
      if (cached[i]) {
        try {
          const raw = cached[i];
          result[tickers[i]] = typeof raw === 'string' ? JSON.parse(raw) : raw as unknown as Record<string, unknown>;
        } catch {
          uncached.push(tickers[i]);
        }
      } else {
        uncached.push(tickers[i]);
      }
    }
  } else {
    // Force refresh: clear cache and fetch all
    if (forceRefresh && redis) {
      const cacheKeys = tickers.map((t) => `collection:quote:${t}`);
      await Promise.all(cacheKeys.map((key) => redis.del(key)));
    }
    uncached.push(...tickers);
  }

  if (uncached.length === 0) return result;

  // Fetch from Yahoo via getQuotes (properly handles arrays)
  try {
    const { getQuotes } = await import('./yahoo-finance');
    const quotes = await getQuotes(uncached);
    
    for (const [ticker, quote] of Object.entries(quotes)) {
      if (!quote) continue;
      const data = {
        name: undefined, // Name not available from getQuotes, would need quoteSummary
        price: Number.isFinite(quote.price) && quote.price > 0 ? quote.price : undefined,
        dayChangePercent: Number.isFinite(quote.changePercent) ? quote.changePercent : undefined,
        marketCap: undefined, // Market cap not available from getQuotes
      };
      // Only add if we have valid price data
      if (data.price !== undefined) {
        result[ticker] = data;
      }

      // Cache in Redis
      if (redis) {
        await redis.set(`collection:quote:${ticker}`, JSON.stringify(data), { ex: CACHE_TTL });
      }
    }
  } catch (err) {
    console.error('Failed to fetch quotes for collections:', err);
  }

  return result;
}

/**
 * Get all collections with live prices, optionally filtered by category.
 */
export async function getCollectionsWithPrices(
  categoryId?: string
): Promise<CollectionWithPrices[]> {
  const filtered = categoryId ? getCollectionsByCategory(categoryId) : collections;

  // Gather all unique tickers
  const allTickers = new Set<string>();
  filtered.forEach((c) => c.stocks.forEach((s) => allTickers.add(s.ticker)));

  const quotes = await fetchQuotes(Array.from(allTickers));

  return filtered.map((c) => {
    const category = getCategoryById(c.categoryId)!;
    return {
      ...c,
      category,
      stocks: c.stocks.map((s) => ({
        ...s,
        ...(quotes[s.ticker] || {}),
      })),
    };
  });
}

/**
 * Get a single collection with live prices.
 */
export async function getCollectionWithPrices(
  id: string,
  forceRefresh = false
): Promise<CollectionWithPrices | null> {
  const collection = getCollectionById(id);
  if (!collection) return null;

  const tickers = collection.stocks.map((s) => s.ticker);
  const quotes = await fetchQuotes(tickers, forceRefresh);
  const category = getCategoryById(collection.categoryId)!;

  return {
    ...collection,
    category,
    stocks: collection.stocks.map((s) => ({
      ...s,
      ...(quotes[s.ticker] || {}),
    })),
  };
}

/**
 * Search collections by name, description, tags, or stock tickers.
 */
export function searchCollections(query: string): Collection[] {
  const q = query.toLowerCase().trim();
  if (!q) return collections;

  return collections.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.description.toLowerCase().includes(q)) return true;
    if (c.tags.some((t) => t.toLowerCase().includes(q))) return true;
    if (c.stocks.some((s) => s.ticker.toLowerCase() === q)) return true;
    return false;
  });
}

