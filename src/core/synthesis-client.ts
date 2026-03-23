import axios from 'axios';
import { Market } from '../types';

export class SynthesisClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(apiKey?: string) {
    // Synthesis API base URL (update when docs are available)
    this.baseUrl = 'https://api.synthesis.trade';
    this.apiKey = apiKey;
  }

  async getMarkets(limit: number = 50): Promise<Market[]> {
    try {
      const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
      
      const response = await axios.get(`${this.baseUrl}/markets`, {
        params: { limit },
        headers
      });
      
      const data = Array.isArray(response.data) ? response.data : response.data.markets || [];
      return data.map((m: any) => this.parseMarket(m));
    } catch (error) {
      console.error('Error fetching Synthesis markets:', error);
      // Fallback to demo data for development
      return this.getDemoMarkets();
    }
  }

  async getMarket(id: string): Promise<Market | null> {
    try {
      const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
      
      const response = await axios.get(`${this.baseUrl}/markets/${id}`, { headers });
      return this.parseMarket(response.data);
    } catch (error) {
      console.error(`Error fetching Synthesis market ${id}:`, error);
      return null;
    }
  }

  async getOrderBook(marketId: string) {
    try {
      const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
      
      const response = await axios.get(`${this.baseUrl}/markets/${marketId}/orderbook`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }

  async getTrades(marketId: string, limit: number = 100) {
    try {
      const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
      
      const response = await axios.get(`${this.baseUrl}/markets/${marketId}/trades`, {
        params: { limit },
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  }

  private parseMarket(data: any): Market {
    // Parse Synthesis API response format
    return {
      id: data.id || data.market_id || data.marketId,
      question: data.question || data.title || data.description || 'Unknown Market',
      outcomes: data.outcomes || data.options || ['Yes', 'No'],
      prices: this.parsePrices(data),
      volume: parseFloat(data.volume || data.total_volume || '0'),
      liquidity: parseFloat(data.liquidity || data.total_liquidity || '0'),
      endDate: new Date(data.end_date || data.endDate || data.close_time || Date.now() + 86400000)
    };
  }

  private parsePrices(data: any): number[] {
    // Handle different price formats
    if (data.prices && Array.isArray(data.prices)) {
      return data.prices.map((p: any) => parseFloat(p));
    }
    if (data.outcome_prices && Array.isArray(data.outcome_prices)) {
      return data.outcome_prices.map((p: any) => parseFloat(p.price || p));
    }
    if (data.yes_price && data.no_price) {
      return [parseFloat(data.yes_price), parseFloat(data.no_price)];
    }
    // Default to 50/50
    return [0.5, 0.5];
  }

  // Demo markets for development/testing
  private getDemoMarkets(): Market[] {
    return [
      {
        id: 'synthesis-demo-1',
        question: 'Will Bitcoin reach $100k by end of 2026?',
        outcomes: ['Yes', 'No'],
        prices: [0.65, 0.35],
        volume: 125000,
        liquidity: 50000,
        endDate: new Date('2026-12-31')
      },
      {
        id: 'synthesis-demo-2',
        question: 'Will Ethereum merge to PoS be successful?',
        outcomes: ['Yes', 'No'],
        prices: [0.82, 0.18],
        volume: 89000,
        liquidity: 35000,
        endDate: new Date('2026-06-30')
      },
      {
        id: 'synthesis-demo-3',
        question: 'Will AI surpass human performance in coding by 2027?',
        outcomes: ['Yes', 'No'],
        prices: [0.58, 0.42],
        volume: 67000,
        liquidity: 28000,
        endDate: new Date('2027-01-01')
      },
      {
        id: 'synthesis-demo-4',
        question: 'Will a new L1 blockchain enter top 10 by market cap?',
        outcomes: ['Yes', 'No'],
        prices: [0.45, 0.55],
        volume: 54000,
        liquidity: 22000,
        endDate: new Date('2026-12-31')
      },
      {
        id: 'synthesis-demo-5',
        question: 'Will DeFi TVL exceed $200B in 2026?',
        outcomes: ['Yes', 'No'],
        prices: [0.52, 0.48],
        volume: 98000,
        liquidity: 41000,
        endDate: new Date('2026-12-31')
      }
    ];
  }
}
