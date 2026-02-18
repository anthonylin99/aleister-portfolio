import { NextResponse } from 'next/server';
import { getPositions } from '@/lib/alpaca/client';

export async function GET() {
  try {
    const positions = await getPositions();
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}
