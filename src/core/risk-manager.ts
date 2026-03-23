import { Position, Signal } from '../types';

export class RiskManager {
  private maxPositionSize: number;
  private riskLimit: number;

  constructor(maxPositionSize: number = 1000, riskLimit: number = 0.02) {
    this.maxPositionSize = maxPositionSize;
    this.riskLimit = riskLimit;
  }

  validateSignal(signal: Signal, positions: Position[]): boolean {
    if (signal.action === 'HOLD') return true;

    // Check position size limit
    if (signal.size > this.maxPositionSize) {
      console.log(`Signal rejected: size ${signal.size} exceeds max ${this.maxPositionSize}`);
      return false;
    }

    // Check total exposure
    const totalExposure = positions.reduce((sum, p) => sum + Math.abs(p.shares * p.currentPrice), 0);
    if (totalExposure > this.maxPositionSize * 5) {
      console.log('Signal rejected: total exposure too high');
      return false;
    }

    return true;
  }

  calculatePositionSize(signal: Signal, balance: number): number {
    const maxSize = balance * this.riskLimit;
    return Math.min(signal.size, maxSize, this.maxPositionSize);
  }
}
