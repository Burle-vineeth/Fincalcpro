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
import { INVESTED_COLOR, RETURNS_COLOR, RETURNS_TEXT, growthChart } from '../../shared/growth';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

@Component({
  selector: 'app-retirement',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Retirement Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">Estimate the savings you need to retire and the monthly SIP to get there.</p>

        <app-slider-input
          label="Current Age"
          [min]="18" [max]="70" [step]="1"
          [value]="currentAge"
          (valueChange)="currentAge = $event; calculate()"
          suffix="years"
        ></app-slider-input>

        <app-slider-input
          label="Retirement Age"
          [min]="25" [max]="80" [step]="1"
          [value]="retirementAge"
          (valueChange)="retirementAge = $event; calculate()"
          suffix="years"
        ></app-slider-input>

        <app-slider-input
          label="Current Monthly Expenses"
          [min]="10000" [max]="1000000" [step]="1000"
          [value]="currentExpenses"
          (valueChange)="currentExpenses = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Inflation Rate (p.a.)"
          [min]="1" [max]="15" [step]="0.1"
          [value]="inflation"
          (valueChange)="inflation = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Expected Return Before Retirement (p.a.)"
          [min]="1" [max]="20" [step]="0.1"
          [value]="returnRate"
          (valueChange)="returnRate = $event; calculate()"
          suffix="%"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Retirement Plan">
          @if (timeToRetire <= 0) {
            <app-insight>Retirement age must be greater than your current age.</app-insight>
          } @else {
            <div>
              <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Savings Needed</p>
              <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="requiredCorpus" prefix="₹" /></p>
              <p class="text-sm text-slate-500 mt-1">by age {{ retirementAge }}, in {{ timeToRetire }} years</p>
            </div>

            <div class="flex items-center justify-between gap-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
              <div>
                <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Monthly SIP Needed</p>
                <p class="text-xs text-slate-500">at {{ returnRate }}% a year until retirement</p>
              </div>
              <p class="text-2xl font-bold text-green-600 whitespace-nowrap"><app-count-up [value]="requiredMonthlySip" prefix="₹" /></p>
            </div>

            <app-split-summary [parts]="parts" totalLabel="Savings Needed"></app-split-summary>

            <app-insight>
              Expenses of ₹{{ fmt(currentExpenses) }} a month today will be
              <strong>₹{{ fmt(Math.round(futureMonthlyExp)) }}</strong> a month at {{ retirementAge }} with {{ inflation }}% inflation.
              The target is 25× a year of those expenses, so you can withdraw about 4% a year.
            </app-insight>
          }
        </app-result-card>
      </div>
    </div>

    @if (timeToRetire > 0) {
      <app-chart-card
        title="Building Your Savings"
        [subtitle]="'Investing ₹' + fmt(Math.round(requiredMonthlySip)) + ' a month: what you put in and what it earns, year by year.'"
        [labels]="chartLabels"
        [series]="chartSeries"
        [stacked]="true"
      ></app-chart-card>
    }

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/retirement" />
  `
})
export class RetirementComponent implements OnInit {
  currentAge = 30;
  retirementAge = 60;
  currentExpenses = 50000;
  inflation = 6.0;
  returnRate = 12.0;

  timeToRetire = 30;
  futureMonthlyExp = 0;
  requiredCorpus = 0;
  requiredMonthlySip = 0;
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
    this.timeToRetire = this.retirementAge - this.currentAge;
    if (this.timeToRetire <= 0) {
      this.futureMonthlyExp = this.currentExpenses;
      this.requiredCorpus = 0;
      this.requiredMonthlySip = 0;
      return;
    }

    // Future monthly expenses adjusting for inflation
    this.futureMonthlyExp = this.calculator.calculateInflation(this.currentExpenses, this.inflation, this.timeToRetire);

    // Rule of thumb: required corpus = 25 × annual expense (4% safe withdrawal rate)
    const annualExp = this.futureMonthlyExp * 12;
    this.requiredCorpus = annualExp * 25;
    this.requiredMonthlySip = this.calculator.calculateRequiredSip(this.requiredCorpus, this.returnRate, this.timeToRetire);

    const invested = this.requiredMonthlySip * 12 * this.timeToRetire;
    this.parts = [
      { label: 'You Invest', value: invested, color: INVESTED_COLOR },
      { label: 'Returns', value: this.requiredCorpus - invested, color: RETURNS_COLOR, textColor: RETURNS_TEXT }
    ];

    const points = [];
    for (let y = 1; y <= this.timeToRetire; y++) {
      const r = this.calculator.calculateSip(this.requiredMonthlySip, this.returnRate, y);
      points.push({ label: `Age ${this.currentAge + y}`, invested: r.investedAmount, value: r.totalValue });
    }
    ({ labels: this.chartLabels, series: this.chartSeries } = growthChart(points));
  }
}
