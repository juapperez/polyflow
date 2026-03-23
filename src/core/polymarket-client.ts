import axios from 'axios';
import { Market } from '../types';

export class PolymarketClient {
  private baseUrl: string;
  private isDev: boolean;
  
  constructor(useDev: boolean = false) {
    this.isDev = useDev;
    // Use dev environment for testing, production for live trading
    this.baseUrl = useDev 
      ? 'https://clob.polymarket.com' // Public CLOB API (no auth needed for reads)
      : 'https://clob.polymarket.com';
  }
  
  async getMarkets(limit: number = 20): Promise<Market[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/markets`, {
        params: { 
          limit,
          active: true,
          closed: false
        }
      });
      
      // Handle different response formats
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      return data.map((m: any) => this.parseMarket(m));
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  async getMarket(id: string): Promise<Market | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/markets/${id}`);
      return this.parseMarket(response.data);
    } catch (error) {
      console.error(`Error fetching market ${id}:`, error);
      return null;
    }
  }

  async getOrderBook(tokenId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/book`, {
        params: { token_id: tokenId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }
  
  async getSimplifiedMarkets(limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/simplified-markets`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching simplified markets:', error);
      return [];
    }
  }

  private parseMarket(data: any): Market {
    // Handle different API response formats
    const outcomes = data.outcomes || data.outcome_prices?.map((p: any) => p.outcome) || ['Yes', 'No'];
    const prices = data.outcome_prices?.map((p: any) => parseFloat(p.price)) || 
                   data.prices || 
                   [0.5, 0.5];
    
    return {
      id: data.condition_id || data.id || data.market_slug,
      question: data.question || data.title || 'Unknown Market',
      outcomes,
      prices,
      volume: parseFloat(data.volume || data.volume_24h || '0'),
      liquidity: parseFloat(data.liquidity || '0'),
      endDate: new Date(data.end_date_iso || data.end_date || data.endDate || Date.now() + 86400000)
    };
  }
}
