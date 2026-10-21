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
  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Site-ownership tag and AdSense script, which AdSense looks for in the <head>.
  // Added on the server too, so both are part of the pre-rendered HTML.
  // The script runs before Angular hydrates the page, so keep Auto ads off in
  // AdSense: ads it inserted into server-rendered markup would break hydration.
  addHeadTags() {
    if (!ADS_ENABLED) return;
    this.meta.updateTag({ name: 'google-adsense-account', content: ADSENSE_CLIENT });
    // Already there when the browser takes over a pre-rendered page
    if (this.doc.head.querySelector('script[src*="adsbygoogle.js"]')) return;
    const script = this.doc.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('src', `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`);
    script.setAttribute('crossorigin', 'anonymous');
    this.doc.head.appendChild(script);
  }

  // Asks AdSense to fill one newly added <ins class="adsbygoogle"> element
  fill() {
    if (!ADS_ENABLED || !isPlatformBrowser(this.platformId)) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or an already-filled slot; the page works without the ad
    }
  }
}
