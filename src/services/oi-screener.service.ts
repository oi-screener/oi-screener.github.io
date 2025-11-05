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
   * @returns A promise that resolves with an array of OIData.
   */
  async getIntradayOIData(): Promise<OIData[]> {
    let timeout = setTimeout(function () {
      window["showErrorDialog"](true);
    }, 10000);
    await new Promise(resolve => {
      let chkData = function () {
        if (window["__receivedOIData"]) {
          clearTimeout(timeout);
          setTimeout(resolve, 500)
        } else {
          setTimeout(chkData, 100);
        }
      };
      chkData();
    });
    clearTimeout(timeout);
    window["showErrorDialog"](false);
    return window["__receivedOIData"];
  }

  /**
   * Analyzes the Open Interest data to identify bullish and bearish picks.
   *
   * @param data An array of OIData.
   * @returns An object containing arrays of bullish and bearish OIPicks.
   */
  getTopPicks(data: OIData[]): { bullish: OIPick[], bearish: OIPick[] } {
    const picks: OIPick[] = [];

    data.forEach(item => {
      let sentiment: 'bullish' | 'bearish' = 'bullish';
      let score = 0;

      // Logic for scoring:
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
