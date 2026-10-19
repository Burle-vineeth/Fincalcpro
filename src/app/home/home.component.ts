import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CALCULATORS, CATEGORY_LABELS } from '../shared/calculators';

const HEADINGS: Record<keyof typeof CATEGORY_LABELS, string> = {
  Loans: 'Loan Calculators',
  Investments: 'Investment Calculators',
  Finance: 'Salary & Finance Calculators'
};

// Landing page: links to every calculator, so search engines (and people) find them all
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Free Financial Calculators for India</h1>
      <p class="text-slate-600 max-w-3xl leading-relaxed">
        Plan loans, investments and taxes in seconds. Work out your EMI, see how much a prepayment saves,
        check your loan eligibility, project SIP and FD returns, and compare the new and old income tax regimes.
        Every calculator is free, needs no sign-up, and runs entirely in your browser.
      </p>
    </section>

    @for (group of groups; track group.label) {
      <section class="mb-10" [attr.aria-labelledby]="'cat-' + group.key">
        <h2 [id]="'cat-' + group.key" class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{{ group.heading }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (calc of group.items; track calc.route) {
            <a [routerLink]="calc.route"
               class="group block p-5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
              <h3 class="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{{ calc.title }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ calc.blurb }}</p>
            </a>
          }
        </div>
      </section>
    }
  `
})
export class HomeComponent {
  readonly groups = (Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map(key => ({
    key,
    label: CATEGORY_LABELS[key],
    heading: HEADINGS[key],
    items: CALCULATORS.filter(c => c.category === key).map(c => ({
      ...c,
      // Full names read better as card titles ("SIP" -> "SIP Calculator")
      title: c.name.endsWith('Calculator') ? c.name : `${c.name} Calculator`
    }))
  }));
}
