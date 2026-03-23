import dotenv from 'dotenv';
import { PolymarketClient } from '../core/polymarket-client';
import { MomentumStrategy } from '../strategies/momentum-strategy';
import { Portfolio } from '../core/portfolio';
import { RiskManager } from '../core/risk-manager';

dotenv.config();

async function main() {
  console.log('🤖 Starting Momentum Trading Bot...\n');

  const client = new PolymarketClient();
  const strategy = new MomentumStrategy(10);
  const portfolio = new Portfolio(10000);
  const riskManager = new RiskManager(1000, 0.02);

  // Main trading loop
  while (true) {
    try {
      const markets = await client.getMarkets();
      console.log(`Analyzing ${markets.length} markets...`);

      for (const market of markets.slice(0, 5)) {
        const signal = await strategy.analyze(market);
        
        if (signal.action !== 'HOLD') {
          console.log(`\n📊 Market: ${market.question}`);
          console.log(`Signal: ${signal.action} | Confidence: ${signal.confidence.toFixed(2)}`);
          console.log(`Reason: ${signal.reason}`);

          const positions = portfolio.getPositions();
          if (riskManager.validateSignal(signal, positions)) {
            console.log('✅ Signal validated - would execute trade');
            // In production: execute actual trade here
          } else {
            console.log('❌ Signal rejected by risk manager');
          }
        }
      }

      const metrics = portfolio.getMetrics();
      console.log(`\n💰 Portfolio: $${portfolio.getTotalValue().toFixed(2)}`);
      console.log(`Trades: ${metrics.totalTrades} | Win Rate: ${(metrics.winRate * 100).toFixed(1)}%`);

      // Wait before next iteration
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute

    } catch (error) {
      console.error('Error in trading loop:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main().catch(console.error);
