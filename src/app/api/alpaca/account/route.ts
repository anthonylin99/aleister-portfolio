import { NextResponse } from 'next/server';
import { getAccount } from '@/lib/alpaca/client';

export async function GET() {
  try {
    const account = await getAccount();
    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch account' },
      { status: 500 }
    );
  }
}
