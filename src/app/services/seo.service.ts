import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { GOOGLE_SITE_VERIFICATION, OG_IMAGE, PAGE_SEO, PageSeo, SITE_NAME, SITE_URL } from '../shared/seo-content';

const NOT_FOUND: PageSeo = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: `This page does not exist. Browse all ${SITE_NAME} calculators.`
};

// Sets the title, meta tags, canonical link and structured data for the current page.
// Runs during pre-rendering too, so search engines get everything in the HTML.
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  // Short page name, e.g. "EMI Calculator" from "EMI Calculator – Home, Car & … | FinCalcPro"
  static pageName(seo: PageSeo): string {
    return seo.title.split(/ – | \| /)[0];
  }

  setPage(path: string) {
    const known = PAGE_SEO[path];
    const seo = known ?? NOT_FOUND;
    const url = SITE_URL + (path === '/' ? '/' : path);

    this.titleService.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    if (known) {
      this.meta.removeTag('name="robots"');
    } else {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    }
    if (GOOGLE_SITE_VERIFICATION) {
      this.meta.updateTag({ name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION });
    }

    // Social previews (WhatsApp, LinkedIn, X, Facebook)
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    this.setCanonical(known ? url : null);
    this.setJsonLd(known ? this.structuredData(path, seo, url) : null);
  }

  private setCanonical(url: string | null) {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: object | null) {
    this.doc.getElementById('seo-json-ld')?.remove();
    if (!data) return;
    const script = this.doc.createElement('script');
    script.id = 'seo-json-ld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  private structuredData(path: string, seo: PageSeo, url: string): object {
    const website = {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: 'en-IN'
    };
    const graph: object[] = [website];

    if (path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: SeoService.pageName(seo), item: url }
        ]
      });
    }

    // Calculator pages are free web apps with FAQs
    if (seo.faqs?.length) {
      graph.push({
        '@type': 'WebApplication',
        name: SeoService.pageName(seo),
        url,
        description: seo.description,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        isPartOf: { '@id': website['@id'] }
      });
      graph.push({
        '@type': 'FAQPage',
        mainEntity: seo.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) }
        }))
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '');
}
