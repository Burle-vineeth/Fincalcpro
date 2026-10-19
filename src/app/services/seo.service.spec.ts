import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';
import { PAGE_SEO, SITE_URL } from '../shared/seo-content';
import { routes } from '../app.routes';

describe('SEO content', () => {
  const pagePaths = routes.filter(r => r.path !== '**' && !r.redirectTo).map(r => '/' + r.path);

  it('has a title, description and FAQs for every page', () => {
    for (const path of pagePaths) {
      const seo = PAGE_SEO[path];
      expect(seo, path).toBeTruthy();
      // Google cuts titles around 60 characters and descriptions around 160
      expect(seo.title.length, path).toBeLessThanOrEqual(70);
      expect(seo.description.length, path).toBeLessThanOrEqual(160);
      if (path !== '/' && path !== '/privacy') expect(seo.faqs?.length, path).toBeGreaterThanOrEqual(3);
    }
  });

  it('uses a different title and description on every page', () => {
    const titles = new Set(pagePaths.map(p => PAGE_SEO[p].title));
    const descriptions = new Set(pagePaths.map(p => PAGE_SEO[p].description));
    expect(titles.size).toBe(pagePaths.length);
    expect(descriptions.size).toBe(pagePaths.length);
  });
});

describe('SeoService', () => {
  let seo: SeoService;
  let doc: Document;

  beforeEach(() => {
    seo = TestBed.inject(SeoService);
    doc = TestBed.inject(DOCUMENT);
  });

  const jsonLd = () => JSON.parse(doc.getElementById('seo-json-ld')?.textContent ?? 'null');

  it('sets title, canonical and structured data for a calculator page', () => {
    seo.setPage('/emi');
    expect(doc.title).toBe(PAGE_SEO['/emi'].title);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/emi`);
    expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(`${SITE_URL}/emi`);
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();

    const types = jsonLd()['@graph'].map((n: any) => n['@type']);
    expect(types).toEqual(['WebSite', 'BreadcrumbList', 'WebApplication', 'FAQPage']);
    const faq = jsonLd()['@graph'][3];
    expect(faq.mainEntity.length).toBe(PAGE_SEO['/emi'].faqs!.length);
    expect(faq.mainEntity.every((q: any) => !/<[a-z]/.test(q.acceptedAnswer.text))).toBe(true);
  });

  it('marks unknown pages noindex without a canonical or structured data', () => {
    seo.setPage('/emi');
    seo.setPage('/no-such-page');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.getElementById('seo-json-ld')).toBeNull();

    seo.setPage('/sip');
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();
    expect(doc.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('uses the site root as the home page canonical', () => {
    seo.setPage('/');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/`);
    expect(jsonLd()['@graph'].map((n: any) => n['@type'])).toEqual(['WebSite']);
  });
});
