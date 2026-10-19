import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { ChartCardComponent } from '../../components/chart-card.component';
import { InsightComponent } from '../../components/insight.component';
import { CountUpComponent } from '../../components/count-up.component';
import { ChartSeries } from '../../components/chart-wrapper.component';
import { CalculatorEngineService } from '../../services/calculator-engine.service';
import { formatIndian } from '../../shared/format';
import { INVESTED_COLOR, RETURNS_COLOR, RETURNS_TEXT, growthChart } from '../../shared/growth';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

const FREQUENCIES = [
  { value: 1, label: 'Annually', adverb: 'yearly' },
  { value: 2, label: 'Half-yearly', adverb: 'half-yearly' },
  { value: 4, label: 'Quarterly', adverb: 'quarterly' },
  { value: 12, label: 'Monthly', adverb: 'monthly' },
  { value: 365, label: 'Daily', adverb: 'daily' }
];

@Component({
  selector: 'app-compound-interest',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, FormsModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Compound Interest Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">See how interest on interest grows your savings.</p>

        <app-slider-input
          label="Principal Amount"
          [min]="1000" [max]="10000000" [step]="1000"
          [value]="principal"
          (valueChange)="principal = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Interest Rate (p.a.)"
          [min]="1" [max]="40" [step]="0.1"
          [value]="rate"
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Time Period"
          [min]="1" [max]="50" [step]="1"
          [value]="years"
          (valueChange)="years = $event; calculate()"
          suffix="years"
        ></app-slider-input>

        <div class="mb-2">
          <label for="ci-frequency" class="text-sm font-medium text-slate-700 block mb-2">Compounding Frequency</label>
          <select id="ci-frequency"
            [(ngModel)]="frequency"
            (ngModelChange)="calculate()"
            class="w-full bg-blue-50 border border-blue-100 text-slate-800 font-semibold text-sm rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 block p-2.5 outline-none"
          >
            @for (f of frequencies; track f.value) {
              <option [ngValue]="f.value">{{ f.label }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Interest Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Maturity Value</p>
            <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="results.totalValue" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">₹{{ fmt(principal) }} at {{ rate }}% compounded {{ frequencyAdverb }} for {{ years }} year{{ years > 1 ? 's' : '' }}</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Maturity Value"></app-split-summary>

          <app-insight tone="green">
            @if (frequency === 1) {
              Interest is added once a year, so the effective rate is the same <strong>{{ rate }}%</strong>. Compounding more often would earn more.
            } @else {
              Compounding {{ frequencyAdverb }} makes {{ rate }}% work like <strong>{{ effectiveRate }}%</strong> a year.
            }
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Year-wise Growth"
      subtitle="Your principal and the interest it has earned at the end of each year."
      [labels]="chartLabels"
      [series]="chartSeries"
      [stacked]="true"
    ></app-chart-card>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/compound-interest" />
  `
})
export class CompoundInterestComponent implements OnInit {
  principal = 250000;
  rate = 10;
  years = 15;
  frequency = 1;

  readonly frequencies = FREQUENCIES;
  readonly fmt = formatIndian;

  results = { principal: 0, interest: 0, totalValue: 0 };
  parts: SplitPart[] = [];
  effectiveRate = '';
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  constructor(
    private calculator: CalculatorEngineService
  ) {}

  get frequencyAdverb(): string {
    return FREQUENCIES.find(f => f.value === this.frequency)?.adverb ?? '';
  }

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    this.results = this.calculator.calculateCompoundInterest(this.principal, this.rate, this.years, this.frequency);
    this.parts = [
      { label: 'Principal', value: this.results.principal, color: INVESTED_COLOR },
      { label: 'Interest', value: this.results.interest, color: RETURNS_COLOR, textColor: RETURNS_TEXT }
    ];
    this.effectiveRate = ((Math.pow(1 + this.rate / 100 / this.frequency, this.frequency) - 1) * 100).toFixed(2);

    const points = [];
    for (let y = 1; y <= this.years; y++) {
      const r = this.calculator.calculateCompoundInterest(this.principal, this.rate, y, this.frequency);
      points.push({ label: `Yr ${y}`, invested: this.principal, value: r.totalValue });
    }
    ({ labels: this.chartLabels, series: this.chartSeries } = growthChart(points, 'Principal', 'Interest'));
  }
}
