import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/yahoo-finance';
import { TimeRange } from '@/types/portfolio';

function getStartDateForRange(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case '1M':
      return new Date(new Date().setMonth(now.getMonth() - 1));
    case '3M':
      return new Date(new Date().setMonth(now.getMonth() - 3));
    case 'YTD':
      return new Date(now.getFullYear(), 0, 1);
    case '1Y':
      return new Date(new Date().setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.getFullYear(), 0, 1);
  }
}

export interface VsBenchmarkResult {
  ticker: string;
  tickerReturn: number;
  benchmarkReturn: number;
  outperforming: boolean;
  delta: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers') || searchParams.get('ticker');
    const benchmark = searchParams.get('benchmark') || 'SPY';
    const range = (searchParams.get('range') || 'YTD') as TimeRange;

    if (!tickersParam) {
      return NextResponse.json({ error: 'Missing tickers' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
    const startDate = getStartDateForRange(range);
    const endDate = new Date();

    const computeReturn = async (t: string): Promise<number> => {
      const data = await getHistoricalData(t, startDate, endDate);
      if (data.length < 2) return 0;
      const first = data[0].close;
      const last = data[data.length - 1].close;
      if (first <= 0) return 0;
      return ((last - first) / first) * 100;
    };

    const [benchmarkReturn, ...tickerReturns] = await Promise.all([
      computeReturn(benchmark),
      ...tickers.map((t) => computeReturn(t)),
    ]);

    const results: Record<string, VsBenchmarkResult> = {};
    tickers.forEach((t, i) => {
      const tickerReturn = tickerReturns[i] ?? 0;
      const delta = tickerReturn - benchmarkReturn;
      results[t] = {
        ticker: t,
        tickerReturn,
        benchmarkReturn,
        outperforming: delta >= 0,
        delta,
      };
    });

    return NextResponse.json({ results, benchmark, range });
  } catch (error) {
    console.error('vs-benchmark error:', error);
    return NextResponse.json(
      { error: 'Failed to compute vs benchmark' },
      { status: 500 }
    );
  }
}
