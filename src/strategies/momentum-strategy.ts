import { Strategy } from '../core/strategy';
import { Market, Signal } from '../types';

export class MomentumStrategy extends Strategy {
  private priceHistory: Map<string, number[]> = new Map();
  private lookbackPeriod: number;

  constructor(lookbackPeriod: number = 10) {
    super('Momentum Strategy');
    this.lookbackPeriod = lookbackPeriod;
  }

  async analyze(market: Market): Promise<Signal> {
    const currentPrice = market.prices[0];
    
    // Store price history
    const history = this.priceHistory.get(market.id) || [];
    history.push(currentPrice);
    if (history.length > this.lookbackPeriod) {
      history.shift();
    }
    this.priceHistory.set(market.id, history);

    // Need enough data
    if (history.length < this.lookbackPeriod) {
      return { action: 'HOLD', size: 0, confidence: 0 };
    }

    // Calculate momentum
    const momentum = this.calculateMomentum(history);
    const volatility = this.calculateVolatility(history);

    // Generate signal with more aggressive thresholds
    if (momentum > 0.005 && currentPrice < 0.65 && volatility < 0.1) {
      return {
        action: 'BUY',
        outcome: 0,
        size: 100,
        confidence: Math.min(momentum * 20, 1),
        reason: `Positive momentum: ${momentum.toFixed(4)}, low vol`
      };
    } else if (momentum < -0.005 && currentPrice > 0.35 && volatility < 0.1) {
      return {
        action: 'SELL',
        outcome: 0,
        size: 100,
        confidence: Math.min(Math.abs(momentum) * 20, 1),
        reason: `Negative momentum: ${momentum.toFixed(4)}, low vol`
      };
    }

    return { action: 'HOLD', size: 0, confidence: 0 };
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 2) return 0;
    const recent = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = prices.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    return (recent - older) / older;
  }

  private calculateVolatility(prices: number[]): number {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }
}
