import { Component, Input } from '@angular/core';
import { ChartWrapperComponent, ChartSeries } from './chart-wrapper.component';

// Full-width card holding a multi-series bar chart (e.g. year-wise growth)
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [ChartWrapperComponent],
  template: `
    <div class="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
      @if (subtitle) {
        <p class="text-sm text-slate-500 mb-4">{{ subtitle }}</p>
      }
      <div class="h-[300px]">
        <app-chart-wrapper
          type="bar"
          [labels]="labels"
          [series]="series"
          [stacked]="stacked"
          [minHeight]="300"
        ></app-chart-wrapper>
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() labels: string[] = [];
  @Input() series: ChartSeries[] = [];
  @Input() stacked = false;
}
