import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { SegmentedControlComponent } from '../../components/segmented-control.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { ChartCardComponent } from '../../components/chart-card.component';
import { InsightComponent } from '../../components/insight.component';
import { CountUpComponent } from '../../components/count-up.component';
import { ChartSeries } from '../../components/chart-wrapper.component';
import { CalculatorEngineService } from '../../services/calculator-engine.service';
import { formatIndian } from '../../shared/format';
import { INVESTED_COLOR, RETURNS_COLOR, RETURNS_TEXT, GrowthPoint, growthChart } from '../../shared/growth';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

@Component({
  selector: 'app-fd-rd',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, SliderInputComponent, ResultCardComponent, SegmentedControlComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">FD &amp; RD Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">Find the maturity amount of a fixed or recurring deposit.</p>

        <app-segmented-control
          [options]="[{ value: 'FD', label: 'Fixed Deposit (FD)' }, { value: 'RD', label: 'Recurring Deposit (RD)' }]"
          [value]="mode"
          (valueChange)="setMode($event)"
        ></app-segmented-control>

        <app-slider-input
          [label]="mode === 'FD' ? 'Deposit Amount' : 'Monthly Deposit'"
          [min]="500" [max]="10000000" [step]="500"
          [value]="amount"
          (valueChange)="amount = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Interest Rate (p.a.)"
          [min]="1" [max]="15" [step]="0.05"
          [value]="rate"
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input
          label="Tenure"
          [min]="1" [max]="mode === 'FD' ? 10 : 120" [step]="1"
          [value]="tenure"
          (valueChange)="tenure = $event; calculate()"
          [suffix]="mode === 'FD' ? 'years' : 'months'"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card [title]="mode === 'FD' ? 'FD Maturity' : 'RD Maturity'">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Maturity Value</p>
            <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="results.totalValue" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">
              @if (mode === 'FD') {
                ₹{{ fmt(amount) }} deposited once, for {{ tenure }} year{{ tenure > 1 ? 's' : '' }} at {{ rate }}%
              } @else {
                ₹{{ fmt(amount) }} a month for {{ tenure }} month{{ tenure > 1 ? 's' : '' }} at {{ rate }}%
              }
            </p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Maturity Value"></app-split-summary>

          <app-insight tone="green">
            @if (mode === 'FD') {
              Banks add FD interest every quarter, so {{ rate }}% earns an effective <strong>{{ effectiveYield }}%</strong> a year.
            } @else {
              Interest adds <strong>{{ interestShare }}%</strong> to what you deposit. Each installment earns interest, compounded quarterly, for the months it stays in the account.
            }
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Year-wise Growth"
      subtitle="Amount deposited and interest earned at the end of each year."
      [labels]="chartLabels"
      [series]="chartSeries"
      [stacked]="true"
    ></app-chart-card>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/fd-rd" />
  `
})
export class FdRdComponent implements OnInit {
  mode: 'FD' | 'RD' = 'FD';
  amount = 100000;
  rate = 7.0;
  tenure = 5; // Years for FD, Months for RD

  readonly fmt = formatIndian;

  results = { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
  parts: SplitPart[] = [];
  effectiveYield = '';
  interestShare = 0;
  chartLabels: string[] = [];
  chartSeries: ChartSeries[] = [];

  constructor(
    private calculator: CalculatorEngineService
  ) {}

  ngOnInit() {
    this.calculate();
  }

  setMode(newMode: 'FD' | 'RD') {
    this.mode = newMode;
    if (this.mode === 'FD') {
      this.amount = 100000;
      this.tenure = 5; // default 5 years
    } else {
      this.amount = 5000;
      this.tenure = 60; // default 60 months
    }
    this.calculate();
  }

  // Deposit value at the end of a period (years for FD, months for RD)
  private valueAt(period: number) {
    if (this.mode === 'FD') {
      // Standard FD typically compounds quarterly
      const res = this.calculator.calculateCompoundInterest(this.amount, this.rate, period, 4);
      return { investedAmount: res.principal, estimatedReturns: res.interest, totalValue: res.totalValue };
    }
    // Banks compound RD interest quarterly on each monthly installment
    return this.calculator.calculateRecurringDeposit(this.amount, this.rate, period);
  }

  calculate() {
    this.results = this.valueAt(this.tenure);
    this.parts = [
      { label: 'Deposited', value: this.results.investedAmount, color: INVESTED_COLOR },
      { label: 'Interest', value: this.results.estimatedReturns, color: RETURNS_COLOR, textColor: RETURNS_TEXT }
    ];
    this.effectiveYield = ((Math.pow(1 + this.rate / 400, 4) - 1) * 100).toFixed(2);
    this.interestShare = Math.round((this.results.estimatedReturns / this.results.investedAmount) * 100);

    // One bar per year; an RD that doesn't end on a full year gets a final bar for its last month
    const points: GrowthPoint[] = [];
    const add = (period: number, label: string) => {
      const r = this.valueAt(period);
      points.push({ label, invested: r.investedAmount, value: r.totalValue });
    };
    if (this.mode === 'FD') {
      for (let y = 1; y <= this.tenure; y++) add(y, `Yr ${y}`);
    } else {
      for (let m = 12; m <= this.tenure; m += 12) add(m, `Yr ${m / 12}`);
      if (this.tenure % 12 !== 0) add(this.tenure, `${this.tenure} mo`);
    }
    ({ labels: this.chartLabels, series: this.chartSeries } = growthChart(points, 'Deposited', 'Interest'));
  }
}
