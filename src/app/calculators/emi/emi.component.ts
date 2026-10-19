import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { ChartSeries } from '../../components/chart-wrapper.component';
import { AmortizationTableComponent } from '../../components/amortization-table.component';
import { SegmentedControlComponent } from '../../components/segmented-control.component';
import { CalculatorEngineService } from '../../services/calculator-engine.service';
import { CountUpComponent } from '../../components/count-up.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { ChartCardComponent } from '../../components/chart-card.component';
import { InsightComponent } from '../../components/insight.component';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

type LoanType = 'home' | 'car' | 'personal';

// Typical starting points; the user can change every value afterwards
const LOAN_PRESETS: Record<LoanType, { principal: number, rate: number, tenure: number }> = {
  home: { principal: 5000000, rate: 8.5, tenure: 240 },
  car: { principal: 800000, rate: 9.5, tenure: 60 },
  personal: { principal: 500000, rate: 12, tenure: 36 }
};

@Component({
  selector: 'app-emi',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, SliderInputComponent, ResultCardComponent, AmortizationTableComponent, SegmentedControlComponent, SplitSummaryComponent, ChartCardComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">EMI Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">Find your monthly installment and the total interest on a loan.</p>

        <app-segmented-control
          label="Loan type"
          [options]="loanTypeOptions"
          [value]="loanType"
          (valueChange)="applyPreset($event)"
        ></app-segmented-control>

        <app-slider-input
          label="Loan Amount"
          [min]="10000" [max]="10000000" [step]="5000"
          [value]="principal"
          (valueChange)="principal = $event; onManualChange()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Interest Rate (p.a.)"
          [min]="1" [max]="30" [step]="0.05"
          [value]="rate"
          (valueChange)="rate = $event; onManualChange()"
          suffix="%"
        ></app-slider-input>

        @if (tenureUnit === 'years') {
          <app-slider-input
            label="Loan Tenure"
            [min]="1" [max]="30" [step]="1"
            [value]="tenure / 12"
            (valueChange)="tenure = $event * 12; onManualChange()"
            suffix="years"
          >
            <div labelExtra><ng-container [ngTemplateOutlet]="unitToggle"></ng-container></div>
          </app-slider-input>
        } @else {
          <app-slider-input
            label="Loan Tenure"
            [min]="6" [max]="360" [step]="1"
            [value]="tenure"
            (valueChange)="tenure = $event; onManualChange()"
            suffix="months"
          >
            <div labelExtra><ng-container [ngTemplateOutlet]="unitToggle"></ng-container></div>
          </app-slider-input>
        }

        <ng-template #unitToggle>
          <div class="inline-flex mt-1.5 bg-slate-100 rounded-md p-0.5 text-xs font-semibold" role="radiogroup" aria-label="Tenure unit">
            @for (unit of ['years', 'months']; track unit) {
              <button type="button" role="radio" [attr.aria-checked]="tenureUnit === unit"
                (click)="setTenureUnit($any(unit))"
                class="px-2 py-0.5 rounded capitalize transition-colors"
                [class]="tenureUnit === unit ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                {{ unit }}
              </button>
            }
          </div>
        </ng-template>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Loan Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Monthly EMI</p>
            <p class="text-4xl sm:text-5xl font-bold text-blue-600"><app-count-up [value]="results.emi" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">for {{ tenureText() }} ({{ tenure }} EMIs)</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Total Amount Payable"></app-split-summary>

          <app-insight>
            For every <strong>₹1</strong> you borrow, you repay <strong>₹{{ (results.totalPayment / principal).toFixed(2) }}</strong>.
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <app-chart-card
      title="Year-wise Breakdown"
      subtitle="How your EMIs split between principal and interest each year, and the balance left at year end."
      [labels]="yearLabels"
      [series]="yearSeries"
      [stacked]="true"
    ></app-chart-card>

    <!-- Amortization Schedule Full Width Block -->
    <div class="w-full mt-8">
      <app-amortization-table [schedule]="schedule"></app-amortization-table>
    </div>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/emi" />
  `
})
export class EmiComponent implements OnInit {
  loanType: LoanType | null = 'home';
  principal = LOAN_PRESETS.home.principal;
  rate = LOAN_PRESETS.home.rate;
  tenure = LOAN_PRESETS.home.tenure; // always in months
  tenureUnit: 'years' | 'months' = 'years';

  readonly loanTypeOptions = [
    { value: 'home', label: 'Home' },
    { value: 'car', label: 'Car' },
    { value: 'personal', label: 'Personal' }
  ];

  results = { emi: 0, totalInterest: 0, totalPayment: 0 };
  parts: SplitPart[] = [];
  schedule: any[] = [];
  yearLabels: string[] = [];
  yearSeries: ChartSeries[] = [];

  constructor(
    private calculator: CalculatorEngineService
  ) {}

  ngOnInit() {
    this.calculate();
  }

  applyPreset(type: LoanType) {
    this.loanType = type;
    Object.assign(this, LOAN_PRESETS[type]);
    this.calculate();
  }

  // Editing any value means the inputs no longer match a preset
  onManualChange() {
    if (this.loanType) {
      const p = LOAN_PRESETS[this.loanType];
      if (p.principal !== this.principal || p.rate !== this.rate || p.tenure !== this.tenure) this.loanType = null;
    }
    this.calculate();
  }

  setTenureUnit(unit: 'years' | 'months') {
    this.tenureUnit = unit;
    if (unit === 'years' && this.tenure % 12 !== 0) {
      this.tenure = Math.max(12, Math.round(this.tenure / 12) * 12);
      this.onManualChange();
    }
  }

  tenureText(): string {
    const years = Math.floor(this.tenure / 12);
    const months = this.tenure % 12;
    const parts = [];
    if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    return parts.join(' ');
  }

  calculate() {
    this.results = this.calculator.calculateEmi(this.principal, this.rate, this.tenure);
    this.parts = [
      { label: 'Principal', value: this.principal, color: '#3b82f6' },
      { label: 'Interest', value: this.results.totalInterest, color: '#f59e0b', textColor: '#ea580c' }
    ];
    this.schedule = this.calculator.generateAmortizationSchedule(this.principal, this.rate, this.tenure, new Date());

    // Totals per loan year (12 EMIs each) for the year-wise chart
    const principalByYear: number[] = [];
    const interestByYear: number[] = [];
    const balanceByYear: number[] = [];
    this.yearLabels = [];
    for (let i = 0; i < this.schedule.length; i += 12) {
      const year = this.schedule.slice(i, i + 12);
      this.yearLabels.push(`Yr ${i / 12 + 1}`);
      principalByYear.push(year.reduce((s, r) => s + r.principal, 0));
      interestByYear.push(year.reduce((s, r) => s + r.interest, 0));
      balanceByYear.push(year[year.length - 1].balance);
    }
    this.yearSeries = [
      { label: 'Principal', data: principalByYear, color: '#3b82f6' },
      { label: 'Interest', data: interestByYear, color: '#f59e0b' },
      { label: 'Balance', data: balanceByYear, color: '#64748b', type: 'line', axis: 'right' }
    ];
  }
}
