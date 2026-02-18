import * as alpaca from '@/lib/alpaca/client';
import { getFactorById, getAllocationByFactorId, upsertAllocation, removeAllocation } from './store';
import type { Factor } from './types';
import type { AlpacaOrder, AlpacaPosition } from '@/lib/alpaca/types';

export interface TradeResult {
  symbol: string;
  side: 'buy' | 'sell';
  qty?: string;
  notional?: string;
  status: string;
  filledPrice?: string;
  error?: string;
}

export interface AllocationResult {
  factorName: string;
  percentage: number;
  equityAllocated: number;
  trades: TradeResult[];
  errors: string[];
}

/**
 * Allocate a percentage of portfolio equity to a factor.
 * 1. Validate allocation % available
 * 2. Get account equity from Alpaca
 * 3. Calculate target $ per asset from factor weights
 * 4. Diff against current Alpaca positions
 * 5. Build trade list: sells first, then buys
 * 6. Crypto: notional orders. Equity: share qty (round down)
 * 7. Execute trades
 * 8. Save allocation
 */
export async function allocateToFactor(
  factorId: string,
  percentage: number
): Promise<AllocationResult> {
  const factor = getFactorById(factorId);
  if (!factor) throw new Error(`Factor "${factorId}" not found`);

  const errors: string[] = [];
  const trades: TradeResult[] = [];

  // 1. Get account equity
  const account = await alpaca.getAccount();
  const equity = parseFloat(account.equity);
  const targetDollars = equity * (percentage / 100);

  // 2. Get current positions
  const positions = await alpaca.getPositions();

  // 3. Calculate target per asset
  const targets = factor.assets.map((asset) => ({
    symbol: asset.symbol,
    targetDollars: targetDollars * asset.weight,
    type: asset.type,
  }));

  // 4. Calculate diffs
  const tradeList: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    notional?: number;
    qty?: number;
    isCrypto: boolean;
  }> = [];

  for (const target of targets) {
    const currentPosition = positions.find((p) =>
      alpaca.matchPositionSymbol(p.symbol, target.symbol)
    );
    const currentValue = currentPosition ? parseFloat(currentPosition.market_value) : 0;
    const diff = target.targetDollars - currentValue;

    if (Math.abs(diff) < 1) continue; // Skip tiny adjustments

    const isCrypto = target.type === 'crypto' || (currentPosition?.asset_class === 'crypto');

    if (diff > 0) {
      tradeList.push({ symbol: target.symbol, side: 'buy', notional: diff, isCrypto });
    } else {
      // Need to sell
      if (isCrypto) {
        tradeList.push({ symbol: target.symbol, side: 'sell', notional: Math.abs(diff), isCrypto: true });
      } else {
        // For equity, calculate shares
        const price = currentPosition ? parseFloat(currentPosition.current_price) : 0;
        if (price > 0) {
          const sharesToSell = Math.floor(Math.abs(diff) / price);
          if (sharesToSell > 0) {
            tradeList.push({ symbol: target.symbol, side: 'sell', qty: sharesToSell, isCrypto: false });
          }
        }
      }
    }
  }

  // 5. Execute sells first (free up cash), then buys
  const sells = tradeList.filter((t) => t.side === 'sell');
  const buys = tradeList.filter((t) => t.side === 'buy');

  for (const trade of [...sells, ...buys]) {
    try {
      const symbol = trade.isCrypto
        ? alpaca.normalizeCryptoSymbol(trade.symbol, true)
        : trade.symbol.toUpperCase();

      const orderParams: Parameters<typeof alpaca.createOrder>[0] = {
        symbol,
        side: trade.side,
        type: 'market',
        time_in_force: trade.isCrypto ? 'gtc' : 'day',
      };

      if (trade.notional && (trade.isCrypto || trade.side === 'buy')) {
        orderParams.notional = trade.notional.toFixed(2);
      } else if (trade.qty) {
        orderParams.qty = trade.qty.toString();
      } else if (trade.notional && !trade.isCrypto) {
        // For equity buys, try notional
        orderParams.notional = trade.notional.toFixed(2);
      }

      const order = await alpaca.createOrder(orderParams);
      trades.push({
        symbol: trade.symbol,
        side: trade.side,
        qty: order.qty || undefined,
        notional: order.notional || undefined,
        status: order.status,
        filledPrice: order.filled_avg_price || undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${trade.side} ${trade.symbol}: ${msg}`);
      trades.push({
        symbol: trade.symbol,
        side: trade.side,
        status: 'failed',
        error: msg,
      });
    }
  }

  // 6. Save allocation
  upsertAllocation(factorId, percentage);

  return {
    factorName: factor.name,
    percentage,
    equityAllocated: targetDollars,
    trades,
    errors,
  };
}

/**
 * Deallocate a factor — close all positions for that factor's assets.
 */
export async function deallocateFactor(factorId: string): Promise<AllocationResult> {
  const factor = getFactorById(factorId);
  if (!factor) throw new Error(`Factor "${factorId}" not found`);

  const errors: string[] = [];
  const trades: TradeResult[] = [];
  const positions = await alpaca.getPositions();

  for (const asset of factor.assets) {
    const position = positions.find((p) =>
      alpaca.matchPositionSymbol(p.symbol, asset.symbol)
    );
    if (!position) continue;

    try {
      const order = await alpaca.closePosition(position.symbol);
      trades.push({
        symbol: asset.symbol,
        side: 'sell',
        qty: position.qty,
        status: order.status,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`close ${asset.symbol}: ${msg}`);
      trades.push({
        symbol: asset.symbol,
        side: 'sell',
        status: 'failed',
        error: msg,
      });
    }
  }

  removeAllocation(factorId);

  return {
    factorName: factor.name,
    percentage: 0,
    equityAllocated: 0,
    trades,
    errors,
  };
}

/**
 * Rebalance a factor — adjust positions to match target weights.
 */
export async function rebalanceFactor(factorId: string): Promise<AllocationResult> {
  const allocation = getAllocationByFactorId(factorId);
  if (!allocation) {
    throw new Error('Factor is not currently allocated. Use "allocate" first.');
  }
  return allocateToFactor(factorId, allocation.percentage);
}
