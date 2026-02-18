import { NextResponse } from 'next/server';
import { getFactors, getAllocations, createFactor } from '@/lib/factors/store';

export async function GET() {
  try {
    const factors = getFactors();
    const allocations = getAllocations();
    return NextResponse.json({ factors, allocations });
  } catch (error) {
    console.error('Error fetching factors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch factors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, assets, color, description } = body;

    if (!name || !assets || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: name, assets, and color are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { error: 'Assets must be a non-empty array' },
        { status: 400 }
      );
    }

    for (const asset of assets) {
      if (!asset.symbol || typeof asset.weight !== 'number') {
        return NextResponse.json(
          { error: 'Each asset must have a symbol and numeric weight' },
          { status: 400 }
        );
      }
    }

    const factor = createFactor(name, assets, color, description);
    return NextResponse.json(factor, { status: 201 });
  } catch (error) {
    console.error('Error creating factor:', error);
    return NextResponse.json(
      { error: 'Failed to create factor' },
      { status: 500 }
    );
  }
}
