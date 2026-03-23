export interface Market {
  id: string;
  question: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  liquidity: number;
  endDate: Date;
}

export interface Signal {
  action: 'BUY' | 'SELL' | 'HOLD';
  outcome?: number;
  size: number;
  confidence: number;
  reason?: string;
}

export interface Position {
  marketId: string;
  outcome: number;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
}

export interface Trade {
  timestamp: Date;
  marketId: string;
  action: 'BUY' | 'SELL';
  outcome: number;
  shares: number;
  price: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
}
