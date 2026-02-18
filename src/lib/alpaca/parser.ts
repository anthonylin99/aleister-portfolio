import type { ParsedCommand } from '@/lib/factors/types';
import { findFactorByPartialName } from '@/lib/factors/store';
import type { Factor } from '@/lib/factors/types';

/**
 * Deterministic regex command parser — no LLM.
 * Returns a ParsedCommand union type.
 */
export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  if (!raw) return { type: 'error', message: 'Empty command. Type "help" for available commands.' };

  const lower = raw.toLowerCase();

  // --- Help ---
  if (lower === 'help' || lower === '?') return { type: 'help' };

  // --- Account ---
  if (lower === 'account' || lower === 'acc') return { type: 'account' };

  // --- Positions ---
  if (lower === 'positions' || lower === 'pos') return { type: 'positions' };

  // --- PnL ---
  if (lower === 'pnl' || lower === 'p&l' || lower === 'pl') return { type: 'pnl' };

  // --- Orders ---
  if (lower === 'orders') return { type: 'orders' };

  // --- Factors list ---
  if (lower === 'factors') return { type: 'factors' };

  // --- Close all ---
  if (lower === 'close all' || lower === 'closeall' || lower === 'liquidate') {
    return { type: 'close_all' };
  }

  // --- Cancel orders ---
  const cancelMatch = lower.match(/^cancel(?:\s+order)?\s*(.*)$/);
  if (cancelMatch) {
    const orderId = cancelMatch[1]?.trim() || undefined;
    return { type: 'cancel_orders', orderId: orderId || undefined };
  }

  // --- History ---
  const historyMatch = lower.match(/^history(?:\s+(\S+))?$/);
  if (historyMatch) {
    return { type: 'history', period: historyMatch[1] || undefined };
  }

  // --- Price ---
  const priceMatch = lower.match(/^price\s+(\S+)$/);
  if (priceMatch) {
    return { type: 'price', symbol: priceMatch[1].toUpperCase() };
  }

  // --- Close position ---
  const closeMatch = lower.match(/^close\s+(\S+)$/);
  if (closeMatch) {
    return { type: 'close', symbol: closeMatch[1].toUpperCase() };
  }

  // --- Allocate: "allocate 10% to Tech Factor" ---
  const allocateMatch = lower.match(/^allocate\s+([\d.]+)%?\s+(?:to\s+)?(.+)$/);
  if (allocateMatch) {
    const percentage = parseFloat(allocateMatch[1]);
    const factorName = allocateMatch[2].trim();
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return { type: 'error', message: 'Allocation percentage must be between 0 and 100.' };
    }
    const result = resolveFactorName(factorName);
    if (result.error) return { type: 'error', message: result.error };
    return { type: 'allocate', factorName: result.name!, percentage };
  }

  // --- Reallocate: "reallocate 15% to Tech Factor" ---
  const reallocateMatch = lower.match(/^reallocate\s+([\d.]+)%?\s+(?:to\s+)?(.+)$/);
  if (reallocateMatch) {
    const percentage = parseFloat(reallocateMatch[1]);
    const factorName = reallocateMatch[2].trim();
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return { type: 'error', message: 'Allocation percentage must be between 0 and 100.' };
    }
    const result = resolveFactorName(factorName);
    if (result.error) return { type: 'error', message: result.error };
    return { type: 'reallocate', factorName: result.name!, percentage };
  }

  // --- Deallocate: "deallocate Tech Factor" ---
  const deallocateMatch = lower.match(/^deallocate\s+(.+)$/);
  if (deallocateMatch) {
    const factorName = deallocateMatch[1].trim();
    const result = resolveFactorName(factorName);
    if (result.error) return { type: 'error', message: result.error };
    return { type: 'deallocate', factorName: result.name! };
  }

  // --- Rebalance ---
  const rebalanceMatch = lower.match(/^rebalance(?:\s+(.+))?$/);
  if (rebalanceMatch) {
    if (rebalanceMatch[1]) {
      const result = resolveFactorName(rebalanceMatch[1].trim());
      if (result.error) return { type: 'error', message: result.error };
      return { type: 'rebalance', factorName: result.name! };
    }
    return { type: 'rebalance' };
  }

  // --- Factor detail: "factor Tech Factor" ---
  const factorDetailMatch = lower.match(/^factor\s+(.+)$/);
  if (factorDetailMatch) {
    const factorName = factorDetailMatch[1].trim();
    const result = resolveFactorName(factorName);
    if (result.error) return { type: 'error', message: result.error };
    return { type: 'factor_detail', factorName: result.name! };
  }

  // --- Buy ---
  const buyMatch = lower.match(
    /^buy\s+(?:(\d+(?:\.\d+)?)\s+)?(\S+)(?:\s+(?:at|@|limit)\s+([\d.]+))?(?:\s+\$?([\d.]+)\s*(?:worth|notional)?)?$/
  );
  if (buyMatch) {
    const qty = buyMatch[1] ? parseFloat(buyMatch[1]) : undefined;
    const symbol = buyMatch[2].toUpperCase();
    const limitPrice = buyMatch[3] ? parseFloat(buyMatch[3]) : undefined;
    const notional = buyMatch[4] ? parseFloat(buyMatch[4]) : undefined;
    return { type: 'buy', symbol, qty, notional, limitPrice };
  }

  // --- Buy with notional: "buy $500 AAPL" ---
  const buyNotionalMatch = lower.match(/^buy\s+\$?([\d.]+)\s+(?:of\s+|worth\s+(?:of\s+)?)?(\S+)(?:\s+(?:at|@|limit)\s+([\d.]+))?$/);
  if (buyNotionalMatch) {
    const notional = parseFloat(buyNotionalMatch[1]);
    const symbol = buyNotionalMatch[2].toUpperCase();
    const limitPrice = buyNotionalMatch[3] ? parseFloat(buyNotionalMatch[3]) : undefined;
    return { type: 'buy', symbol, notional, limitPrice };
  }

  // --- Sell ---
  const sellMatch = lower.match(
    /^sell\s+(?:(\d+(?:\.\d+)?)\s+)?(\S+)(?:\s+(?:at|@|limit)\s+([\d.]+))?$/
  );
  if (sellMatch) {
    const qty = sellMatch[1] ? parseFloat(sellMatch[1]) : undefined;
    const symbol = sellMatch[2].toUpperCase();
    const limitPrice = sellMatch[3] ? parseFloat(sellMatch[3]) : undefined;
    return { type: 'sell', symbol, qty, limitPrice };
  }

  // --- Sell with notional: "sell $500 AAPL" ---
  const sellNotionalMatch = lower.match(/^sell\s+\$?([\d.]+)\s+(?:of\s+|worth\s+(?:of\s+)?)?(\S+)(?:\s+(?:at|@|limit)\s+([\d.]+))?$/);
  if (sellNotionalMatch) {
    const notional = parseFloat(sellNotionalMatch[1]);
    const symbol = sellNotionalMatch[2].toUpperCase();
    const limitPrice = sellNotionalMatch[3] ? parseFloat(sellNotionalMatch[3]) : undefined;
    return { type: 'sell', symbol, notional, limitPrice };
  }

  return { type: 'error', message: `Unknown command: "${raw}". Type "help" for available commands.` };
}

function resolveFactorName(query: string): { name?: string; error?: string } {
  const result = findFactorByPartialName(query);
  if (!result) {
    return { error: `No factor found matching "${query}".` };
  }
  if ('ambiguous' in result) {
    const names = (result as { ambiguous: Factor[] }).ambiguous.map((f) => f.name).join(', ');
    return { error: `Ambiguous factor name "${query}". Did you mean: ${names}?` };
  }
  return { name: (result as Factor).name };
}
