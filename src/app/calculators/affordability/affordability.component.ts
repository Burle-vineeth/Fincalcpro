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
import { AdSlotComponent } from '../../components/ad-slot.component';

const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30];

@Component({
  selector: 'app-affordability',
  standalone: true,
  imports: [AdSlotComponent, CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-1">Loan Affordability Calculator</h2>
        <p class="text-sm text-slate-500 mb-6">Find how much you can borrow if all your EMIs stay within {{ emiShare }}% of your in-hand income.</p>

        <app-slider-input
          label="Net Monthly Income"
          hint="Your in-hand salary"
          [min]="10000" [max]="1000000" [step]="1000"
          [value]="income"
          (valueChange)="income = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Existing EMIs"
          hint="Other loans you are already paying each month"
          [min]="0" [max]="500000" [step]="500"
          [value]="existingEmis"
          (valueChange)="existingEmis = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Max EMI Share of Income"
          hint="Banks usually allow 40–60% (FOIR), higher for larger incomes"
          [min]="10" [max]="80" [step]="1"
          [value]="emiShare"
          (valueChange)="emiShare = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Interest Rate (p.a.)"
          [min]="1" [max]="30" [step]="0.05"
          [value]="rate"
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Loan Tenure"
          [min]="1" [max]="30" [step]="1"
          [value]="tenure"
          (valueChange)="tenure = $event; calculate()"
          suffix="years"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Loan Eligibility">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">You Can Borrow Up To</p>
            <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="results.maxLoanAmount" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">with an EMI of ₹{{ fmt(Math.round(results.maxEmi)) }} for {{ tenure }} year{{ tenure > 1 ? 's' : '' }} at {{ rate }}%</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Monthly Income" centerLabel="Income"></app-split-summary>

          @if (results.maxEmi <= 0) {
            <app-insight>Your existing EMIs already use {{ emiShare }}% or more of your income, so banks are unlikely to approve a new loan.</app-insight>
          } @else {
            <app-insight>
              Over {{ tenure }} years you would pay <strong>₹{{ fmt(Math.round(totalInterest)) }}</strong> in interest on this loan,
              <strong>₹{{ fmt(Math.round(results.maxEmi * tenure * 12)) }}</strong> in total.
            </app-insight>
          }
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="How Tenure Changes What You Can Borrow"
      [subtitle]="'Maximum loan for the same ₹' + fmt(Math.round(results.maxEmi)) + ' EMI over different tenures. Longer loans let you borrow more but cost more interest.'"
      [labels]="chartLabels"
      [series]="chartSeries"
    ></app-chart-card>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- SEO FAQ Section -->
    <div class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-xl font-bold text-slate-800 mb-4">How much home loan can I afford?</h3>
      <p class="text-slate-600 mb-4 text-sm leading-relaxed">
        Banks usually allow a maximum of 50-60% of your net monthly income to go towards paying EMIs. Borrowing within this limit ensures you have enough buffer for regular living expenses and contingencies.
      </p>
    </div>
  `
})
export class AffordabilityComponent implements OnInit {
  income = 100000;
  existingEmis = 0;
  rate = 8.5;
  tenure = 20;
  // Share of net income all EMIs may take (FOIR); banks typically allow about half
  emiShare = 50;

  readonly fmt = formatIndian;
  readonly Math = Math;

  results = { maxEmi: 0, maxLoanAmount: 0 };
  totalInterest = 0;
  parts: SplitPart[] = [];
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  constructor(
    private calculator: CalculatorEngineService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.updateSeoTags(
      'Home Loan Affordability Calculator',
      'Calculate exactly how much home loan or personal loan you can afford based on your net monthly salary.',
      'Loan affordability calculator, max loan eligibility, how much loan can i get'
    );
    this.calculate();
  }

  calculate() {
    this.results = this.calculator.calculateAffordability(this.income, this.emiShare, this.rate, this.tenure * 12, this.existingEmis);
    this.totalInterest = this.results.maxEmi * this.tenure * 12 - this.results.maxLoanAmount;

    const existing = Math.min(this.existingEmis, this.income);
    this.parts = [
      { label: 'New Loan EMI', value: this.results.maxEmi, color: '#3b82f6' },
      ...(existing > 0 ? [{ label: 'Existing EMIs', value: existing, color: '#f59e0b', textColor: '#d97706' }] : []),
      { label: 'Left for Expenses', value: Math.max(0, this.income - this.results.maxEmi - existing), color: '#10b981', textColor: '#059669' }
    ];

    this.chartLabels = TENURE_OPTIONS.map(y => `${y} yrs`);
    this.chartSeries = [{
      label: 'Maximum loan',
      data: TENURE_OPTIONS.map(y => this.calculator.calculateAffordability(this.income, this.emiShare, this.rate, y * 12, this.existingEmis).maxLoanAmount),
      color: '#3b82f6'
    }];
  }
}
