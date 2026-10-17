import { Component, Input, OnChanges } from '@angular/core';
import { ChartWrapperComponent } from './chart-wrapper.component';
import { CountUpComponent } from './count-up.component';
import { InWordsPipe, formatShortInr } from '../shared/format';

export interface SplitPart {
  label: string;
  value: number;
  color: string;       // doughnut segment and dot
  textColor?: string;  // amount colour, defaults to slate
}

// Doughnut with the total in the middle, next to a "part + part = total"
// breakdown with each part's share. Used for result summaries.
@Component({
  selector: 'app-split-summary',
  standalone: true,
  imports: [ChartWrapperComponent, CountUpComponent, InWordsPipe],
  template: `
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <div class="relative w-44 h-44 shrink-0">
        <app-chart-wrapper
          type="doughnut"
          [labels]="labels"
          [data]="values"
          [colors]="colors"
          [showLegend]="false"
          [minHeight]="176"
        ></app-chart-wrapper>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-xs text-slate-500">{{ centerLabel }}</span>
          <span class="text-base font-bold text-slate-800">{{ totalShort }}</span>
        </div>
      </div>

      <dl class="w-full min-w-0 text-sm space-y-3">
        @for (part of parts; track part.label; let i = $index) {
          <div>
            <dt class="flex items-center gap-2 text-slate-500 text-xs">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="part.color"></span>
              {{ i > 0 ? '+ ' : '' }}{{ part.label }} · {{ shares[i] }}%
            </dt>
            <dd class="text-base font-semibold pl-[18px]" [style.color]="part.textColor ?? '#1e293b'">
              <app-count-up [value]="part.value" prefix="₹" />
            </dd>
          </div>
        }
        <div class="pt-3 border-t border-slate-200">
          <dt class="text-xs font-semibold text-slate-700">= {{ totalLabel }}</dt>
          <dd>
            <span class="text-lg font-bold text-slate-900"><app-count-up [value]="total" prefix="₹" /></span>
            <span class="ml-1 text-xs text-slate-400">{{ total | inWords }}</span>
          </dd>
        </div>
      </dl>
    </div>
  `
})
export class SplitSummaryComponent implements OnChanges {
  @Input() parts: SplitPart[] = [];
  @Input() totalLabel = 'Total';
  @Input() centerLabel = 'Total';

  total = 0;
  totalShort = '';
  shares: number[] = [];
  labels: string[] = [];
  values: number[] = [];
  colors: string[] = [];

  ngOnChanges() {
    this.total = this.parts.reduce((s, p) => s + p.value, 0);
    this.totalShort = formatShortInr(this.total);
    this.labels = this.parts.map(p => p.label);
    this.values = this.parts.map(p => Math.max(0, p.value));
    this.colors = this.parts.map(p => p.color);

    // Whole-number shares that always add up to 100
    const raw = this.parts.map(p => (this.total > 0 ? (p.value / this.total) * 100 : 0));
    this.shares = raw.map(Math.round);
    if (this.total > 0 && this.shares.length) {
      const drift = 100 - this.shares.reduce((s, v) => s + v, 0);
      const largest = raw.indexOf(Math.max(...raw));
      this.shares[largest] += drift;
    }
  }
}
