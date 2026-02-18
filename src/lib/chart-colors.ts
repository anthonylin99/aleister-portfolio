// Granblue Skyfarer color palette for charts
// Azure, gold, crystal, and mana tones that feel magical yet readable
export const CHART_COLORS = [
  '#5DADE2', // Crystal Blue
  '#D4AF37', // Skyfarer Gold
  '#2ECC71', // Emerald Green
  '#E74C3C', // Ember Red
  '#9B59B6', // Mystic Purple
  '#1ABC9C', // Teal Mana
  '#F39C12', // Amber
  '#E67E22', // Copper
  '#3498DB', // Deep Mana Blue
  '#E8C84A', // Light Gold
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Popular tickers for quick comparison
export const POPULAR_COMPARISONS = [
  { ticker: 'SPY', label: 'S&P 500' },
  { ticker: 'QQQ', label: 'Nasdaq' },
  { ticker: 'DIA', label: 'Dow Jones' },
  { ticker: 'IWM', label: 'Russell 2000' },
  { ticker: 'VTI', label: 'Total Market' },
];
