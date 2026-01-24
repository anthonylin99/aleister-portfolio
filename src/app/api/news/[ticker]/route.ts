import { NextResponse } from 'next/server';
import { NewsArticle } from '@/types/portfolio';

// Get date N days ago in YYYY-MM-DD format
function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  try {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
    
    if (!FINNHUB_API_KEY) {
      // Return mock data if no API key
      return NextResponse.json({
        ticker: upperTicker,
        articles: getMockNews(upperTicker),
        source: 'mock',
      });
    }
    
    const fromDate = getDateNDaysAgo(7);
    const toDate = getTodayDate();
    
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${upperTicker}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 900 } } // Cache for 15 minutes
    );
    
    if (!response.ok) {
      throw new Error('Finnhub API error');
    }
    
    const articles = await response.json();
    
    // Filter and map articles
    const filteredArticles: NewsArticle[] = (articles || [])
      .slice(0, 20)
      .map((article: {
        id?: string;
        headline?: string;
        summary?: string;
        source?: string;
        url?: string;
        image?: string;
        datetime?: number;
        category?: string;
      }) => ({
        id: article.id?.toString() || Math.random().toString(),
        headline: article.headline || '',
        summary: article.summary || '',
        source: article.source || 'Unknown',
        url: article.url || '',
        image: article.image || undefined,
        datetime: article.datetime || Date.now() / 1000,
        category: article.category || 'general',
      }));
    
    return NextResponse.json({
      ticker: upperTicker,
      articles: filteredArticles,
      source: 'finnhub',
    });
  } catch (error) {
    console.error('News error:', error);
    // Return mock data on error
    return NextResponse.json({
      ticker: upperTicker,
      articles: getMockNews(upperTicker),
      source: 'mock',
      error: 'Failed to fetch from API',
    });
  }
}

// Mock news data for development/fallback
function getMockNews(ticker: string): NewsArticle[] {
  const now = Date.now() / 1000;
  
  const mockArticles: Record<string, NewsArticle[]> = {
    ASTS: [
      {
        id: '1',
        headline: 'AST SpaceMobile Announces Successful BlueBird Satellite Tests',
        summary: 'The company reports positive results from recent satellite connectivity tests, demonstrating cellular broadband capabilities from space.',
        source: 'Space News',
        url: 'https://spacenews.com',
        datetime: now - 3600,
        category: 'technology',
      },
      {
        id: '2',
        headline: 'ASTS Partners with Major Mobile Carriers for Global Coverage',
        summary: 'New partnership agreements signed with telecom operators across multiple continents.',
        source: 'Reuters',
        url: 'https://reuters.com',
        datetime: now - 7200,
        category: 'business',
      },
    ],
    NVDA: [
      {
        id: '1',
        headline: 'NVIDIA Sets New Records in AI Chip Demand',
        summary: 'Data center revenue surges as demand for AI training and inference chips continues to grow.',
        source: 'Bloomberg',
        url: 'https://bloomberg.com',
        datetime: now - 3600,
        category: 'technology',
      },
    ],
    DEFAULT: [
      {
        id: '1',
        headline: `${ticker} Stock Sees Active Trading Volume`,
        summary: 'Market participants show increased interest as sector dynamics evolve.',
        source: 'MarketWatch',
        url: 'https://marketwatch.com',
        datetime: now - 3600,
        category: 'markets',
      },
    ],
  };
  
  return mockArticles[ticker] || mockArticles.DEFAULT;
}
