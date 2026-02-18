import { NextResponse } from 'next/server';
import { allocateToFactor } from '@/lib/factors/allocator';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { percentage } = body;

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await allocateToFactor(id, percentage);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error allocating to factor:', error);
    return NextResponse.json(
      { error: 'Failed to allocate to factor' },
      { status: 500 }
    );
  }
}
