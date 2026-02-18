import type {
  AlpacaAccount,
  AlpacaOrder,
  AlpacaPosition,
  AlpacaPortfolioHistory,
  AlpacaAsset,
  AlpacaLatestTrade,
  CreateOrderParams,
} from './types';

const PAPER_BASE = 'https://paper-api.alpaca.markets';
const DATA_BASE = 'https://data.alpaca.markets';

function headers(): HeadersInit {
  const keyId = process.env.APCA_API_KEY_ID;
  const secretKey = process.env.APCA_API_SECRET_KEY;
  if (!keyId || !secretKey) {
    throw new Error('Alpaca API keys not configured (APCA_API_KEY_ID, APCA_API_SECRET_KEY)');
  }
  return {
    'APCA-API-KEY-ID': keyId,
    'APCA-API-SECRET-KEY': secretKey,
    'Content-Type': 'application/json',
  };
}

async function paperFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAPER_BASE}${path}`, { ...init, headers: { ...headers(), ...init?.headers } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Alpaca API ${res.status}: ${body}`);
  }
  return res.json();
}

async function dataFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Alpaca Data API ${res.status}: ${body}`);
  }
  return res.json();
}

// Normalize crypto symbols: BTC → BTC/USD for orders, match BTCUSD from positions
export function normalizeCryptoSymbol(symbol: string, forOrder = false): string {
  const upper = symbol.toUpperCase();
  // Already has /USD
  if (upper.endsWith('/USD')) return upper;
  // Common crypto tickers
  const cryptos = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'UNI', 'AAVE', 'DOT', 'MATIC', 'SHIB', 'LTC', 'XRP'];
  if (cryptos.includes(upper) && forOrder) {
    return `${upper}/USD`;
  }
  return upper;
}

// Match position symbol (BTCUSD) to user input (BTC)
export function matchPositionSymbol(positionSymbol: string, inputSymbol: string): boolean {
  const pos = positionSymbol.toUpperCase();
  const inp = inputSymbol.toUpperCase();
  return pos === inp || pos === `${inp}USD` || pos === inp.replace('/USD', 'USD') || pos === inp.replace('/', '');
}

// --- Account ---
export async function getAccount(): Promise<AlpacaAccount> {
  return paperFetch('/v2/account');
}

// --- Orders ---
export async function createOrder(params: CreateOrderParams): Promise<AlpacaOrder> {
  return paperFetch('/v2/orders', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getOrders(status: 'open' | 'closed' | 'all' = 'open', limit = 50): Promise<AlpacaOrder[]> {
  return paperFetch(`/v2/orders?status=${status}&limit=${limit}`);
}

export async function cancelOrder(orderId: string): Promise<void> {
  await paperFetch(`/v2/orders/${orderId}`, { method: 'DELETE' });
}

// --- Positions ---
export async function getPositions(): Promise<AlpacaPosition[]> {
  return paperFetch('/v2/positions');
}

export async function closePosition(symbol: string): Promise<AlpacaOrder> {
  // Try closing directly; if it fails with crypto format, try the other
  try {
    return await paperFetch(`/v2/positions/${encodeURIComponent(symbol)}`, { method: 'DELETE' });
  } catch {
    // If symbol was BTC, try BTCUSD
    const alt = symbol.includes('/') ? symbol.replace('/', '') : `${symbol}USD`;
    return paperFetch(`/v2/positions/${encodeURIComponent(alt)}`, { method: 'DELETE' });
  }
}

export async function closeAllPositions(): Promise<AlpacaOrder[]> {
  return paperFetch('/v2/positions?cancel_orders=true', { method: 'DELETE' });
}

// --- Portfolio History ---
export async function getPortfolioHistory(
  period = '1M',
  timeframe = '1D'
): Promise<AlpacaPortfolioHistory> {
  return paperFetch(`/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}`);
}

// --- Assets ---
export async function getAsset(symbol: string): Promise<AlpacaAsset> {
  return paperFetch(`/v2/assets/${encodeURIComponent(symbol)}`);
}

export async function isCrypto(symbol: string): Promise<boolean> {
  try {
    const asset = await getAsset(normalizeCryptoSymbol(symbol));
    return asset.class === 'crypto';
  } catch {
    // Try with /USD suffix
    try {
      const asset = await getAsset(`${symbol.toUpperCase()}/USD`);
      return asset.class === 'crypto';
    } catch {
      return false;
    }
  }
}

// --- Market Data ---
export async function getLatestTrade(symbol: string): Promise<AlpacaLatestTrade> {
  const upper = symbol.toUpperCase();
  // Try stock first
  try {
    return await dataFetch(`/v2/stocks/${encodeURIComponent(upper)}/trades/latest`);
  } catch {
    // Try crypto
    const cryptoSymbol = upper.includes('/') ? upper : `${upper}/USD`;
    return await dataFetch(`/v1beta3/crypto/us/latest/trades?symbols=${encodeURIComponent(cryptoSymbol)}`);
  }
}
