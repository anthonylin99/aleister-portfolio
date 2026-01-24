import { NextResponse } from 'next/server';
import { getHoldings, upsertHolding, HoldingData } from '@/lib/holdings-service';
import { Category } from '@/types/portfolio';

// GET all holdings
export async function GET() {
  try {
    const holdings = await getHoldings();
    return NextResponse.json({ holdings });
  } catch (error) {
    console.error('Failed to get holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}

// POST - Add new holding
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.ticker || !body.name || !body.shares || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: ticker, name, shares, category' },
        { status: 400 }
      );
    }
    
    const holdingData: HoldingData = {
      ticker: body.ticker.toUpperCase(),
      name: body.name,
      shares: Number(body.shares),
      costBasis: body.costBasis ? Number(body.costBasis) : undefined,
      category: body.category as Category,
      description: body.description || '',
      exchange: body.exchange,
      notes: body.notes,
    };
    
    const success = await upsertHolding(holdingData);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save holding. Redis may not be configured.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, holding: holdingData });
  } catch (error) {
    console.error('Failed to add holding:', error);
    return NextResponse.json(
      { error: 'Failed to add holding' },
      { status: 500 }
    );
  }
}
