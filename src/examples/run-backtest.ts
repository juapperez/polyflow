import { BacktestEngine } from '../backtesting/backtest-engine';
import { MomentumStrategy } from '../strategies/momentum-strategy';
import { ArbitrageStrategy } from '../strategies/arbitrage-strategy';
import { Market } from '../types';

// Generate synthetic market data with realistic price movements
function generateMarketData(numMarkets: number = 100): Market[] {
  const markets: Market[] = [];
  
  for (let i = 0; i < numMarkets; i++) {
    // Create price series with trends and volatility
    let price = 0.4 + Math.random() * 0.2; // Start between 0.4-0.6
    const trend = (Math.random() - 0.5) * 0.02; // Small trend
    const volatility = 0.01 + Math.random() * 0.02;
    
    // Add some noise to make it realistic
    price += (Math.random() - 0.5) * volatility;
    price = Math.max(0.1, Math.min(0.9, price)); // Keep in bounds
    
    markets.push({
      id: `market-${i}`,
      question: `Will event ${i} happen?`,
      outcomes: ['Yes', 'No'],
      prices: [price, 1 - price],
      volume: 10000 + Math.random() * 50000,
      liquidity: 5000 + Math.random() * 20000,
      endDate: new Date(Date.now() + 86400000 * 7)
    });
  }
  
  return markets;
}

async function main() {
  console.log('🔬 Running Backtests...\n');

  const marketData = generateMarketData(100);
  
  // Test Momentum Strategy
  const momentumEngine = new BacktestEngine(10000);
  const momentumStrategy = new MomentumStrategy(10);
  const momentumResult = await momentumEngine.run(momentumStrategy, marketData);
  momentumEngine.printResults(momentumResult);

  // Test Arbitrage Strategy
  const arbEngine = new BacktestEngine(10000);
  const arbStrategy = new ArbitrageStrategy(0.05);
  const arbResult = await arbEngine.run(arbStrategy, marketData);
  arbEngine.printResults(arbResult);
}

main().catch(console.error);
