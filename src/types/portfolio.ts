export type Category =
  | 'Space & Satellite'
  | 'Crypto Infrastructure'
  | 'Fintech'
  | 'AI Infrastructure'
  | 'Digital Asset Treasury'
  | 'Big Tech'
  | 'Defense Tech';

export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  category: Category;
  description: string;
  exchange?: string;
  // Calculated fields (from API)
  currentPrice?: number;
  previousClose?: number;
  value?: number;
  dayChange?: number;
  dayChangePercent?: number;
}

export interface HoldingWithPrice extends Holding {
  currentPrice: number;
  previousClose: number;
  value: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
}

export interface CategoryData {
  name: Category;
  value: number;
  percentage: number;
  color: string;
  holdings: HoldingWithPrice[];
}

export interface PortfolioSummary {
  totalValue: number;
  previousValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  categoriesCount: number;
  lastUpdated: string;
}

export interface ETFData {
  ticker: string;
  name: string;
  inceptionDate: string;
  inceptionPrice: number;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export interface HistoricalDataPoint {
  date: string;
  time?: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number; // Portfolio value
}

export interface PriceCache {
  prices: Record<string, {
    price: number;
    previousClose: number;
    lastUpdated: string;
  }>;
  lastFetch: string;
}

export const categoryColors: Record<Category, string> = {
  'Space & Satellite': '#f472b6',
  'Crypto Infrastructure': '#22d3ee',
  'Fintech': '#a78bfa',
  'AI Infrastructure': '#34d399',
  'Digital Asset Treasury': '#fbbf24',
  'Big Tech': '#60a5fa',
  'Defense Tech': '#f97316',
};

export const categoryGradients: Record<Category, string> = {
  'Space & Satellite': 'from-pink-500 to-rose-400',
  'Crypto Infrastructure': 'from-cyan-400 to-teal-500',
  'Fintech': 'from-violet-400 to-purple-500',
  'AI Infrastructure': 'from-emerald-400 to-green-500',
  'Digital Asset Treasury': 'from-amber-400 to-yellow-500',
  'Big Tech': 'from-blue-400 to-indigo-500',
  'Defense Tech': 'from-orange-500 to-amber-500',
};

export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';

// Risk metrics
export interface RiskMetrics {
  volatility: number;       // Annualized standard deviation
  sharpeRatio: number;      // Risk-adjusted return
  maxDrawdown: number;      // Largest peak-to-trough decline
  beta: number;             // Volatility vs S&P 500
  sortinoRatio: number;     // Return per unit of downside risk
  calculatedAt: string;
  range: TimeRange;
}

// Benchmark data for comparison
export interface BenchmarkData {
  ticker: string;
  name: string;
  color: string;
  data: { date: string; value: number }[];
  performance: number; // % change over period
}

// News article
export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  category?: string;
}

// StockTwits message
export interface StockTwitsMessage {
  id: number;
  body: string;
  createdAt: string;
  user: {
    username: string;
    name: string;
    avatarUrl: string;
    followers: number;
    official: boolean;
  };
  sentiment: 'Bullish' | 'Bearish' | null;
  likes: number;
}

// Chart state for interactive features
export interface ChartDisplayState {
  selectedRange: TimeRange;
  displayPrice: number;
  displayChange: number;
  displayChangePercent: number;
  periodStartPrice: number;
  periodEndPrice: number;
  periodLabel: string;
}

// Drag selection for compare feature
export interface DragSelection {
  isSelecting: boolean;
  startIndex: number | null;
  endIndex: number | null;
  startPrice: number | null;
  endPrice: number | null;
  startDate: string | null;
  endDate: string | null;
}

// Earnings information
export interface EarningsInfo {
  date: string;
  formatted: string;
  isEstimate: boolean;
  daysUntil: number;
}
