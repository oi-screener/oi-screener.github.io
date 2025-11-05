import { Component, signal, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OIScreenerService, OIPick } from './services/oi-screener.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  // No styleUrl needed as Tailwind is used via CDN, and host styles are in host object
  host: {
    class: 'block min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
  }
})
export class AppComponent implements OnInit {
  title = 'NSE Intraday OI Screener';
  bullishPicks = signal<OIPick[]>([]);
  bearishPicks = signal<OIPick[]>([]);
  loadingPicks = signal(true);
  errorMessage = signal('');

  private oiScreenerService = inject(OIScreenerService);

  constructor() {
    effect(() => {
      if (this.errorMessage()) {
        console.error('An error occurred:', this.errorMessage());
      }
    });
  }

  ngOnInit(): void {
    // Initial fetch of picks
    this.refreshPicks();
  }

  public async refreshPicks(): Promise<void> {
    this.loadingPicks.set(true);
    this.errorMessage.set('');
    try {
      const data = await this.oiScreenerService.getIntradayOIData();
      const { bullish, bearish } = this.oiScreenerService.getTopPicks(data);
      this.bullishPicks.set(bullish);
      this.bearishPicks.set(bearish);
    } catch (error) {
      console.error('Failed to fetch OI data:', error);
      this.errorMessage.set('Failed to load intraday picks. Please try again.');
    } finally {
      this.loadingPicks.set(false);
    }
  }

  public refreshData() {
    let url = window.location["protocol"] + "//" + window.location["host"] + "/?requestID=" + window["getUUID"]();
    window.location.replace(url);
  }

  // Helper for formatting numbers
  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // Helper for formatting percentage
  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
}