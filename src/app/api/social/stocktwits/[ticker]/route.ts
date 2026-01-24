import { NextResponse } from 'next/server';
import { StockTwitsMessage } from '@/types/portfolio';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  try {
    const response = await fetch(
      `https://api.stocktwits.com/api/2/streams/symbol/${upperTicker}.json`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      // Return mock data if API fails
      return NextResponse.json({
        ticker: upperTicker,
        messages: getMockMessages(upperTicker),
        source: 'mock',
      });
    }
    
    const data = await response.json();
    
    // Filter for quality posts (followers > 50 or likes > 3)
    const filteredMessages: StockTwitsMessage[] = (data.messages || [])
      .filter((msg: { user?: { followers?: number }; likes?: { total?: number } }) => 
        (msg.user?.followers || 0) > 50 || 
        (msg.likes?.total || 0) > 3
      )
      .slice(0, 30)
      .map((msg: {
        id: number;
        body: string;
        created_at: string;
        user: {
          username: string;
          name: string;
          avatar_url: string;
          followers: number;
          official: boolean;
        };
        entities?: { sentiment?: { basic?: string } };
        likes?: { total?: number };
      }) => ({
        id: msg.id,
        body: msg.body,
        createdAt: msg.created_at,
        user: {
          username: msg.user.username,
          name: msg.user.name,
          avatarUrl: msg.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.user.username,
          followers: msg.user.followers,
          official: msg.user.official || false,
        },
        sentiment: (msg.entities?.sentiment?.basic as 'Bullish' | 'Bearish') || null,
        likes: msg.likes?.total || 0,
      }));
    
    return NextResponse.json({
      ticker: upperTicker,
      messages: filteredMessages,
      cursor: data.cursor,
      source: 'stocktwits',
    });
  } catch (error) {
    console.error('StockTwits error:', error);
    return NextResponse.json({
      ticker: upperTicker,
      messages: getMockMessages(upperTicker),
      source: 'mock',
      error: 'Failed to fetch from StockTwits',
    });
  }
}

// Mock StockTwits data for development/fallback
function getMockMessages(ticker: string): StockTwitsMessage[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: 1,
      body: `$${ticker} looking strong today! 📈 Love the momentum we're seeing.`,
      createdAt: now,
      user: {
        username: 'trader_mike',
        name: 'Mike Trading',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        followers: 1250,
        official: false,
      },
      sentiment: 'Bullish',
      likes: 12,
    },
    {
      id: 2,
      body: `Watching $${ticker} closely. Key support levels holding well. 🎯`,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      user: {
        username: 'chart_master',
        name: 'Chart Master',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chart',
        followers: 3500,
        official: false,
      },
      sentiment: 'Bullish',
      likes: 8,
    },
    {
      id: 3,
      body: `$${ticker} - interesting price action today. Waiting for confirmation before adding.`,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      user: {
        username: 'value_investor',
        name: 'Value Investor',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=value',
        followers: 890,
        official: false,
      },
      sentiment: null,
      likes: 5,
    },
  ];
}
