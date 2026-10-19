import { Component, Input } from '@angular/core';
import { Faq, PAGE_SEO } from '../shared/seo-content';

// Frequently asked questions for a page, from shared/seo-content.ts (the same
// text is published as FAQPage structured data by SeoService)
@Component({
  selector: 'app-faq',
  standalone: true,
  template: `
    @if (faqs.length) {
      <section class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="text-xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6">
          @for (faq of faqs; track faq.q) {
            <div>
              <h3 class="text-base font-bold text-slate-800 mb-2">{{ faq.q }}</h3>
              <p class="text-slate-600 text-sm leading-relaxed faq-answer" [innerHTML]="faq.a"></p>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .faq-answer ::ng-deep a { color: #1d4ed8; text-decoration: underline; }
  `]
})
export class FaqComponent {
  @Input({ required: true }) page!: string;

  get faqs(): Faq[] {
    return PAGE_SEO[this.page]?.faqs ?? [];
  }
}
