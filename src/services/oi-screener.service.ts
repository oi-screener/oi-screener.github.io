import { Injectable } from '@angular/core';

export interface OIData {
  symbol: string;
  currentPrice: number;
  priceChange: number; // In percentage
  openInterest: number;
  oiChange: number; // In percentage
}

export interface OIPick extends OIData {
  sentiment: 'bullish' | 'bearish';
  score: number; // A calculated score for sorting
}

@Injectable({ providedIn: 'root' })
export class OIScreenerService {

  /**
   * Simulates fetching intraday Open Interest data.
   * In a real application, this would fetch data from a financial API.
   * @returns A promise that resolves with an array of OIData.
   */
  async getSimulatedIntradayOIData(): Promise<OIData[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const symbols = [
      'NIFTY50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK',
      'INFY', 'ICICIBANK', 'HINDUNILVR', 'BHARTIARTL', 'SBIN',
      'ITC', 'LT', 'BAJFINANCE', 'ASIANPAINT', 'KOTAKBANK',
      'MARUTI', 'ULTRACEMCO', 'TITAN', 'AXISBANK', 'ADANIENT',
      'ONGC', 'TECHM', 'WIPRO', 'POWERGRID', 'NESTLEIND'
    ];

    const data: OIData[] = symbols.map(symbol => {
      const currentPrice = parseFloat((Math.random() * 1000 + 100).toFixed(2));
      const priceChange = parseFloat(((Math.random() * 4 - 2)).toFixed(2)); // -2% to +2%
      const openInterest = Math.floor(Math.random() * 1000000) + 100000;
      const oiChange = parseFloat(((Math.random() * 10 - 5)).toFixed(2)); // -5% to +5%

      return { symbol, currentPrice, priceChange, openInterest, oiChange };
    });

    return data;
  }

  /**
   * Analyzes the Open Interest data to identify bullish and bearish picks.
   * This is a simplified logic for demonstration purposes.
   *
   * @param data An array of OIData.
   * @returns An object containing arrays of bullish and bearish OIPicks.
   */
  getTopPicks(data: OIData[]): { bullish: OIPick[], bearish: OIPick[] } {
    const picks: OIPick[] = [];

    data.forEach(item => {
      let sentiment: 'bullish' | 'bearish' = 'bullish';
      let score = 0;

      // Simplified logic for scoring:
      // Bullish: Price up, OI up => higher score
      // Bearish: Price down, OI up => higher score (magnitude)
      // Other scenarios get a base score based on overall change, leaning towards price direction.

      if (item.priceChange > 0 && item.oiChange > 0) {
        // Strong bullish: Price and OI increasing
        sentiment = 'bullish';
        score = item.priceChange * 3 + item.oiChange * 2; // Weights can be adjusted
      } else if (item.priceChange < 0 && item.oiChange > 0) {
        // Strong bearish: Price decreasing, OI increasing
        sentiment = 'bearish';
        score = Math.abs(item.priceChange) * 3 + item.oiChange * 2;
      } else if (item.priceChange > 0 && item.oiChange < 0) {
        // Weak bullish / Short Covering: Price up, OI down
        sentiment = 'bullish';
        score = item.priceChange * 2 + Math.abs(item.oiChange);
      } else if (item.priceChange < 0 && item.oiChange < 0) {
        // Weak bearish / Long Unwinding: Price down, OI down
        sentiment = 'bearish';
        score = Math.abs(item.priceChange) * 2 + Math.abs(item.oiChange);
      } else if (item.priceChange === 0 && item.oiChange > 0) {
        // Neutral price, increasing OI, leaning bullish (accumulation)
        sentiment = 'bullish';
        score = item.oiChange;
      } else if (item.priceChange === 0 && item.oiChange < 0) {
        // Neutral price, decreasing OI, leaning bearish (distribution)
        sentiment = 'bearish';
        score = Math.abs(item.oiChange);
      } else {
        // Default / less clear, assign a base score primarily from price change
        sentiment = item.priceChange >= 0 ? 'bullish' : 'bearish';
        score = Math.abs(item.priceChange) + Math.abs(item.oiChange) / 2;
      }


      picks.push({ ...item, sentiment, score });
    });

    // Sort and get top 5
    const sortedBullish = picks
      .filter(p => p.sentiment === 'bullish')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const sortedBearish = picks
      .filter(p => p.sentiment === 'bearish')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Note: score is calculated based on magnitude for both sentiments.

    return { bullish: sortedBullish, bearish: sortedBearish };
  }
}
