import { Strategy } from '../core/strategy';
import { Market, Signal } from '../types';

export class ArbitrageStrategy extends Strategy {
  private minSpread: number;

  constructor(minSpread: number = 0.05) {
    super('Arbitrage Strategy');
    this.minSpread = minSpread;
  }

  async analyze(market: Market): Promise<Signal> {
    // Check if prices sum to more than 1 (arbitrage opportunity)
    const priceSum = market.prices.reduce((a, b) => a + b, 0);
    
    if (priceSum > 1 + this.minSpread) {
      // Sell all outcomes
      return {
        action: 'SELL',
        outcome: 0,
        size: 100,
        confidence: 0.9,
        reason: `Arbitrage: price sum = ${priceSum.toFixed(4)}`
      };
    } else if (priceSum < 1 - this.minSpread) {
      // Buy all outcomes
      return {
        action: 'BUY',
        outcome: 0,
        size: 100,
        confidence: 0.9,
        reason: `Arbitrage: price sum = ${priceSum.toFixed(4)}`
      };
    }

    return { action: 'HOLD', size: 0, confidence: 0 };
  }
}
