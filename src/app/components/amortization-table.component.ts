import { Component, Input, OnChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SegmentedControlComponent } from './segmented-control.component';

interface ScheduleRow {
  label: string;
  principal: number;
  prepayment: number;
  interest: number;
  emi: number;
  balance: number;
  date?: Date;
}

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe, SegmentedControlComponent],
  template: `
    @if (schedule && schedule.length > 0) {
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-4 sm:px-6 pt-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-x-4 justify-between items-center">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-slate-800">Repayment Schedule</h3>
            <p class="text-xs text-slate-500">{{ schedule.length }} monthly installments</p>
          </div>
          <div class="w-48">
            <app-segmented-control
              [options]="[{ value: 'yearly', label: 'Yearly' }, { value: 'monthly', label: 'Monthly' }]"
              [value]="view"
              (valueChange)="view = $event; buildRows()"
            ></app-segmented-control>
          </div>
        </div>

        <div class="max-h-[440px] overflow-auto">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead class="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0 z-10">
              <tr>
                <th scope="col" class="px-4 sm:px-6 py-3 font-semibold">{{ view === 'yearly' ? 'Year' : 'Month' }}</th>
                <th scope="col" class="px-4 sm:px-6 py-3 font-semibold text-right">Principal</th>
                @if (hasPrepayments) {
                  <th scope="col" class="px-4 sm:px-6 py-3 font-semibold text-right text-purple-600">Prepayment</th>
                }
                <th scope="col" class="px-4 sm:px-6 py-3 font-semibold text-right">Interest</th>
                <th scope="col" class="px-4 sm:px-6 py-3 font-semibold text-right">Total Paid</th>
                <th scope="col" class="px-4 sm:px-6 py-3 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows; track row.label) {
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td class="px-4 sm:px-6 py-3 text-slate-600 font-medium">
                    {{ row.label }}
                    @if (row.date) {
                      <span class="block text-xs text-slate-400 font-normal">{{ row.date | date:'MMM yyyy' }}</span>
                    }
                  </td>
                  <td class="px-4 sm:px-6 py-3 text-emerald-600 font-semibold text-right">₹{{ row.principal | number:'1.0-0' }}</td>
                  @if (hasPrepayments) {
                    <td class="px-4 sm:px-6 py-3 text-purple-600 font-bold text-right">
                      @if (row.prepayment > 0) {
                        ₹{{ row.prepayment | number:'1.0-0' }}
                      } @else {
                        <span class="text-slate-300">–</span>
                      }
                    </td>
                  }
                  <td class="px-4 sm:px-6 py-3 text-orange-500 font-semibold text-right">₹{{ row.interest | number:'1.0-0' }}</td>
                  <td class="px-4 sm:px-6 py-3 text-slate-800 font-bold text-right">₹{{ row.emi | number:'1.0-0' }}</td>
                  <td class="px-4 sm:px-6 py-3 text-blue-700 font-bold text-right">₹{{ row.balance | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class AmortizationTableComponent implements OnChanges {
  @Input() schedule: any[] = [];

  view: 'yearly' | 'monthly' = 'yearly';
  rows: ScheduleRow[] = [];
  hasPrepayments = false;

  ngOnChanges() {
    this.hasPrepayments = this.schedule?.some((row: any) => row.prepayment > 0) ?? false;
    this.buildRows();
  }

  buildRows() {
    const schedule = this.schedule ?? [];
    if (this.view === 'monthly') {
      this.rows = schedule.map(r => ({ ...r, label: String(r.no) }));
      return;
    }

    // One row per loan year (12 installments), balance at the end of that year
    const years: ScheduleRow[] = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const chunk = schedule.slice(i, i + 12);
      const sum = (key: string) => chunk.reduce((s, r) => s + r[key], 0);
      years.push({
        label: `Year ${i / 12 + 1}`,
        principal: sum('principal'),
        prepayment: sum('prepayment'),
        interest: sum('interest'),
        emi: sum('emi'),
        balance: chunk[chunk.length - 1].balance
      });
    }
    this.rows = years;
  }
}
