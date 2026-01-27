import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { getYahooTicker } from '@/lib/yahoo-finance';

const yahooFinance = new YahooFinance();

interface BatchQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',').map(s => s.trim()).filter(Boolean) || [];

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  try {
    const quotes: BatchQuote[] = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const yahooTicker = getYahooTicker(symbol);
          const quote = await yahooFinance.quote(yahooTicker);
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const q = quote as any;
          
          return {
            symbol,
            price: q?.regularMarketPrice ?? 0,
            change: q?.regularMarketChange ?? 0,
            changePercent: q?.regularMarketChangePercent ?? 0,
          };
        } catch (err) {
          console.error(`Error fetching quote for ${symbol}:`, err);
          return {
            symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    return NextResponse.json(
      { quotes },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    );
  } catch (e) {
    console.error('Batch quote API error:', e);
    return NextResponse.json({ quotes: [], error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
