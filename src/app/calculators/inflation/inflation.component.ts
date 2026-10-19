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
import { formatIndian } from '../../shared/format';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

const TODAY_COLOR = '#3b82f6';
const RISE_COLOR = '#ef4444';

@Component({
  selector: 'app-inflation',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Inflation Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">Find out how much the same lifestyle will cost you in the future.</p>

        <app-slider-input
          label="Cost Today"
          [min]="1000" [max]="5000000" [step]="500"
          [value]="currentCost"
          (valueChange)="currentCost = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Expected Inflation Rate (p.a.)"
          [min]="1" [max]="15" [step]="0.1"
          [value]="rate"
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Time Horizon"
          [min]="1" [max]="40" [step]="1"
          [value]="years"
          (valueChange)="years = $event; calculate()"
          suffix="years"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Future Cost">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Cost in {{ years }} Year{{ years > 1 ? 's' : '' }}</p>
            <p class="text-4xl sm:text-5xl font-bold text-red-600"><app-count-up [value]="futureCost" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">for what costs ₹{{ fmt(currentCost) }} today, at {{ rate }}% inflation</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Future Cost" centerLabel="Future"></app-split-summary>

          <app-insight>
            Prices rise <strong>{{ (futureCost / currentCost).toFixed(2) }}×</strong>. ₹{{ fmt(currentCost) }} kept as cash will only buy what
            <strong>₹{{ fmt(Math.round(purchasingPower)) }}</strong> buys today.
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Cost Over Time"
      subtitle="Today's cost and the extra you would pay because of inflation, year by year."
      [labels]="chartLabels"
      [series]="chartSeries"
      [stacked]="true"
    ></app-chart-card>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/inflation" />
  `
})
export class InflationComponent implements OnInit {
  currentCost = 100000;
  rate = 6.0;
  years = 10;

  futureCost = 0;
  purchasingPower = 0;
  parts: SplitPart[] = [];
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  readonly fmt = formatIndian;
  readonly Math = Math;

  constructor(
    private calculator: CalculatorEngineService
  ) {}

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    this.futureCost = this.calculator.calculateInflation(this.currentCost, this.rate, this.years);
    this.purchasingPower = this.currentCost * this.currentCost / this.futureCost;
    this.parts = [
      { label: "Today's Cost", value: this.currentCost, color: TODAY_COLOR },
      { label: 'Rise from Inflation', value: this.futureCost - this.currentCost, color: RISE_COLOR, textColor: '#dc2626' }
    ];

    this.chartLabels = [];
    const rise: number[] = [];
    for (let y = 1; y <= this.years; y++) {
      this.chartLabels.push(`Yr ${y}`);
      rise.push(this.calculator.calculateInflation(this.currentCost, this.rate, y) - this.currentCost);
    }
    this.chartSeries = [
      { label: "Today's Cost", data: rise.map(() => this.currentCost), color: TODAY_COLOR },
      { label: 'Rise from Inflation', data: rise, color: RISE_COLOR }
    ];
  }
}
