import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { ChartWrapperComponent } from '../../components/chart-wrapper.component';
import { AmortizationTableComponent } from '../../components/amortization-table.component';
import { CalculatorEngineService, PrepaymentPlan } from '../../services/calculator-engine.service';
import { SeoService } from '../../services/seo.service';
import { CountUpComponent } from '../../components/count-up.component';
import { SegmentedControlComponent } from '../../components/segmented-control.component';
import { InWordsPipe } from '../../shared/format';

@Component({
  selector: 'app-prepayment',
  standalone: true,
  imports: [CommonModule, SliderInputComponent, ResultCardComponent, ChartWrapperComponent, AmortizationTableComponent, SegmentedControlComponent, DecimalPipe, InWordsPipe, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Loan Prepayment Calculator</h2>
        
        <app-slider-input 
          label="Outstanding Principal" 
          [min]="10000" [max]="10000000" [step]="10000" 
          [value]="principal" 
          (valueChange)="principal = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input 
          label="Interest Rate (p.a.)" 
          [min]="1" [max]="30" [step]="0.1" 
          [value]="rate" 
          (valueChange)="rate = $event; calculate()"
          suffix="%"
        ></app-slider-input>

        <app-slider-input 
          label="Remaining Tenure" 
          [min]="12" [max]="360" [step]="1" 
          [value]="tenureMonths" 
          (valueChange)="tenureMonths = $event; calculate()"
          suffix="months"
        ></app-slider-input>

        <app-segmented-control
          label="After prepaying, I want to"
          [options]="[{ value: 'reduceTenure', label: 'Reduce Tenure' }, { value: 'reduceEmi', label: 'Reduce EMI' }]"
          [value]="strategy"
          (valueChange)="setStrategy($event)"
        ></app-segmented-control>
        <p class="text-xs text-slate-500 -mt-4 mb-6">
          {{ strategy === 'reduceTenure'
            ? 'Keep paying the same EMI and close the loan sooner. This saves the most interest.'
            : 'Keep the same end date and pay a smaller EMI from the next month.' }}
        </p>

        <div class="mt-8 mb-4 flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 class="text-sm font-bold text-slate-700">Prepayments</h3>
          <button (click)="addPrepayment()" class="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md font-semibold hover:bg-blue-100 transition-colors">+ Add prepayment</button>
        </div>

        <div class="space-y-4">
          @for (p of prepaymentsList; track p; let idx = $index) {
            <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div class="flex justify-between items-center mb-3">
                <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Prepayment {{ idx + 1 }}</p>
                <button (click)="removePrepayment(idx)" class="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors" [attr.aria-label]="'Remove prepayment ' + (idx + 1)">Remove</button>
              </div>

              <app-segmented-control
                [options]="frequencyOptions"
                [value]="p.frequency"
                (valueChange)="p.frequency = $event; calculate()"
              ></app-segmented-control>

              <app-slider-input
                [label]="p.frequency === 'once' ? 'Amount' : 'Amount each time'"
                [min]="1000" [max]="principal" [step]="1000"
                [value]="p.amount"
                (valueChange)="p.amount = $event; calculate()"
                prefix="₹"
                [showSlider]="false"
              ></app-slider-input>

              <app-slider-input
                [label]="p.frequency === 'once' ? 'Paid after EMI no.' : 'Starting after EMI no.'"
                [hint]="p.month === 0 ? 'Today, before your next EMI' : (emiDate(p.month) | date:'MMMM yyyy') ?? ''"
                [min]="0" [max]="tenureMonths" [step]="1"
                [value]="p.month"
                (valueChange)="p.month = $event; calculate()"
              ></app-slider-input>

              @if (planStatus[idx]; as status) {
                @if (p.frequency !== 'once' || status.applied === 0 || status.closesLoan) {
                  <p class="text-xs rounded-lg px-3 py-2 -mt-2"
                     [class]="status.applied === 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-white/70 text-slate-600 border border-indigo-100'">
                    @if (status.applied === 0) {
                      Your loan is already paid off after EMI {{ schedule.length }}, so this prepayment isn't used.
                    } @else if (p.frequency === 'once') {
                      This payment closes the loan. Only ₹{{ status.total | number:'1.0-0' }} of it is needed.
                    } @else {
                      {{ status.applied }} payment{{ status.applied > 1 ? 's' : '' }} from {{ emiDate(p.month) | date:'MMM yyyy' }}
                      to {{ emiDate(status.lastMonth) | date:'MMM yyyy' }},
                      <strong class="text-slate-800">₹{{ status.total | number:'1.0-0' }}</strong> in total.
                      @if (status.closesLoan) {
                        The last one closes the loan.
                      }
                      @if (status.applied < status.planned) {
                        The remaining {{ status.planned - status.applied }} aren't needed.
                      }
                    }
                  </p>
                }
              }
            </div>
          } @empty {
            <p class="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg">No prepayments yet. Add one to see how much you save.</p>
          }
        </div>

        @if (totalPrepaid > 0) {
          <div class="mt-4 flex justify-between items-center text-sm px-1">
            <span class="text-slate-500">Total prepaid</span>
            <span class="font-bold text-indigo-700"><app-count-up [value]="totalPrepaid" prefix="₹" /></span>
          </div>
        }
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Prepayment Savings">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Total Interest Saved</p>
            <p class="text-4xl font-bold text-green-600"><app-count-up [value]="results.savings" prefix="₹" /></p>
            <p class="text-xs text-slate-400 mt-1">{{ results.savings | inWords }}</p>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-slate-50 py-3 px-1 rounded-xl border border-slate-100">
              <p class="text-xs text-slate-500 font-medium mb-1">EMI</p>
              <p class="text-sm font-bold text-slate-800"><app-count-up [value]="results.newEmi" prefix="₹" /></p>
              @if (results.newEmi < results.originalEmi - 0.5 && results.newEmi > 0) {
                <p class="text-xs text-slate-400 line-through"><app-count-up [value]="results.originalEmi" prefix="₹" /></p>
              }
            </div>
            <div class="bg-slate-50 py-3 px-1 rounded-xl border border-slate-100">
              <p class="text-xs text-slate-500 font-medium mb-1">New Tenure</p>
              <p class="text-sm font-bold text-slate-800">{{ results.newTenure }} months</p>
            </div>
            <div class="bg-slate-50 py-3 px-1 rounded-xl border border-slate-100">
              <p class="text-xs text-slate-500 font-medium mb-1">Time Saved</p>
              <p class="text-sm font-bold text-green-600">{{ results.originalTenure - results.newTenure }} months</p>
            </div>
          </div>

          <div class="mt-2 border-t border-slate-100 pt-6">
            <p class="text-sm font-semibold text-slate-700 mb-2">Total interest payable</p>
            <div class="h-[280px]">
            <app-chart-wrapper
              type="bar"
              [labels]="['Without Prepayment', 'With Prepayment']"
              [data]="chartData"
              [colors]="['#ef4444', '#10b981']"
            ></app-chart-wrapper>
            </div>
          </div>
        </app-result-card>
      </div>
    </div>

    <!-- Amortization Schedule Full Width Block -->
    <div class="w-full mt-8">
      <app-amortization-table [schedule]="schedule"></app-amortization-table>
    </div>

    <!-- SEO FAQ Section -->
    <div class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-xl font-bold text-slate-800 mb-4">What is Loan Prepayment?</h3>
      <p class="text-slate-600 mb-4 text-sm leading-relaxed">
        Loan prepayment allows a borrower to pay off a significant portion of their outstanding principal ahead of schedule. Doing this reduces the outstanding principal amount, which exponentially reduces the total interest paid over the life of the loan.
      </p>
    </div>
  `
})
export class PrepaymentComponent implements OnInit {
  principal = 2000000;
  rate = 8.5;
  tenureMonths = 180;
  prepaymentsList: PrepaymentPlan[] = [
    { month: 12, amount: 200000, frequency: 'once' }
  ];
  strategy: 'reduceTenure' | 'reduceEmi' = 'reduceTenure';

  readonly frequencyOptions = [
    { value: 'once', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];
  readonly startDate = new Date();

  results = { originalEmi: 0, originalTenure: 180, newTenure: 180, newEmi: 0, savings: 0 };
  chartData: number[] = [];
  schedule: any[] = [];
  // Per plan: how many of its payments fall before the loan closes
  planStatus: { planned: number, applied: number, lastMonth: number, total: number, closesLoan: boolean }[] = [];
  totalPrepaid = 0;

  constructor(
    private calculator: CalculatorEngineService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.updateSeoTags(
      'Loan Prepayment Calculator',
      'Calculate interest savings by making a part-prepayment on your home or personal loan. See how much time and money you save.',
      'Loan prepayment calculator, interest saved calculator, part payment calculator'
    );
    this.calculate();
  }

  addPrepayment() {
    const nextMonth = this.prepaymentsList.length > 0 
      ? Math.min(this.prepaymentsList[this.prepaymentsList.length - 1].month + 12, this.tenureMonths) 
      : 12;
    this.prepaymentsList.push({ month: nextMonth, amount: 100000, frequency: 'once' });
    this.calculate();
  }

  removePrepayment(idx: number) {
    this.prepaymentsList.splice(idx, 1);
    this.calculate();
  }

  setStrategy(strat: 'reduceTenure' | 'reduceEmi') {
    this.strategy = strat;
    this.calculate();
  }

  // Calendar month in which EMI number n is paid (EMI 1 is next month)
  emiDate(n: number): Date {
    return new Date(this.startDate.getFullYear(), this.startDate.getMonth() + n, 1);
  }

  calculate() {
    const payments = this.calculator.expandPrepayments(this.prepaymentsList, this.tenureMonths);
    this.results = this.calculator.calculatePrepayment(this.principal, this.rate, this.tenureMonths, payments, this.strategy);

    const origInterest = this.calculator.calculateEmi(this.principal, this.rate, this.tenureMonths).totalInterest;
    this.chartData = [origInterest, origInterest - this.results.savings];

    this.schedule = this.calculator.generateAmortizationSchedule(this.principal, this.rate, this.tenureMonths, this.startDate, payments, this.strategy);
    this.totalPrepaid = this.schedule.reduce((sum, row) => sum + row.prepayment, 0)
      + payments.filter(p => p.month <= 0).reduce((sum, p) => sum + p.amount, 0);
    if (this.schedule.length === 0) this.totalPrepaid = Math.min(this.totalPrepaid, this.principal);

    // A payment after EMI m is used if the loan still has a balance at that point
    const lastEmi = this.schedule.length;
    const isApplied = (m: number) => m === 0 || m < lastEmi || (m === lastEmi && this.schedule[m - 1].prepayment > 0);
    this.planStatus = this.prepaymentsList.map(plan => {
      const months = this.calculator.expandPrepayments([plan], this.tenureMonths).map(p => p.month);
      const applied = months.filter(isApplied);
      const lastMonth = applied[applied.length - 1] ?? plan.month;
      // The payment that clears the loan is capped at the remaining balance
      const closingRow = lastMonth === 0 ? null : this.schedule[lastMonth - 1];
      const closingShare = lastMonth === 0
        ? Math.min(plan.amount, this.principal)
        : Math.min(plan.amount, closingRow?.prepayment ?? plan.amount);
      const closesLoan = applied.length > 0 && (this.schedule.length === 0 || lastMonth === lastEmi) && closingShare < plan.amount;
      const total = applied.length === 0 ? 0 : (applied.length - 1) * plan.amount + (closesLoan ? closingShare : plan.amount);
      return { planned: months.length, applied: applied.length, lastMonth, total, closesLoan };
    });
  }
}
