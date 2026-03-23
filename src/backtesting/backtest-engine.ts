import { Strategy } from '../core/strategy';
import { Portfolio } from '../core/portfolio';
import { RiskManager } from '../core/risk-manager';
import { Market, Trade, PerformanceMetrics } from '../types';

export interface BacktestResult {
  strategy: string;
  metrics: PerformanceMetrics;
  finalBalance: number;
  totalValue: number;
  trades: Trade[];
}

export class BacktestEngine {
  private portfolio: Portfolio;
  private riskManager: RiskManager;

  constructor(initialBalance: number = 10000) {
    this.portfolio = new Portfolio(initialBalance);
    this.riskManager = new RiskManager();
  }

  async run(strategy: Strategy, marketData: Market[]): Promise<BacktestResult> {
    console.log(`\nRunning backtest for ${strategy.getName()}...`);
    console.log(`Markets: ${marketData.length}`);

    for (const market of marketData) {
      const signal = await strategy.analyze(market);
      
      if (signal.action !== 'HOLD') {
        const positions = this.portfolio.getPositions();
        
        if (this.riskManager.validateSignal(signal, positions)) {
          const size = this.riskManager.calculatePositionSize(
            signal,
            this.portfolio.getBalance()
          );

          const trade: Trade = {
            timestamp: new Date(),
            marketId: market.id,
            action: signal.action,
            outcome: signal.outcome || 0,
            shares: size,
            price: market.prices[signal.outcome || 0]
          };

          this.portfolio.addTrade(trade);
          console.log(`${signal.action} ${size} shares at ${trade.price.toFixed(4)} - ${signal.reason || ''}`);
        }
      }
    }

    const metrics = this.portfolio.getMetrics();
    
    return {
      strategy: strategy.getName(),
      metrics,
      finalBalance: this.portfolio.getBalance(),
      totalValue: this.portfolio.getTotalValue(),
      trades: []
    };
  }

  printResults(result: BacktestResult) {
    console.log('\n=== BACKTEST RESULTS ===');
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Total Trades: ${result.metrics.totalTrades}`);
    console.log(`Win Rate: ${(result.metrics.winRate * 100).toFixed(2)}%`);
    console.log(`Total P&L: $${result.metrics.totalPnL.toFixed(2)}`);
    console.log(`Sharpe Ratio: ${result.metrics.sharpeRatio.toFixed(4)}`);
    console.log(`Max Drawdown: ${(result.metrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Final Balance: $${result.finalBalance.toFixed(2)}`);
    console.log(`Total Value: $${result.totalValue.toFixed(2)}`);
  }
}
