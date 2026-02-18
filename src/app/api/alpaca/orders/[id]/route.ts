import { NextResponse } from 'next/server';
import { cancelOrder } from '@/lib/alpaca/client';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await cancelOrder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
