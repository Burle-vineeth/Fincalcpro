import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectAnalytics } from '@vercel/analytics';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Vercel Web Analytics: counts visitors and page views, including in-app navigation.
// The mode is set explicitly because its auto-detection reads process.env, which
// Angular builds don't have; development mode only logs to the console.
injectAnalytics({ mode: isDevMode() ? 'development' : 'production' });

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
