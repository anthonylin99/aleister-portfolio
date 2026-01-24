'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  HoldingWithPrice, 
  PortfolioSummary, 
  CategoryData, 
  ETFData, 
  HistoricalDataPoint, 
  TimeRange,
  RiskMetrics,
  BenchmarkData,
  NewsArticle,
  StockTwitsMessage,
  EarningsInfo
} from '@/types/portfolio';

interface PortfolioData {
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
  cached?: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePortfolio(): PortfolioData {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    previousValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    holdingsCount: 0,
    categoriesCount: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/prices', {
        method: forceRefresh ? 'POST' : 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      setHoldings(data.holdings || []);
      setSummary(data.summary || summary);
      setCategories(data.categories || []);
      setCached(data.cached || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { holdings, summary, categories, cached, loading, error, refresh };
}

interface ETFDataHook {
  etf: ETFData | null;
  loading: boolean;
  error: string | null;
}

export function useETF(): ETFDataHook {
  const [etf, setETF] = useState<ETFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchETF() {
      try {
        setLoading(true);
        const response = await fetch('/api/etf');
        if (!response.ok) throw new Error('Failed to fetch ETF data');
        const data = await response.json();
        setETF(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchETF();
  }, []);

  return { etf, loading, error };
}

interface HistoricalDataHook {
  data: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
}

export function useHistoricalData(initialRange: TimeRange = 'ALL'): HistoricalDataHook {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>(initialRange);

  useEffect(() => {
    async function fetchHistorical() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/historical?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch historical data');
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistorical();
  }, [range]);

  return { data, loading, error, range, setRange };
}

// Risk Metrics Hook
interface RiskMetricsHook {
  metrics: RiskMetrics | null;
  loading: boolean;
  error: string | null;
}

export function useRiskMetrics(range: TimeRange = '1Y'): RiskMetricsHook {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/volatility?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch risk metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, [range]);

  return { metrics, loading, error };
}

// Benchmarks Hook
interface BenchmarksHook {
  portfolio: BenchmarkData | null;
  benchmarks: BenchmarkData[];
  loading: boolean;
  error: string | null;
}

export function useBenchmarks(range: TimeRange = '1Y'): BenchmarksHook {
  const [portfolio, setPortfolio] = useState<BenchmarkData | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenchmarks() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/benchmarks?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch benchmarks');
        const data = await response.json();
        setPortfolio(data.portfolio);
        setBenchmarks(data.benchmarks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBenchmarks();
  }, [range]);

  return { portfolio, benchmarks, loading, error };
}

// News Hook
interface NewsHook {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
}

export function useNews(ticker: string): NewsHook {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/news/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, [ticker]);

  return { articles, loading, error };
}

// StockTwits Hook
interface StockTwitsHook {
  messages: StockTwitsMessage[];
  loading: boolean;
  error: string | null;
}

export function useStockTwits(ticker: string): StockTwitsHook {
  const [messages, setMessages] = useState<StockTwitsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockTwits() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/social/stocktwits/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch StockTwits');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStockTwits();
  }, [ticker]);

  return { messages, loading, error };
}

// Earnings Hook
interface EarningsHook {
  earnings: EarningsInfo | null;
  loading: boolean;
  error: string | null;
}

export function useEarnings(ticker: string): EarningsHook {
  const [earnings, setEarnings] = useState<EarningsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/earnings/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch earnings');
        const data = await response.json();
        setEarnings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEarnings();
  }, [ticker]);

  return { earnings, loading, error };
}
