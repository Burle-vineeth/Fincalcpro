import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { SeoService } from '../services/seo.service';
import { CALCULATORS, CATEGORY_LABELS } from '../shared/calculators';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <p class="text-sm font-semibold text-blue-600 mb-1">404</p>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p class="text-slate-600 mb-8">The page you're looking for doesn't exist or has moved. Pick a calculator below.</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        @for (group of groups; track group.label) {
          <div>
            <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{{ group.label }}</h2>
            <ul class="space-y-1">
              @for (calc of group.items; track calc.route) {
                <li><a [routerLink]="calc.route" class="text-blue-700 hover:underline">{{ calc.name }}</a></li>
              }
            </ul>
          </div>
        }
      </div>
    </div>
  `
})
export class NotFoundComponent implements OnInit, OnDestroy {
  readonly groups = (Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map(category => ({
    label: CATEGORY_LABELS[category],
    items: CALCULATORS.filter(c => c.category === category)
  }));

  constructor(private seo: SeoService, private meta: Meta) {}

  ngOnInit() {
    this.seo.updateSeoTags('Page Not Found', 'This page does not exist. Browse all FinCalcPro calculators.', '');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  // Calculator pages don't set robots, so remove it before navigating to one
  ngOnDestroy() {
    this.meta.removeTag('name="robots"');
  }
}
