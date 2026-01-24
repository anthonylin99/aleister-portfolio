import { NextResponse } from 'next/server';
import { getTransactions, logTransaction, Transaction } from '@/lib/holdings-service';

// GET transaction history
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit')) || 50;
  
  try {
    const transactions = await getTransactions(limit);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Log new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.ticker || !body.shares || !body.price || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: type, ticker, shares, price, date' },
        { status: 400 }
      );
    }
    
    if (!['BUY', 'SELL'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be BUY or SELL' },
        { status: 400 }
      );
    }
    
    const transaction: Omit<Transaction, 'id'> = {
      type: body.type,
      ticker: body.ticker.toUpperCase(),
      shares: Number(body.shares),
      price: Number(body.price),
      date: body.date,
      brokerage: body.brokerage,
      notes: body.notes,
    };
    
    const transactionId = await logTransaction(transaction);
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Failed to log transaction. Redis may not be configured.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      transactionId,
      transaction: { ...transaction, id: transactionId },
    });
  } catch (error) {
    console.error('Failed to log transaction:', error);
    return NextResponse.json(
      { error: 'Failed to log transaction' },
      { status: 500 }
    );
  }
}
