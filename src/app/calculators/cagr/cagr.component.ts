import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { ChartCardComponent } from '../../components/chart-card.component';
import { InsightComponent } from '../../components/insight.component';
import { CountUpComponent } from '../../components/count-up.component';
import { ChartSeries } from '../../components/chart-wrapper.component';
import { CalculatorEngineService } from '../../services/calculator-engine.service';
import { SeoService } from '../../services/seo.service';
import { INVESTED_COLOR, RETURNS_COLOR, RETURNS_TEXT, doublingYears } from '../../shared/growth';

@Component({
  selector: 'app-cagr',
  standalone: true,
  imports: [CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-1">CAGR Calculator</h2>
        <p class="text-sm text-slate-500 mb-6">Find the steady yearly growth rate between a starting and an ending value.</p>

        <app-slider-input
          label="Initial Investment"
          [min]="1000" [max]="50000000" [step]="1000"
          [value]="startValue"
          (valueChange)="startValue = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Final Value"
          [min]="1000" [max]="100000000" [step]="1000"
          [value]="endValue"
          (valueChange)="endValue = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Duration"
          [min]="1" [max]="40" [step]="1"
          [value]="years"
          (valueChange)="years = $event; calculate()"
          suffix="years"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Growth Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">CAGR</p>
            <p class="text-4xl sm:text-5xl font-bold" [class]="cagr >= 0 ? 'text-green-600' : 'text-red-600'">
              <app-count-up [value]="cagr" [decimals]="2" suffix="%" />
            </p>
            <p class="text-sm text-slate-500 mt-1">a year, every year for {{ years }} year{{ years > 1 ? 's' : '' }} · {{ absReturn >= 0 ? '+' : '' }}{{ absReturn.toFixed(2) }}% in total</p>
          </div>

          <app-split-summary [parts]="parts" [totalLabel]="gained ? 'Final Value' : 'Initial Investment'"></app-split-summary>

          <app-insight [tone]="gained ? 'green' : 'amber'">
            @if (gained) {
              Your investment grew <strong>{{ (endValue / startValue).toFixed(2) }}×</strong>.
              @if (cagr > 0) {
                At {{ cagr.toFixed(2) }}% a year, money doubles about every <strong>{{ doubling }} years</strong>.
              }
            } @else {
              Your investment lost <strong>{{ (-absReturn).toFixed(2) }}%</strong> of its value, about {{ (-cagr).toFixed(2) }}% a year.
            }
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Growth Path"
      [subtitle]="'The value at the end of each year if it grew by exactly ' + cagr.toFixed(2) + '% every year.'"
      [labels]="chartLabels"
      [series]="chartSeries"
    ></app-chart-card>

    <!-- SEO FAQ Section -->
    <div class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-xl font-bold text-slate-800 mb-4">What is CAGR?</h3>
      <p class="text-slate-600 mb-4 text-sm leading-relaxed">
        CAGR stands for Compound Annual Growth Rate. It is the measure of an investment's annual growth rate over time, with the effect of compounding taken into account. It is often used to measure and compare the past performance of investments or to project their expected future returns.
      </p>
    </div>
  `
})
export class CagrComponent implements OnInit {
  startValue = 100000;
  endValue = 250000;
  years = 5;

  cagr = 0;
  absReturn = 0;
  gained = true;
  doubling = '';
  parts: SplitPart[] = [];
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  constructor(
    private calculator: CalculatorEngineService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.updateSeoTags(
      'CAGR Calculator',
      'Calculate the Compound Annual Growth Rate of your investments over a specific period of time.',
      'CAGR calculator, annual growth rate, investment return calculator'
    );
    this.calculate();
  }

  calculate() {
    this.cagr = this.calculator.calculateCagr(this.startValue, this.endValue, this.years);
    this.absReturn = ((this.endValue - this.startValue) / this.startValue) * 100;
    this.gained = this.endValue >= this.startValue;
    this.doubling = doublingYears(this.cagr).toFixed(1);

    // A gain reads as initial + gain = final; a loss as final + loss = initial
    this.parts = this.gained
      ? [
          { label: 'Initial Investment', value: this.startValue, color: INVESTED_COLOR },
          { label: 'Gain', value: this.endValue - this.startValue, color: RETURNS_COLOR, textColor: RETURNS_TEXT }
        ]
      : [
          { label: 'Final Value', value: this.endValue, color: INVESTED_COLOR },
          { label: 'Loss', value: this.startValue - this.endValue, color: '#ef4444', textColor: '#dc2626' }
        ];

    this.chartLabels = ['Start'];
    const values = [this.startValue];
    for (let y = 1; y <= this.years; y++) {
      this.chartLabels.push(`Yr ${y}`);
      values.push(this.startValue * Math.pow(1 + this.cagr / 100, y));
    }
    this.chartSeries = [{ label: 'Value', data: values, color: this.gained ? INVESTED_COLOR : '#ef4444' }];
  }
}
