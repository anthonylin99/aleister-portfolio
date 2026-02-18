import { NextResponse } from 'next/server';
import { parseCommand } from '@/lib/alpaca/parser';
import {
  getAccount,
  getPositions,
  getOrders,
  getLatestTrade,
  getPortfolioHistory,
  createOrder,
  closePosition,
  closeAllPositions,
  cancelOrder,
  normalizeCryptoSymbol,
  isCrypto,
} from '@/lib/alpaca/client';
import { getFactors, getFactorByName } from '@/lib/factors/store';
import { allocateToFactor, deallocateFactor, rebalanceFactor } from '@/lib/factors/allocator';

function json(type: string, data: unknown, message: string) {
  return NextResponse.json({ type, data, message });
}

function errorJson(type: string, message: string, status = 400) {
  return NextResponse.json({ type, data: null, message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return errorJson('error', 'Missing "command" string in request body.');
    }

    const parsed = parseCommand(command);

    switch (parsed.type) {
      // --- Account ---
      case 'account': {
        const account = await getAccount();
        return json('account', account, 'Account info retrieved.');
      }

      // --- Positions ---
      case 'positions': {
        const positions = await getPositions();
        return json('positions', positions, `${positions.length} position(s) found.`);
      }

      // --- Orders ---
      case 'orders': {
        const orders = await getOrders();
        return json('orders', orders, `${orders.length} open order(s).`);
      }

      // --- P&L ---
      case 'pnl': {
        const positions = await getPositions();
        const pnl = positions.map((p) => ({
          symbol: p.symbol,
          qty: p.qty,
          avgEntry: p.avg_entry_price,
          currentPrice: p.current_price,
          marketValue: p.market_value,
          unrealizedPl: p.unrealized_pl,
          unrealizedPlPct: p.unrealized_plpc,
          intradayPl: p.unrealized_intraday_pl,
          intradayPlPct: p.unrealized_intraday_plpc,
        }));
        const totalPl = positions.reduce((sum, p) => sum + parseFloat(p.unrealized_pl), 0);
        return json('pnl', pnl, `Total unrealized P&L: $${totalPl.toFixed(2)}`);
      }

      // --- Price ---
      case 'price': {
        const trade = await getLatestTrade(parsed.symbol);
        return json('price', trade, `Latest trade for ${parsed.symbol}.`);
      }

      // --- History ---
      case 'history': {
        const period = parsed.period || '1M';
        const history = await getPortfolioHistory(period, '1D');
        return json('history', history, `Portfolio history (${period}).`);
      }

      // --- Factors list ---
      case 'factors': {
        const factors = getFactors();
        return json('factors', factors, `${factors.length} factor(s) available.`);
      }

      // --- Factor detail ---
      case 'factor_detail': {
        const factor = getFactorByName(parsed.factorName);
        if (!factor) {
          return errorJson('factor_detail', `Factor "${parsed.factorName}" not found.`, 404);
        }
        return json('factor_detail', factor, `Factor: ${factor.name}`);
      }

      // --- Buy ---
      case 'buy': {
        const crypto = await isCrypto(parsed.symbol);
        const symbol = crypto
          ? normalizeCryptoSymbol(parsed.symbol, true)
          : parsed.symbol.toUpperCase();

        const orderParams: Parameters<typeof createOrder>[0] = {
          symbol,
          side: 'buy',
          type: parsed.limitPrice ? 'limit' : 'market',
          time_in_force: crypto ? 'gtc' : 'day',
        };

        if (parsed.notional) {
          orderParams.notional = parsed.notional.toFixed(2);
        } else if (parsed.qty) {
          orderParams.qty = parsed.qty.toString();
        } else {
          return errorJson('buy', 'Specify a quantity or dollar amount. e.g. "buy 10 AAPL" or "buy $500 AAPL"');
        }

        if (parsed.limitPrice) {
          orderParams.limit_price = parsed.limitPrice.toString();
        }

        const order = await createOrder(orderParams);
        return json('buy', order, `Buy order placed for ${symbol}.`);
      }

      // --- Sell ---
      case 'sell': {
        const crypto = await isCrypto(parsed.symbol);
        const symbol = crypto
          ? normalizeCryptoSymbol(parsed.symbol, true)
          : parsed.symbol.toUpperCase();

        const orderParams: Parameters<typeof createOrder>[0] = {
          symbol,
          side: 'sell',
          type: parsed.limitPrice ? 'limit' : 'market',
          time_in_force: crypto ? 'gtc' : 'day',
        };

        if (parsed.notional) {
          orderParams.notional = parsed.notional.toFixed(2);
        } else if (parsed.qty) {
          orderParams.qty = parsed.qty.toString();
        } else {
          return errorJson('sell', 'Specify a quantity or dollar amount. e.g. "sell 10 AAPL" or "sell $500 AAPL"');
        }

        if (parsed.limitPrice) {
          orderParams.limit_price = parsed.limitPrice.toString();
        }

        const order = await createOrder(orderParams);
        return json('sell', order, `Sell order placed for ${symbol}.`);
      }

      // --- Close position ---
      case 'close': {
        const order = await closePosition(parsed.symbol);
        return json('close', order, `Position closed for ${parsed.symbol}.`);
      }

      // --- Close all ---
      case 'close_all': {
        const orders = await closeAllPositions();
        return json('close_all', orders, `All positions closed. ${orders.length} order(s) created.`);
      }

      // --- Cancel orders ---
      case 'cancel_orders': {
        if (parsed.orderId) {
          await cancelOrder(parsed.orderId);
          return json('cancel_orders', { orderId: parsed.orderId }, `Order ${parsed.orderId} cancelled.`);
        }
        // Cancel all open orders
        const openOrders = await getOrders('open');
        const results = [];
        for (const order of openOrders) {
          try {
            await cancelOrder(order.id);
            results.push({ id: order.id, symbol: order.symbol, status: 'cancelled' });
          } catch (err) {
            results.push({
              id: order.id,
              symbol: order.symbol,
              status: 'failed',
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
        return json('cancel_orders', results, `${results.length} order(s) cancelled.`);
      }

      // --- Allocate ---
      case 'allocate': {
        const factor = getFactorByName(parsed.factorName);
        if (!factor) {
          return errorJson('allocate', `Factor "${parsed.factorName}" not found.`, 404);
        }
        const result = await allocateToFactor(factor.id, parsed.percentage);
        return json('allocate', result, `Allocated ${parsed.percentage}% to ${parsed.factorName}.`);
      }

      // --- Reallocate ---
      case 'reallocate': {
        const factor = getFactorByName(parsed.factorName);
        if (!factor) {
          return errorJson('reallocate', `Factor "${parsed.factorName}" not found.`, 404);
        }
        const result = await allocateToFactor(factor.id, parsed.percentage);
        return json('reallocate', result, `Reallocated ${parsed.percentage}% to ${parsed.factorName}.`);
      }

      // --- Deallocate ---
      case 'deallocate': {
        const factor = getFactorByName(parsed.factorName);
        if (!factor) {
          return errorJson('deallocate', `Factor "${parsed.factorName}" not found.`, 404);
        }
        const result = await deallocateFactor(factor.id);
        return json('deallocate', result, `Deallocated ${parsed.factorName}. Positions closed.`);
      }

      // --- Rebalance ---
      case 'rebalance': {
        if (parsed.factorName) {
          const factor = getFactorByName(parsed.factorName);
          if (!factor) {
            return errorJson('rebalance', `Factor "${parsed.factorName}" not found.`, 404);
          }
          const result = await rebalanceFactor(factor.id);
          return json('rebalance', result, `Rebalanced ${parsed.factorName}.`);
        }
        // Rebalance all allocated factors
        const factors = getFactors();
        const results = [];
        for (const factor of factors) {
          try {
            const result = await rebalanceFactor(factor.id);
            results.push(result);
          } catch {
            // Factor may not be allocated -- skip silently
          }
        }
        return json('rebalance', results, `Rebalanced ${results.length} factor(s).`);
      }

      // --- Help ---
      case 'help': {
        const helpText = [
          'Available commands:',
          '',
          'ACCOUNT & PORTFOLIO',
          '  account          — View account info (buying power, equity)',
          '  positions        — List all open positions',
          '  pnl              — Show unrealized P&L per position',
          '  orders           — List open orders',
          '  history [period] — Portfolio equity curve (1D, 1W, 1M, 3M, 1A)',
          '',
          'TRADING',
          '  buy <qty> <symbol> [at <price>]  — Buy shares (e.g. "buy 10 AAPL")',
          '  buy $<amount> <symbol>           — Buy by dollar amount',
          '  sell <qty> <symbol> [at <price>] — Sell shares',
          '  sell $<amount> <symbol>          — Sell by dollar amount',
          '  close <symbol>                   — Close entire position',
          '  close all                        — Close all positions',
          '  cancel [orderId]                 — Cancel order(s)',
          '',
          'MARKET DATA',
          '  price <symbol>   — Get latest trade price',
          '',
          'FACTORS',
          '  factors                           — List all factors',
          '  factor <name>                     — View factor details',
          '  allocate <pct>% to <factor>       — Allocate portfolio %',
          '  reallocate <pct>% to <factor>     — Change allocation %',
          '  deallocate <factor>               — Remove allocation & close positions',
          '  rebalance [factor]                — Rebalance to target weights',
        ].join('\n');
        return json('help', helpText, 'Command reference.');
      }

      // --- Error (from parser) ---
      case 'error': {
        return errorJson('error', parsed.message);
      }

      default: {
        return errorJson('error', 'Unknown command type.');
      }
    }
  } catch (error) {
    console.error('Execute error:', error);
    return NextResponse.json(
      { type: 'error', data: null, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
