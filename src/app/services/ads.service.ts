import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ADSENSE_CLIENT, ADS_ENABLED } from '../shared/ads.config';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private scriptAdded = false;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Site-ownership tag AdSense checks when you add the site. Set on the server too,
  // so it is part of the pre-rendered HTML.
  addVerificationTag() {
    if (ADS_ENABLED) this.meta.updateTag({ name: 'google-adsense-account', content: ADSENSE_CLIENT });
  }

  // Loads the AdSense script once, in the browser only
  private loadScript() {
    if (this.scriptAdded || !isPlatformBrowser(this.platformId)) return;
    this.scriptAdded = true;
    const script = this.doc.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    this.doc.head.appendChild(script);
  }

  // Asks AdSense to fill one newly added <ins class="adsbygoogle"> element
  fill() {
    if (!ADS_ENABLED || !isPlatformBrowser(this.platformId)) return;
    this.loadScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or an already-filled slot; the page works without the ad
    }
  }
}
