import { PolymarketClient } from '../core/polymarket-client';
import { MomentumStrategy } from '../strategies/momentum-strategy';
import { Portfolio } from '../core/portfolio';
import { RiskManager } from '../core/risk-manager';

async function main() {
  console.log('🚀 POLYMARKET LIVE MARKET DEMO\n');
  console.log('='.repeat(60));
  console.log('Connecting to Polymarket API...\n');

  const client = new PolymarketClient(true); // Use dev mode
  const strategy = new MomentumStrategy(5);
  const portfolio = new Portfolio(10000);
  const riskManager = new RiskManager(1000, 0.02);

  try {
    // Fetch real markets
    console.log('📊 Fetching live markets from Polymarket...\n');
    const markets = await client.getMarkets(10);
    
    if (markets.length === 0) {
      console.log('⚠️  No markets found. Using demo mode...\n');
      return;
    }

    console.log(`✓ Found ${markets.length} active markets\n`);
    console.log('='.repeat(60));
    
    // Display markets
    console.log('\n📈 ACTIVE MARKETS:\n');
    markets.forEach((market, i) => {
      console.log(`${i + 1}. ${market.question}`);
      console.log(`   Price: ${market.prices[0].toFixed(4)} | Volume: $${(market.volume / 1000).toFixed(1)}k`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n🤖 ANALYZING MARKETS WITH MOMENTUM STRATEGY\n');

    // Analyze each market
    for (const market of markets.slice(0, 5)) {
      const signal = await strategy.analyze(market);
      
      if (signal.action !== 'HOLD') {
        console.log(`\n📊 Market: ${market.question.substring(0, 60)}...`);
        console.log(`   Current Price: ${market.prices[0].toFixed(4)}`);
        console.log(`   Signal: ${signal.action} | Confidence: ${signal.confidence.toFixed(2)}`);
        console.log(`   Reason: ${signal.reason}`);
        
        const positions = portfolio.getPositions();
        if (riskManager.validateSignal(signal, positions)) {
          console.log('   ✅ Signal validated by risk manager');
        } else {
          console.log('   ❌ Signal rejected by risk manager');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💰 PORTFOLIO STATUS:');
    console.log(`   Balance: $${portfolio.getBalance().toFixed(2)}`);
    console.log(`   Total Value: $${portfolio.getTotalValue().toFixed(2)}`);
    
    const metrics = portfolio.getMetrics();
    console.log(`   Total Trades: ${metrics.totalTrades}`);
    console.log(`   Win Rate: ${(metrics.winRate * 100).toFixed(1)}%`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Demo completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open demo/index.html for visual builder');
    console.log('   2. Add your API keys to .env for live trading');
    console.log('   3. Customize strategies in src/strategies/');
    console.log('   4. Deploy to production when ready\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 Make sure you have internet connection to fetch live markets.');
  }
}

main().catch(console.error);
