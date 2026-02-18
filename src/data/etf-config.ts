// ETF Configuration for $ALIN (Aleister)
// Inception Date: January 24, 2026
// Starting Price: $100.00
// Owner: anthonylin99@gmail.com

export const OWNER_EMAIL = 'anthonylin99@gmail.com';

export const etfConfig = {
  ticker: 'ALIN',
  name: 'Aleister',
  description: `"Do what thou wilt shall be the whole of the Law."

Aleister Crowley taught that true magick is the science and art of causing change in conformity with Will. The uninitiated see markets as chaos — noise, fear, herd behavior. But to the adept, every price movement is a ritual, every thesis an invocation, every conviction trade an act of Will.

The financial establishment guards its secrets like the old mystery schools — opaque strategies, asymmetric information, and tools reserved for the initiated few. They want you passive. They want you in index funds. They want you asleep.

Aleister exists to awaken you.

This portfolio is a grimoire of high-conviction positions across the forces reshaping reality: AI infrastructure, digital assets, space technology, and fintech innovation. No hidden fees. No institutional gatekeeping. Just pure, thesis-driven magick — transparent and open to all who dare to look.

"Love is the law, love under will."

Welcome to the Great Work. The market is your temple.`,
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
// Colors: Artemis purple, vibrant green, coral orange, electric blue
export const benchmarks = [
  { ticker: 'SPY', name: 'S&P 500', color: '#D4AF37' },      // Artemis purple
  { ticker: 'QQQ', name: 'Nasdaq 100', color: '#00D9A5' },   // Vibrant teal-green
  { ticker: 'ARKK', name: 'ARK Innovation', color: '#FF6B6B' }, // Coral red
  { ticker: 'BITQ', name: 'Bitwise Crypto', color: '#FFB800' }, // Golden yellow
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
  '5Y': 'Past 5 years',
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
