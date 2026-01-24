/**
 * Initialize Redis with portfolio data from JSON
 * 
 * Usage:
 * 1. Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in .env.local
 * 2. Run: npx tsx scripts/init-portfolio.ts
 * 
 * Note: You need to set env vars before running, e.g.:
 *   UPSTASH_REDIS_REST_URL=xxx UPSTASH_REDIS_REST_TOKEN=xxx npx tsx scripts/init-portfolio.ts
 */

import { Redis } from '@upstash/redis';

const HOLDINGS_KEY = 'portfolio:holdings';

// Import portfolio data
import portfolioData from '../src/data/portfolio.json';

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  category: string;
  description: string;
  exchange?: string;
}

async function main() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.error('❌ Missing Upstash Redis credentials');
    console.log('Please add the following to your .env.local:');
    console.log('  UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io');
    console.log('  UPSTASH_REDIS_REST_TOKEN=AXxxxx');
    process.exit(1);
  }
  
  const redis = new Redis({ url, token });
  
  console.log('🚀 Initializing portfolio data in Redis...\n');
  
  const holdings = portfolioData.holdings as Holding[];
  
  for (const holding of holdings) {
    const data = {
      ...holding,
      addedAt: new Date().toISOString(),
    };
    
    await redis.hset(HOLDINGS_KEY, { [holding.ticker]: JSON.stringify(data) });
    console.log(`  ✓ ${holding.ticker} - ${holding.name} (${holding.shares} shares)`);
  }
  
  console.log(`\n✅ Successfully seeded ${holdings.length} holdings to Redis!`);
  console.log('\nYou can now manage your holdings through the admin UI at /admin');
}

main().catch(console.error);
