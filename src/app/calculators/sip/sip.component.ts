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
import { formatIndian } from '../../shared/format';
import { INVESTED_COLOR, RETURNS_COLOR, RETURNS_TEXT, growthChart } from '../../shared/growth';

@Component({
  selector: 'app-sip',
  standalone: true,
  imports: [CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-1">SIP Calculator</h2>
        <p class="text-sm text-slate-500 mb-6">See what a fixed monthly investment in mutual funds could grow to.</p>

        <app-slider-input
          label="Monthly Investment"
          [min]="500" [max]="1000000" [step]="500"
          [value]="monthlyInvestment"
          (valueChange)="monthlyInvestment = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Expected Return Rate (p.a.)"
          [min]="1" [max]="30" [step]="0.1"
          [value]="rate"
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Time Period"
          [min]="1" [max]="40" [step]="1"
          [value]="years"
          (valueChange)="years = $event; calculate()"
          suffix="years"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Investment Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Maturity Value</p>
            <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="results.totalValue" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">from ₹{{ fmt(monthlyInvestment) }} a month for {{ years }} year{{ years > 1 ? 's' : '' }}</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Maturity Value"></app-split-summary>

          <app-insight tone="green">
            Your money grows <strong>{{ multiple }}×</strong>. Returns make up <strong>{{ returnsShare }}%</strong> of the final value.
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Year-wise Growth"
      subtitle="Total amount invested and estimated returns at the end of each year."
      [labels]="chartLabels"
      [series]="chartSeries"
      [stacked]="true"
    ></app-chart-card>

    <!-- SEO FAQ Section -->
    <div class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-xl font-bold text-slate-800 mb-4">What is a SIP?</h3>
      <p class="text-slate-600 mb-4 text-sm leading-relaxed">
        Systematic Investment Plan (SIP) allows you to invest a small, fixed amount in mutual funds at regular intervals. This strategy enforces financial discipline and averages out the cost of investment over time, mitigating market volatility.
      </p>
      <h3 class="text-xl font-bold text-slate-800 mb-4">How are SIP returns calculated?</h3>
      <p class="text-slate-600 text-sm leading-relaxed">
        The expected return is treated as an annual growth rate, the way mutual fund returns (CAGR) are reported. It is converted to the equivalent monthly rate, <strong>(1 + annual rate)<sup>1/12</sup> − 1</strong>, and each monthly installment grows at that rate from the day it is invested. Some calculators simply divide the annual rate by 12, which compounds to a higher yearly return (12% becomes about 12.68%) and shows larger figures.
      </p>
    </div>
  `
})
export class SipComponent implements OnInit {
  monthlyInvestment = 5000;
  rate = 12;
  years = 10;

  results = { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
  parts: SplitPart[] = [];
  multiple = '';
  returnsShare = 0;
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  readonly fmt = formatIndian;

  constructor(
    private calculator: CalculatorEngineService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.updateSeoTags(
      'Mutual Fund SIP Calculator',
      'Calculate the future value of your monthly mutual fund investments (SIP) with compounding interest.',
      'SIP calculator, mutual fund calculator, compound interest SIP'
    );
    this.calculate();
  }

  calculate() {
    this.results = this.calculator.calculateSip(this.monthlyInvestment, this.rate, this.years);
    const { investedAmount, estimatedReturns, totalValue } = this.results;
    this.parts = [
      { label: 'Invested', value: investedAmount, color: INVESTED_COLOR },
      { label: 'Est. Returns', value: estimatedReturns, color: RETURNS_COLOR, textColor: RETURNS_TEXT }
    ];
    this.multiple = (totalValue / investedAmount).toFixed(2);
    this.returnsShare = Math.round((estimatedReturns / totalValue) * 100);

    const points = [];
    for (let y = 1; y <= this.years; y++) {
      const r = this.calculator.calculateSip(this.monthlyInvestment, this.rate, y);
      points.push({ label: `Yr ${y}`, invested: r.investedAmount, value: r.totalValue });
    }
    ({ labels: this.chartLabels, series: this.chartSeries } = growthChart(points));
  }
}
