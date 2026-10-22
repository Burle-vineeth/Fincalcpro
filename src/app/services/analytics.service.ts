import { Injectable, isDevMode } from '@angular/core';
import { inject } from '@vercel/analytics';

// Service to initialize Vercel Web Analytics
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor() {}

  // Initialize Vercel Analytics with appropriate mode
  initializeAnalytics(): void {
    inject({
      mode: isDevMode() ? 'development' : 'production',
      debug: isDevMode(),
    });
  }
}
