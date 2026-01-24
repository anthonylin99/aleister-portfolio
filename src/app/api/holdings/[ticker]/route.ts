import { NextResponse } from 'next/server';
import { getHolding, upsertHolding, deleteHolding, updateShares, HoldingData } from '@/lib/holdings-service';
import { Category } from '@/types/portfolio';

// GET single holding
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  try {
    const holding = await getHolding(ticker);
    
    if (!holding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ holding });
  } catch (error) {
    console.error('Failed to get holding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holding' },
      { status: 500 }
    );
  }
}

// PUT - Update holding
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  try {
    const body = await request.json();
    
    // If only updating shares
    if (Object.keys(body).length === 1 && body.shares !== undefined) {
      const success = await updateShares(ticker, Number(body.shares));
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update shares' },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }
    
    // Full update
    const existing = await getHolding(ticker);
    if (!existing) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }
    
    const holdingData: HoldingData = {
      ticker: ticker.toUpperCase(),
      name: body.name || existing.name,
      shares: body.shares !== undefined ? Number(body.shares) : existing.shares,
      costBasis: body.costBasis,
      category: (body.category || existing.category) as Category,
      description: body.description || existing.description,
      exchange: body.exchange || existing.exchange,
      notes: body.notes,
    };
    
    const success = await upsertHolding(holdingData);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update holding' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, holding: holdingData });
  } catch (error) {
    console.error('Failed to update holding:', error);
    return NextResponse.json(
      { error: 'Failed to update holding' },
      { status: 500 }
    );
  }
}

// DELETE - Remove holding
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  try {
    const success = await deleteHolding(ticker);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete holding. Redis may not be configured.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete holding:', error);
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    );
  }
}
