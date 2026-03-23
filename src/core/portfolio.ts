import { Position, Trade, PerformanceMetrics } from '../types';

export class Portfolio {
  private positions: Map<string, Position> = new Map();
  private trades: Trade[] = [];
  private balance: number;

  constructor(initialBalance: number = 10000) {
    this.balance = initialBalance;
  }

  addTrade(trade: Trade) {
    this.trades.push(trade);
    const key = `${trade.marketId}-${trade.outcome}`;
    
    const position = this.positions.get(key) || {
      marketId: trade.marketId,
      outcome: trade.outcome,
      shares: 0,
      avgPrice: 0,
      currentPrice: trade.price,
      pnl: 0
    };

    if (trade.action === 'BUY') {
      const totalCost = position.shares * position.avgPrice + trade.shares * trade.price;
      position.shares += trade.shares;
      position.avgPrice = totalCost / position.shares;
      this.balance -= trade.shares * trade.price;
    } else {
      position.shares -= trade.shares;
      this.balance += trade.shares * trade.price;
    }

    position.currentPrice = trade.price;
    position.pnl = (position.currentPrice - position.avgPrice) * position.shares;

    if (position.shares > 0) {
      this.positions.set(key, position);
    } else {
      this.positions.delete(key);
    }
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getBalance(): number {
    return this.balance;
  }

  getTotalValue(): number {
    const positionValue = Array.from(this.positions.values())
      .reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
    return this.balance + positionValue;
  }

  getMetrics(): PerformanceMetrics {
    const wins = this.trades.filter(t => {
      const key = `${t.marketId}-${t.outcome}`;
      const pos = this.positions.get(key);
      return pos && pos.pnl > 0;
    }).length;

    const totalPnL = Array.from(this.positions.values())
      .reduce((sum, p) => sum + p.pnl, 0);

    return {
      totalTrades: this.trades.length,
      winRate: this.trades.length > 0 ? wins / this.trades.length : 0,
      totalPnL,
      sharpeRatio: this.calculateSharpe(),
      maxDrawdown: this.calculateMaxDrawdown()
    };
  }

  private calculateSharpe(): number {
    if (this.trades.length < 2) return 0;
    
    const returns = this.trades.map((t, i) => {
      if (i === 0) return 0;
      return (t.price - this.trades[i-1].price) / this.trades[i-1].price;
    });

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );

    return stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  private calculateMaxDrawdown(): number {
    let peak = this.balance;
    let maxDD = 0;

    for (const trade of this.trades) {
      const value = this.getTotalValue();
      if (value > peak) peak = value;
      const dd = (peak - value) / peak;
      if (dd > maxDD) maxDD = dd;
    }

    return maxDD;
  }
}
