import { NextResponse } from 'next/server';
import { getETFData } from '@/lib/portfolio-service';

// Cache for ETF data
let etfCache: {
  data: Awaited<ReturnType<typeof getETFData>> | null;
  lastFetch: number;
} = {
  data: null,
  lastFetch: 0,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const now = Date.now();
    
    // Check cache
    if (etfCache.data && (now - etfCache.lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        ...etfCache.data,
        cached: true,
      });
    }
    
    // Fetch fresh data
    const data = await getETFData();
    
    // Update cache
    etfCache = {
      data,
      lastFetch: now,
    };
    
    return NextResponse.json({
      ...data,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching ETF data:', error);
    
    if (etfCache.data) {
      return NextResponse.json({
        ...etfCache.data,
        cached: true,
        error: 'Using cached data',
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch ETF data' },
      { status: 500 }
    );
  }
}
