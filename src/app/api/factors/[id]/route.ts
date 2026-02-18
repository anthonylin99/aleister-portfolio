import { NextResponse } from 'next/server';
import { getFactorById, updateFactor, deleteFactor } from '@/lib/factors/store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const factor = getFactorById(id);

    if (!factor) {
      return NextResponse.json(
        { error: 'Factor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(factor);
  } catch (error) {
    console.error('Error fetching factor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch factor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, color, assets } = body;

    const updated = updateFactor(id, { name, description, color, assets });

    if (!updated) {
      return NextResponse.json(
        { error: 'Factor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating factor:', error);
    return NextResponse.json(
      { error: 'Failed to update factor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteFactor(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting factor:', error);
    return NextResponse.json(
      { error: 'Failed to delete factor' },
      { status: 500 }
    );
  }
}
