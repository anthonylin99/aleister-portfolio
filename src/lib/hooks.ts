'use client';

import { useState, useEffect, useCallback } from 'react';
import { HoldingWithPrice, PortfolioSummary, CategoryData, ETFData, HistoricalDataPoint, TimeRange } from '@/types/portfolio';

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
