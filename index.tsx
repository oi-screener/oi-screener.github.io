// Required for JIT compilation in Applet environment
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { OIScreenerService } from './src/services/oi-screener.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideProtractorTestingSupport(),
    OIScreenerService
  ]
}).catch(err => console.error(err));
