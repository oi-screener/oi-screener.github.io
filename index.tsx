// Required for JIT compilation in Applet environment
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { OIScreenerService } from './src/services/oi-screener.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideProtractorTestingSupport(), // Optional: if testing with Protractor
    // Provide the services that depend on GoogleGenAI or are used by the app component
    OIScreenerService
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.