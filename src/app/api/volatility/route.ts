import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/yahoo-finance';
import { calculateHistoricalETFPrices, getDateRangeForFilter } from '@/lib/portfolio-service';
import { TimeRange, RiskMetrics } from '@/types/portfolio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') || '1Y') as TimeRange;
  
  try {
    const startDate = getDateRangeForFilter(range);
    const endDate = new Date();
    
    // Fetch historical data for portfolio and S&P 500 benchmark
    const [portfolioHistory, spyHistory] = await Promise.all([
      calculateHistoricalETFPrices(startDate, endDate),
      getHistoricalData('SPY', startDate, endDate),
    ]);
    
    if (portfolioHistory.length < 5) {
      return NextResponse.json({
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        beta: 1,
        sortinoRatio: 0,
        calculatedAt: new Date().toISOString(),
        range,
        error: 'Insufficient data for calculations',
      });
    }
    
    // Extract closing prices
    const portfolioPrices = portfolioHistory.map(p => p.close);
    const spyPrices = spyHistory.map(p => p.close);
    
    // Calculate daily returns
    const portfolioReturns = calculateDailyReturns(portfolioPrices);
    const spyReturns = calculateDailyReturns(spyPrices);
    
    // Calculate metrics
    const volatility = calculateAnnualizedVolatility(portfolioReturns);
    const sharpeRatio = calculateSharpeRatio(portfolioReturns, 0.045); // 4.5% risk-free rate
    const maxDrawdown = calculateMaxDrawdown(portfolioPrices);
    const beta = calculateBeta(portfolioReturns, spyReturns);
    const sortinoRatio = calculateSortinoRatio(portfolioReturns, 0.045);
    
    const metrics: RiskMetrics = {
      volatility,
      sharpeRatio,
      maxDrawdown,
      beta,
      sortinoRatio,
      calculatedAt: new Date().toISOString(),
      range,
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error calculating volatility:', error);
    return NextResponse.json(
      { error: 'Failed to calculate volatility metrics' },
      { status: 500 }
    );
  }
}

// Helper functions for risk calculations

function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  return returns;
}

function calculateAnnualizedVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
  const dailyStdDev = Math.sqrt(variance);
  
  // Annualize (252 trading days)
  return dailyStdDev * Math.sqrt(252);
}

function calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
  if (returns.length < 2) return 0;
  
  const annualizedReturn = returns.reduce((a, b) => a + b, 0) / returns.length * 252;
  const volatility = calculateAnnualizedVolatility(returns);
  
  return volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
}

function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (const price of prices) {
    if (price > peak) peak = price;
    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  return -maxDrawdown; // Return as negative number
}

function calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
  // Ensure same length
  const length = Math.min(portfolioReturns.length, marketReturns.length);
  if (length < 2) return 1;
  
  const pReturns = portfolioReturns.slice(0, length);
  const mReturns = marketReturns.slice(0, length);
  
  const pMean = pReturns.reduce((a, b) => a + b, 0) / length;
  const mMean = mReturns.reduce((a, b) => a + b, 0) / length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < length; i++) {
    covariance += (pReturns[i] - pMean) * (mReturns[i] - mMean);
    marketVariance += Math.pow(mReturns[i] - mMean, 2);
  }
  
  return marketVariance > 0 ? covariance / marketVariance : 1;
}

function calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
  if (returns.length < 2) return 0;
  
  const annualizedReturn = returns.reduce((a, b) => a + b, 0) / returns.length * 252;
  const negativeReturns = returns.filter(r => r < 0);
  
  if (negativeReturns.length === 0) return annualizedReturn > riskFreeRate ? 999 : 0;
  
  const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  
  return downsideDeviation > 0 ? (annualizedReturn - riskFreeRate) / downsideDeviation : 0;
}
