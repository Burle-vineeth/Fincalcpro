import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderInputComponent } from '../../components/slider-input.component';
import { ResultCardComponent } from '../../components/result-card.component';
import { SplitSummaryComponent, SplitPart } from '../../components/split-summary.component';
import { InsightComponent } from '../../components/insight.component';
import { CountUpComponent } from '../../components/count-up.component';
import { CalculatorEngineService } from '../../services/calculator-engine.service';
import { SeoService } from '../../services/seo.service';
import { formatIndian } from '../../shared/format';
import { AdSlotComponent } from '../../components/ad-slot.component';

@Component({
  selector: 'app-take-home',
  standalone: true,
  imports: [AdSlotComponent, CommonModule, SliderInputComponent, ResultCardComponent, SplitSummaryComponent, InsightComponent, CountUpComponent],
  template: `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Input Section -->
      <div class="w-full lg:w-1/2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-1">Salary Take-home Calculator</h2>
        <p class="text-sm text-slate-500 mb-6">Find your monthly in-hand pay after income tax (new regime, FY 2026-27) and deductions.</p>

        <app-slider-input
          label="Annual CTC"
          [min]="300000" [max]="50000000" [step]="10000"
          [value]="salary"
          (valueChange)="salary = $event; calculate()"
          prefix="₹"
        ></app-slider-input>

        <app-slider-input
          label="Annual Deductions"
          hint="PF, insurance and other amounts cut from your pay"
          [min]="0" [max]="2000000" [step]="1000"
          [value]="deductions"
          (valueChange)="deductions = $event; calculate()"
          prefix="₹"
        ></app-slider-input>
      </div>

      <!-- Result Section -->
      <div class="w-full lg:w-1/2">
        <app-result-card title="Pay Summary">
          <div>
            <p class="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Monthly In-Hand Salary</p>
            <p class="text-4xl sm:text-5xl font-bold text-green-600"><app-count-up [value]="netMonthly" prefix="₹" /></p>
            <p class="text-sm text-slate-500 mt-1">₹{{ fmt(Math.round(netMonthly * 12)) }} a year</p>
          </div>

          <app-split-summary [parts]="parts" totalLabel="Annual CTC" centerLabel="CTC"></app-split-summary>

          <app-insight tone="green">
            You take home <strong>{{ inHandShare }}%</strong> of your CTC.
            @if (tax > 0) {
              Income tax is <strong>₹{{ fmt(Math.round(tax / 12)) }}</strong> a month.
            } @else {
              Your salary is within the tax-free limit, so there is no income tax.
            }
          </app-insight>
        </app-result-card>
      </div>
    </div>

    <!-- In-content ad, after the results and before the FAQ -->
    <app-ad-slot placement="inContent" class="block mt-12" />

    <!-- SEO FAQ Section -->
    <div class="mt-12 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-xl font-bold text-slate-800 mb-4">How is in-hand salary calculated?</h3>
      <p class="text-slate-600 text-sm leading-relaxed">
        In-hand salary is your CTC minus income tax and deductions such as your provident fund (PF) contribution and insurance premiums, divided by 12. Tax here follows the new regime, the default for FY 2026-27: with the ₹75,000 standard deduction and the Section 87A rebate, a salary up to ₹12.75 lakh pays no income tax.
      </p>
    </div>
  `
})
export class TakeHomeComponent implements OnInit {
  salary = 1200000;
  deductions = 50000;

  tax = 0;
  netMonthly = 0;
  inHandShare = 0;
  parts: SplitPart[] = [];

  readonly fmt = formatIndian;
  readonly Math = Math;

  constructor(
    private calculator: CalculatorEngineService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.updateSeoTags(
      'Salary Take-home Calculator',
      'Calculate your in-hand net monthly salary after standard deductions and income tax estimation.',
      'Take home salary calculator, net pay calculator, in-hand salary'
    );
    this.calculate();
  }

  calculate() {
    // Employee PF and insurance aren't deductible under the new regime, so tax is on the full salary.
    this.tax = this.calculator.calculateIncomeTax(this.salary, 'new').totalTax;
    const deductions = Math.min(this.deductions, Math.max(0, this.salary - this.tax));
    const netAnnual = this.salary - this.tax - deductions;
    this.netMonthly = netAnnual / 12;
    this.inHandShare = Math.round((netAnnual / this.salary) * 100);
    this.parts = [
      { label: 'In-hand Pay', value: netAnnual, color: '#10b981', textColor: '#059669' },
      { label: 'Income Tax', value: this.tax, color: '#f97316', textColor: '#ea580c' },
      { label: 'Deductions', value: deductions, color: '#94a3b8' }
    ];
  }
}
