import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateSeoTags(title: string, description: string, keywords: string, author: string = 'FinCalcPro') {
    // Standard Tags
    this.titleService.setTitle(`${title} | FinCalcPro`);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'author', content: author });

    // OpenGraph Tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }

  setCanonicalURL(url: string) {
    const head = this.doc.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.doc.querySelector(`link[rel='canonical']`) || null;
    if (element === null) {
      element = this.doc.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', url);
  }

  addJsonLd(schema: any) {
    if (isPlatformBrowser(this.platformId)) {
      // Typically, in a real app, you inject the script tag into the head
      // To strictly avoid duplicate schemas on route change, we'd remove existing
      const existing = this.doc.getElementById('json-ld-schema');
      if (existing) {
        existing.remove();
      }
      
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'json-ld-schema';
      script.text = JSON.stringify(schema);
      this.doc.head.appendChild(script);
    }
  }
}
