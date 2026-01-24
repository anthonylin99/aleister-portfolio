import { NextResponse } from 'next/server';
import { getPortfolioWithPrices } from '@/lib/portfolio-service';

// Cache for price data
let priceCache: {
  data: Awaited<ReturnType<typeof getPortfolioWithPrices>> | null;
  lastFetch: number;
} = {
  data: null,
  lastFetch: 0,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    const now = Date.now();
    
    // Check if cache is valid
    if (priceCache.data && (now - priceCache.lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        cacheAge: Math.floor((now - priceCache.lastFetch) / 1000),
      });
    }
    
    // Fetch fresh data
    const data = await getPortfolioWithPrices();
    
    // Update cache
    priceCache = {
      data,
      lastFetch: now,
    };
    
    return NextResponse.json({
      ...data,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Return cached data if available
    if (priceCache.data) {
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        error: 'Failed to fetch fresh data, using cache',
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// Force refresh endpoint
export async function POST() {
  try {
    const data = await getPortfolioWithPrices();
    
    priceCache = {
      data,
      lastFetch: Date.now(),
    };
    
    return NextResponse.json({
      ...data,
      cached: false,
      refreshed: true,
    });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    return NextResponse.json(
      { error: 'Failed to refresh prices' },
      { status: 500 }
    );
  }
}
