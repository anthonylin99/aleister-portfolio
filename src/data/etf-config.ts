// ETF Configuration for $ALIN (Prometheus ETF)
// Inception Date: January 24, 2026
// Starting Price: $100.00

export const etfConfig = {
  ticker: 'ALIN',
  name: 'Prometheus ETF',
  inceptionDate: '2026-01-24',
  inceptionPrice: 100.00,
  
  // Weights locked at inception - these represent the target allocation
  // Weights should sum to 1.0
  inceptionWeights: {
    ASTS: 0.180,   // Space & Satellite - largest conviction
    NVDA: 0.157,   // AI Infrastructure
    IREN: 0.140,   // Crypto Infrastructure
    HOOD: 0.133,   // Fintech
    GLXY: 0.120,   // Crypto Infrastructure
    AMZN: 0.072,   // Big Tech
    MTPLF: 0.056,  // Digital Asset Treasury
    FIGR: 0.053,   // Fintech
    META: 0.045,   // AI Infrastructure
    COIN: 0.025,   // Fintech
    KRKNF: 0.019,  // Defense Tech
  } as Record<string, number>,
  
  // Inception prices - will be populated on first run after inception
  // These are the closing prices on inception date
  inceptionPrices: {
    ASTS: 0,
    NVDA: 0,
    IREN: 0,
    HOOD: 0,
    GLXY: 0,
    AMZN: 0,
    MTPLF: 0,
    FIGR: 0,
    META: 0,
    COIN: 0,
    KRKNF: 0,
  } as Record<string, number>,
};

// Benchmark tickers for comparison
export const benchmarks = [
  { ticker: 'SPY', name: 'S&P 500', color: '#60a5fa' },
  { ticker: 'QQQ', name: 'Nasdaq 100', color: '#34d399' },
  { ticker: 'ARKK', name: 'ARK Innovation', color: '#f472b6' },
  { ticker: 'BITQ', name: 'Bitwise Crypto', color: '#fbbf24' },
];

// Time range labels for display
export const rangeLabels: Record<string, string> = {
  '1D': 'Today',
  '5D': 'Past 5 days',
  '1M': 'Past month',
  '3M': 'Past 3 months',
  '6M': 'Past 6 months',
  'YTD': 'Year to date',
  '1Y': 'Past year',
  'ALL': 'Since inception',
};

// Calculate ETF price based on weighted returns since inception
export function calculateETFPrice(
  currentPrices: Record<string, number>,
  inceptionPrices: Record<string, number>,
  weights: Record<string, number>,
  inceptionPrice: number
): number {
  let weightedReturn = 0;
  let totalWeight = 0;
  
  for (const [ticker, weight] of Object.entries(weights)) {
    const inception = inceptionPrices[ticker];
    const current = currentPrices[ticker];
    
    if (inception > 0 && current > 0) {
      const holdingReturn = (current - inception) / inception;
      weightedReturn += weight * holdingReturn;
      totalWeight += weight;
    }
  }
  
  // Normalize if we don't have all prices
  if (totalWeight > 0 && totalWeight < 1) {
    weightedReturn = weightedReturn / totalWeight;
  }
  
  return inceptionPrice * (1 + weightedReturn);
}

// Twitter accounts for specific tickers (for social feed)
export const tickerTwitterAccounts: Record<string, string[]> = {
  ASTS: ['ASTS_Investors', 'ASTS_SpaceMob', 'ASTSpaceMobile'],
  NVDA: ['nvidia', 'NVIDIAAIDev'],
  HOOD: ['RobinhoodApp'],
  GLXY: ['galaxyhq', 'novogratz'],
  FIGR: ['figure'],
  COIN: ['coinbase', 'brian_armstrong'],
  META: ['Meta', 'MetaAI'],
  AMZN: ['amazon', 'awscloud'],
  IREN: ['IrisEnergyLtd'],
  MTPLF: ['Metaplanet_JP'],
  KRKNF: ['KrakenRobotics'],
};

export type BenchmarkTicker = 'SPY' | 'QQQ' | 'ARKK' | 'BITQ';
