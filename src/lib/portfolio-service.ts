import { getQuotes, getHistoricalData, HistoricalData } from './yahoo-finance';
import portfolioData from '@/data/portfolio.json';
import { 
  Holding, 
  HoldingWithPrice, 
  CategoryData, 
  PortfolioSummary, 
  ETFData,
  HistoricalDataPoint,
  categoryColors,
  TimeRange 
} from '@/types/portfolio';

const holdings = portfolioData.holdings as Holding[];
const etfConfig = portfolioData.etf;

// Get all tickers that need price fetching (exclude private companies)
export function getTradableTickers(): string[] {
  return holdings
    .filter(h => h.exchange !== 'PRIVATE')
    .map(h => h.ticker);
}

// Calculate portfolio with live prices
export async function getPortfolioWithPrices(): Promise<{
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
}> {
  const tickers = getTradableTickers();
  const quotes = await getQuotes(tickers);
  
  // Calculate holdings with prices
  const holdingsWithPrices: HoldingWithPrice[] = holdings.map(holding => {
    let currentPrice: number;
    let previousClose: number;
    
    if (holding.exchange === 'PRIVATE' && holding.manualPrice) {
      currentPrice = holding.manualPrice;
      previousClose = holding.manualPrice;
    } else {
      const quote = quotes[holding.ticker];
      currentPrice = quote?.price || 0;
      previousClose = quote?.previousClose || currentPrice;
    }
    
    const value = currentPrice * holding.shares;
    const previousValue = previousClose * holding.shares;
    const dayChange = value - previousValue;
    const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;
    
    return {
      ...holding,
      currentPrice,
      previousClose,
      value,
      dayChange,
      dayChangePercent,
      weight: 0, // Will be calculated after total is known
    };
  });
  
  // Calculate total and weights
  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.value, 0);
  const previousTotalValue = holdingsWithPrices.reduce((sum, h) => sum + (h.previousClose * h.shares), 0);
  
  holdingsWithPrices.forEach(h => {
    h.weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
  });
  
  // Sort by value descending
  holdingsWithPrices.sort((a, b) => b.value - a.value);
  
  // Calculate category data
  const categoryMap = new Map<string, { value: number; holdings: HoldingWithPrice[] }>();
  holdingsWithPrices.forEach(h => {
    const existing = categoryMap.get(h.category) || { value: 0, holdings: [] };
    existing.value += h.value;
    existing.holdings.push(h);
    categoryMap.set(h.category, existing);
  });
  
  const categories: CategoryData[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name: name as CategoryData['name'],
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      color: categoryColors[name as keyof typeof categoryColors],
      holdings: data.holdings.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
  
  // Summary
  const dayChange = totalValue - previousTotalValue;
  const dayChangePercent = previousTotalValue > 0 ? (dayChange / previousTotalValue) * 100 : 0;
  
  const summary: PortfolioSummary = {
    totalValue,
    previousValue: previousTotalValue,
    dayChange,
    dayChangePercent,
    holdingsCount: holdingsWithPrices.length,
    categoriesCount: categories.length,
    lastUpdated: new Date().toISOString(),
  };
  
  return { holdings: holdingsWithPrices, summary, categories };
}

// Calculate $ALIN ETF price based on portfolio performance
export async function getETFData(): Promise<ETFData> {
  const { summary } = await getPortfolioWithPrices();
  
  // Get historical performance to calculate current ETF price
  const historicalPrices = await calculateHistoricalETFPrices(new Date(etfConfig.inceptionDate), new Date());
  
  const latestPrice = historicalPrices.length > 0 
    ? historicalPrices[historicalPrices.length - 1].close 
    : etfConfig.inceptionPrice;
  
  const previousPrice = historicalPrices.length > 1
    ? historicalPrices[historicalPrices.length - 2].close
    : etfConfig.inceptionPrice;
  
  const dayChange = latestPrice - previousPrice;
  const dayChangePercent = previousPrice > 0 ? (dayChange / previousPrice) * 100 : 0;
  const totalReturn = latestPrice - etfConfig.inceptionPrice;
  const totalReturnPercent = (totalReturn / etfConfig.inceptionPrice) * 100;
  
  return {
    ticker: etfConfig.ticker,
    name: etfConfig.name,
    inceptionDate: etfConfig.inceptionDate,
    inceptionPrice: etfConfig.inceptionPrice,
    currentPrice: latestPrice,
    dayChange,
    dayChangePercent,
    totalReturn,
    totalReturnPercent,
  };
}

// Calculate historical ETF prices based on weighted portfolio returns
export async function calculateHistoricalETFPrices(
  startDate: Date,
  endDate: Date = new Date()
): Promise<HistoricalDataPoint[]> {
  const tickers = getTradableTickers();
  
  // Fetch historical data for all stocks
  const historicalDataMap: Record<string, HistoricalData[]> = {};
  
  await Promise.all(
    tickers.map(async (ticker) => {
      const data = await getHistoricalData(ticker, startDate, endDate);
      if (data.length > 0) {
        historicalDataMap[ticker] = data;
      }
    })
  );
  
  // Find common dates across all stocks
  const allDates = new Set<string>();
  Object.values(historicalDataMap).forEach(data => {
    data.forEach(d => allDates.add(d.date.toISOString().split('T')[0]));
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  if (sortedDates.length === 0) {
    return [];
  }
  
  // Calculate portfolio value for each date
  const etfPrices: HistoricalDataPoint[] = [];
  let baselineValue: number | null = null;
  
  for (const dateStr of sortedDates) {
    let portfolioValue = 0;
    let validStocks = 0;
    
    holdings.forEach(holding => {
      if (holding.exchange === 'PRIVATE') {
        // Use manual price for private companies
        portfolioValue += (holding.manualPrice || 0) * holding.shares;
        validStocks++;
      } else {
        const stockData = historicalDataMap[holding.ticker];
        if (stockData) {
          const dayData = stockData.find(d => d.date.toISOString().split('T')[0] === dateStr);
          if (dayData) {
            portfolioValue += dayData.close * holding.shares;
            validStocks++;
          }
        }
      }
    });
    
    // Only include if we have data for most stocks
    if (validStocks >= holdings.length * 0.7) {
      if (baselineValue === null) {
        baselineValue = portfolioValue;
      }
      
      // Calculate ETF price based on portfolio performance
      const etfPrice = baselineValue > 0 
        ? etfConfig.inceptionPrice * (portfolioValue / baselineValue)
        : etfConfig.inceptionPrice;
      
      etfPrices.push({
        date: dateStr,
        time: new Date(dateStr).getTime() / 1000,
        open: etfPrice,
        high: etfPrice,
        low: etfPrice,
        close: etfPrice,
        value: portfolioValue,
      });
    }
  }
  
  return etfPrices;
}

// Get date range for time filter
export function getDateRangeForFilter(range: TimeRange): Date {
  const now = new Date();
  
  switch (range) {
    case '1D':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '5D':
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case '1M':
      return new Date(now.setMonth(now.getMonth() - 1));
    case '3M':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6M':
      return new Date(now.setMonth(now.getMonth() - 6));
    case 'YTD':
      return new Date(now.getFullYear(), 0, 1);
    case '1Y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '3Y':
      return new Date(now.setFullYear(now.getFullYear() - 3));
    case 'ALL':
    default:
      return new Date(etfConfig.inceptionDate);
  }
}
