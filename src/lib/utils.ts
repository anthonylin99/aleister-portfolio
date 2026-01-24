import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Holding, HoldingWithPrice, Category, CategoryData, categoryColors } from '@/types/portfolio';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPercentagePrecise(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculatePortfolioTotal(holdings: (Holding | HoldingWithPrice)[]): number {
  return holdings.reduce((sum, holding) => {
    if ('value' in holding && holding.value) {
      return sum + holding.value;
    }
    return sum;
  }, 0);
}

export function calculateCategoryData(holdings: HoldingWithPrice[]): CategoryData[] {
  const total = calculatePortfolioTotal(holdings);
  const categoryMap = new Map<Category, { value: number; holdings: HoldingWithPrice[] }>();

  holdings.forEach((holding) => {
    const existing = categoryMap.get(holding.category) || { value: 0, holdings: [] };
    existing.value += holding.value;
    existing.holdings.push(holding);
    categoryMap.set(holding.category, existing);
  });

  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.value,
      percentage: (data.value / total) * 100,
      color: categoryColors[name],
      holdings: data.holdings.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
}

export function getTopHoldings(holdings: HoldingWithPrice[], count: number = 5): HoldingWithPrice[] {
  return [...holdings].sort((a, b) => b.value - a.value).slice(0, count);
}

export function getLogoUrl(ticker: string): string {
  // Domain mapping for logo services
  const domainMap: Record<string, string> = {
    ASTS: 'ast-science.com',
    IREN: 'irisenergy.co',
    HOOD: 'robinhood.com',
    GLXY: 'galaxy.com',
    MTPLF: 'metaplanet.jp',
    AMZN: 'amazon.com',
    FIGR: 'figure.com',
    META: 'meta.com',
    NVDA: 'nvidia.com',
    COIN: 'coinbase.com',
    KRKNF: 'kraken.com',
  };

  const domain = domainMap[ticker];
  if (domain) {
    // Use img.logo.dev - a free reliable logo service
    return `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;
  }
  return '';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateString);
}
