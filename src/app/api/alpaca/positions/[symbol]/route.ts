import { NextResponse } from 'next/server';
import { closePosition } from '@/lib/alpaca/client';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const order = await closePosition(symbol);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error closing position:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to close position' },
      { status: 500 }
    );
  }
}
