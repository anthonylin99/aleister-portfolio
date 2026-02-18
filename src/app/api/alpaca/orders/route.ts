import { NextResponse } from 'next/server';
import { getOrders, createOrder, normalizeCryptoSymbol, isCrypto } from '@/lib/alpaca/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'open') as 'open' | 'closed' | 'all';
    const orders = await getOrders(status);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, side, type, time_in_force, qty, notional, limit_price, stop_price } = body;

    if (!symbol || !side || !type || !time_in_force) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, type, and time_in_force are required' },
        { status: 400 }
      );
    }

    if (!qty && !notional) {
      return NextResponse.json(
        { error: 'Either qty or notional is required' },
        { status: 400 }
      );
    }

    const crypto = await isCrypto(symbol);
    const orderSymbol = crypto ? normalizeCryptoSymbol(symbol, true) : symbol.toUpperCase();

    const order = await createOrder({
      symbol: orderSymbol,
      side,
      type,
      time_in_force,
      ...(qty && { qty: String(qty) }),
      ...(notional && { notional: String(notional) }),
      ...(limit_price && { limit_price: String(limit_price) }),
      ...(stop_price && { stop_price: String(stop_price) }),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
