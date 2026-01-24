export type Category =
  | 'Space & Satellite'
  | 'Crypto Infrastructure'
  | 'Fintech'
  | 'AI Infrastructure'
  | 'Digital Asset Treasury'
  | 'Big Tech';

export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  category: Category;
  description: string;
  exchange?: string;
  manualPrice?: number;
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
};

export const categoryGradients: Record<Category, string> = {
  'Space & Satellite': 'from-pink-500 to-rose-400',
  'Crypto Infrastructure': 'from-cyan-400 to-teal-500',
  'Fintech': 'from-violet-400 to-purple-500',
  'AI Infrastructure': 'from-emerald-400 to-green-500',
  'Digital Asset Treasury': 'from-amber-400 to-yellow-500',
  'Big Tech': 'from-blue-400 to-indigo-500',
};

export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | 'ALL';
