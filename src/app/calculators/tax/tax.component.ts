import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { SegmentedControlComponent } from '../../components/segmented-control.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { InsightComponent } from '../../components/insight.component';
import { CountUpComponent } from '../../components/count-up.component';
import { CalculatorEngineService, IncomeTaxBreakdown, TaxRegime } from '../../services/calculator-engine.service';
import { formatIndian, formatCompact } from '../../shared/format';
import { AdSlotComponent } from '../../components/ad-slot.component';
import { FaqComponent } from '../../components/faq.component';

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [AdSlotComponent, FaqComponent, CommonModule, SliderInputComponent, ResultCardComponent, SegmentedControlComponent, SplitSummaryComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Income Tax Calculator</h1>
        <p class="text-sm text-slate-500 mb-6">FY 2026-27 rules for resident salaried individuals below 60.</p>

        <app-segmented-control
          label="Tax Regime"
          [options]="[{ value: 'new', label: 'New Regime' }, { value: 'old', label: 'Old Regime' }]"
          [value]="regime"
          (valueChange)="setRegime($event)"
        ></app-segmented-control>

        <app-slider-input
          label="Annual Gross Salary"
          [min]="300000" [max]="50000000" [step]="10000"
          [value]="salary"
          (valueChange)="salary = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        @if (regime === 'old') {
          <app-slider-input
            label="Deductions"
            hint="80C, 80D, HRA, home loan interest etc."
            [min]="0" [max]="1000000" [step]="5000"
            [value]="deductions"
            (valueChange)="deductions = $event; calculate()"
            prefix="₹"
          ></app-slider-input>
        }
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Tax Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Total Tax Payable</p>
            <p class="text-4xl sm:text-5xl font-bold text-orange-600"><app-count-up [value]="result.totalTax" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">
              <app-count-up [value]="result.effectiveRate" [decimals]="1" suffix="%" /> of your salary · ₹{{ fmt(Math.round(result.totalTax / 12)) }} a month
            </p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Gross Salary" centerLabel="Salary"></app-split-summary>

          <app-insight tone="blue">
            @if (Math.round(savingVsOther) > 0) {
              The <strong>{{ regime }} regime</strong> saves you <strong>₹{{ fmt(Math.round(savingVsOther)) }}</strong> compared with the {{ otherRegime }} regime{{ deductionNote }}.
            } @else if (Math.round(savingVsOther) < 0) {
              The <strong>{{ otherRegime }} regime</strong> would save you <strong>₹{{ fmt(Math.round(-savingVsOther)) }}</strong>{{ deductionNote }}.
              <button type="button" (click)="setRegime(otherRegime)" class="font-semibold text-blue-700 underline underline-offset-2">Switch</button>
            } @else {
              Both regimes cost the same here{{ deductionNote }}.
            }
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <!-- Step-by-step calculation -->
    <div class="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h3 class="text-lg font-bold text-slate-800">How Your Tax is Calculated</h3>
      <p class="text-sm text-slate-500 mb-4">{{ regime === 'new' ? 'New' : 'Old' }} regime, step by step.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <dl class="text-sm divide-y divide-slate-100">
          <div class="flex justify-between py-2"><dt class="text-slate-500">Gross salary</dt><dd class="font-semibold text-slate-800">₹{{ fmt(salary) }}</dd></div>
          <div class="flex justify-between py-2"><dt class="text-slate-500">− Standard deduction</dt><dd class="font-semibold text-slate-800">₹{{ fmt(result.standardDeduction) }}</dd></div>
          @if (regime === 'old') {
            <div class="flex justify-between py-2"><dt class="text-slate-500">− Other deductions</dt><dd class="font-semibold text-slate-800">₹{{ fmt(result.deductions) }}</dd></div>
          }
          <div class="flex justify-between py-2"><dt class="font-semibold text-slate-700">= Taxable income</dt><dd class="font-bold text-slate-900">₹{{ fmt(result.taxableIncome) }}</dd></div>
          <div class="flex justify-between py-2"><dt class="text-slate-500">Tax on slabs</dt><dd class="font-semibold text-slate-800">₹{{ fmt(Math.round(result.slabTax)) }}</dd></div>
          @if (result.rebate > 0) {
            <div class="flex justify-between py-2"><dt class="text-slate-500">− Rebate u/s 87A</dt><dd class="font-semibold text-green-600">₹{{ fmt(Math.round(result.rebate)) }}</dd></div>
          }
          @if (result.surcharge > 0) {
            <div class="flex justify-between py-2"><dt class="text-slate-500">+ Surcharge</dt><dd class="font-semibold text-slate-800">₹{{ fmt(Math.round(result.surcharge)) }}</dd></div>
          }
          <div class="flex justify-between py-2"><dt class="text-slate-500">+ Health &amp; education cess (4%)</dt><dd class="font-semibold text-slate-800">₹{{ fmt(Math.round(result.cess)) }}</dd></div>
          <div class="flex justify-between py-2"><dt class="font-semibold text-slate-700">= Total tax</dt><dd class="font-bold text-orange-600">₹{{ fmt(Math.round(result.totalTax)) }}</dd></div>
        </dl>

        <div class="overflow-x-auto">
          <table class="w-full text-sm whitespace-nowrap">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-3 py-2 text-left font-semibold">Income slab</th>
                <th scope="col" class="px-3 py-2 text-right font-semibold">Rate</th>
                <th scope="col" class="px-3 py-2 text-right font-semibold">Tax</th>
              </tr>
            </thead>
            <tbody>
              @for (slab of result.slabs; track slab.from) {
                <tr class="border-b border-slate-50">
                  <td class="px-3 py-2 text-slate-600">{{ slabLabel(slab.from, slab.upTo) }}</td>
                  <td class="px-3 py-2 text-right text-slate-600">{{ slab.rate * 100 }}%</td>
                  <td class="px-3 py-2 text-right font-semibold text-slate-800">₹{{ fmt(Math.round(slab.tax)) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- FAQs (text lives in shared/seo-content.ts) -->
    <app-faq page="/tax" />
  `
})
export class TaxComponent implements OnInit {
  salary = 1500000;
  regime: TaxRegime = 'new';
  deductions = 150000;
  result!: IncomeTaxBreakdown; // set by calculate() in the constructor
  parts: SplitPart[] = [];
  savingVsOther = 0;

  readonly fmt = formatIndian;
  readonly Math = Math;

  constructor(
    private calculator: CalculatorEngineService
  ) {
    // Calculate up front so the template always has a result, even when the view
    // is rendered before ngOnInit (e.g. when the dev server hot-swaps components).
    this.calculate();
  }

  get otherRegime(): TaxRegime {
    return this.regime === 'new' ? 'old' : 'new';
  }

  // The comparison depends on old-regime deductions, so say which amount it assumes
  get deductionNote(): string {
    return ` (with ₹${formatIndian(this.deductions)} of old-regime deductions)`;
  }

  ngOnInit() {
  }

  setRegime(regime: TaxRegime) {
    this.regime = regime;
    this.calculate();
  }

  slabLabel(from: number, upTo: number): string {
    const f = (v: number) => '₹' + formatCompact(v);
    return upTo === Infinity ? `Above ${f(from)}` : `${f(from)} – ${f(upTo)}`;
  }

  calculate() {
    this.result = this.calculator.calculateIncomeTax(this.salary, this.regime, this.deductions);
    const other = this.calculator.calculateIncomeTax(this.salary, this.otherRegime, this.deductions);
    this.savingVsOther = other.totalTax - this.result.totalTax;
    this.parts = [
      { label: 'Income after Tax', value: this.salary - this.result.totalTax, color: '#10b981', textColor: '#059669' },
      { label: 'Income Tax', value: this.result.totalTax, color: '#f97316', textColor: '#ea580c' }
    ];
  }
}
