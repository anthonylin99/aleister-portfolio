import YahooFinance from 'yahoo-finance2';

// Create yahoo-finance instance (required for v3+)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Ticker mapping for international/OTC stocks
// Note: GLXY moved from TSX to NASDAQ (May 2025), FIGR IPO'd on NASDAQ (Sept 2025)
// Both now trade directly without special mapping
const tickerMap: Record<string, string> = {
  'MTPLF': 'MTPLF',       // Metaplanet OTC
  'KRKNF': 'KRKNF',       // Kraken Robotics OTC
};

export function getYahooTicker(ticker: string): string {
  return tickerMap[ticker] || ticker;
}

export interface QuoteData {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketState: string;
  lastUpdated: string;
}

export async function getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const quote = await yahooFinance.quote(yahooTicker);
    
    if (!quote || !quote.regularMarketPrice) {
      console.error(`No quote data for ${ticker}`);
      return null;
    }

    return {
      ticker,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketState: quote.marketState || 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<Record<string, QuoteData>> {
  const results: Record<string, QuoteData> = {};
  
  // Fetch quotes in parallel
  const promises = tickers.map(async (ticker) => {
    const quote = await getQuote(ticker);
    if (quote) {
      results[ticker] = quote;
    }
  });
  
  await Promise.all(promises);
  return results;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export async function getHistoricalData(
  ticker: string,
  startDate: Date,
  endDate: Date = new Date(),
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<HistoricalData[]> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const result = await yahooFinance.chart(yahooTicker, {
      period1: startDate,
      period2: endDate,
      interval,
    });

    if (!result || !result.quotes) {
      return [];
    }

    return result.quotes.map((q) => ({
      date: new Date(q.date),
      open: q.open || 0,
      high: q.high || 0,
      low: q.low || 0,
      close: q.close || 0,
      volume: q.volume || 0,
      adjClose: q.adjclose || q.close || 0,
    })).filter(q => q.close > 0);
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return [];
  }
}

// Check if US market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
export function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  
  // Weekend
  if (day === 0 || day === 6) return false;
  
  // Before 9:30 AM or after 4:00 PM
  const timeInMinutes = hour * 60 + minute;
  if (timeInMinutes < 9 * 60 + 30 || timeInMinutes >= 16 * 60) return false;
  
  return true;
}

// Check if we should refresh prices (every hour during market hours)
export function shouldRefreshPrices(lastFetch: string | null): boolean {
  if (!lastFetch) return true;
  
  const lastFetchTime = new Date(lastFetch);
  const now = new Date();
  const hoursSinceLastFetch = (now.getTime() - lastFetchTime.getTime()) / (1000 * 60 * 60);
  
  // Always refresh if more than 1 hour since last fetch
  if (hoursSinceLastFetch >= 1) {
    return isMarketOpen();
  }
  
  return false;
}
