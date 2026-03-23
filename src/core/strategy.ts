import { Market, Signal } from '../types';

export abstract class Strategy {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract analyze(market: Market): Promise<Signal>;

  getName(): string {
    return this.name;
  }
}
