import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/yahoo-finance';
import { calculateHistoricalETFPrices, getDateRangeForFilter } from '@/lib/portfolio-service';
import { TimeRange, BenchmarkData } from '@/types/portfolio';
import { benchmarks } from '@/data/etf-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') || '1Y') as TimeRange;
  
  try {
    const startDate = getDateRangeForFilter(range);
    const endDate = new Date();
    
    // Fetch portfolio historical data
    const portfolioHistory = await calculateHistoricalETFPrices(startDate, endDate);
    
    // Fetch benchmark data in parallel
    const benchmarkPromises = benchmarks.map(async (benchmark) => {
      try {
        const data = await getHistoricalData(benchmark.ticker, startDate, endDate);
        
        if (data.length === 0) return null;
        
        // Normalize to base 100
        const basePrice = data[0].close;
        const normalizedData = data.map(d => ({
          date: d.date.toISOString().split('T')[0],
          value: (d.close / basePrice) * 100,
        }));
        
        const performance = data.length > 1
          ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
          : 0;
        
        return {
          ticker: benchmark.ticker,
          name: benchmark.name,
          color: benchmark.color,
          data: normalizedData,
          performance,
        } as BenchmarkData;
      } catch (error) {
        console.error(`Failed to fetch ${benchmark.ticker}:`, error);
        return null;
      }
    });
    
    const benchmarkResults = await Promise.all(benchmarkPromises);
    
    // Normalize portfolio data to base 100
    let portfolioNormalized: { date: string; value: number }[] = [];
    let portfolioPerformance = 0;
    
    if (portfolioHistory.length > 0) {
      const basePrice = portfolioHistory[0].close;
      portfolioNormalized = portfolioHistory.map(p => ({
        date: p.date,
        value: (p.close / basePrice) * 100,
      }));
      portfolioPerformance = ((portfolioHistory[portfolioHistory.length - 1].close - basePrice) / basePrice) * 100;
    }
    
    // Add portfolio as first item
    const alinData: BenchmarkData = {
      ticker: 'ALIN',
      name: 'Prometheus ETF',
      color: '#8b5cf6',
      data: portfolioNormalized,
      performance: portfolioPerformance,
    };
    
    return NextResponse.json({
      portfolio: alinData,
      benchmarks: benchmarkResults.filter(Boolean),
      range,
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}
