import { BacktestEngine } from '../backtesting/backtest-engine';
import { MomentumStrategy } from '../strategies/momentum-strategy';
import { Market } from '../types';

// Generate time-series market data with realistic price movements
function generateTimeSeriesData(numPeriods: number = 50): Market[][] {
  const allPeriods: Market[][] = [];
  const numMarkets = 5;
  
  // Initialize markets with starting prices
  const marketStates = Array(numMarkets).fill(0).map((_, i) => ({
    id: `market-${i}`,
    price: 0.45 + Math.random() * 0.1,
    trend: (Math.random() - 0.5) * 0.01
  }));
  
  // Generate price evolution over time
  for (let period = 0; period < numPeriods; period++) {
    const periodMarkets: Market[] = [];
    
    for (let i = 0; i < numMarkets; i++) {
      const state = marketStates[i];
      
      // Update price with trend and noise
      state.price += state.trend + (Math.random() - 0.5) * 0.02;
      state.price = Math.max(0.1, Math.min(0.9, state.price));
      
      // Occasionally reverse trend
      if (Math.random() < 0.1) {
        state.trend *= -1;
      }
      
      periodMarkets.push({
        id: state.id,
        question: `Will outcome ${i} occur?`,
        outcomes: ['Yes', 'No'],
        prices: [state.price, 1 - state.price],
        volume: 50000 + Math.random() * 100000,
        liquidity: 20000 + Math.random() * 50000,
        endDate: new Date(Date.now() + 86400000 * 7)
      });
    }
    
    allPeriods.push(periodMarkets);
  }
  
  return allPeriods;
}

async function main() {
  console.log('🚀 POLYMARKET AUTOMATION FRAMEWORK - LIVE DEMO\n');
  console.log('='.repeat(60));
  
  // Generate realistic time-series data
  console.log('\n📊 Generating market data...');
  const timeSeriesData = generateTimeSeriesData(50);
  console.log(`✓ Generated ${timeSeriesData.length} time periods`);
  console.log(`✓ Tracking ${timeSeriesData[0].length} markets\n`);
  
  // Flatten for backtest
  const allMarkets = timeSeriesData.flat();
  
  console.log('='.repeat(60));
  console.log('\n🧪 RUNNING MOMENTUM STRATEGY BACKTEST\n');
  
  const engine = new BacktestEngine(10000);
  const strategy = new MomentumStrategy(5);
  
  const result = await engine.run(strategy, allMarkets);
  
  console.log('\n' + '='.repeat(60));
  engine.printResults(result);
  console.log('='.repeat(60));
  
  // Show sample trades
  if (result.metrics.totalTrades > 0) {
    console.log('\n✅ Strategy successfully executed trades!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open demo/index.html for visual builder');
    console.log('   2. Customize strategies in src/strategies/');
    console.log('   3. Add your Polymarket API keys to .env');
    console.log('   4. Run: npm run bot (for live trading)\n');
  } else {
    console.log('\n💡 No trades executed. Try:');
    console.log('   - Adjusting strategy parameters');
    console.log('   - Using different market conditions');
    console.log('   - Creating custom strategies\n');
  }
}

main().catch(console.error);
