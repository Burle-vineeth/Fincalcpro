import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  template: `
    <div class="mb-6">
      @if (label) {
        <p class="text-sm font-medium text-slate-700 mb-2">{{ label }}</p>
      }
      <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200" role="radiogroup" [attr.aria-label]="label || null">
        @for (option of options; track option.value) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="option.value === value"
            (click)="select(option.value)"
            class="flex-1 py-2 px-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
            [class]="option.value === value
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'">
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `
})
export class SegmentedControlComponent {
  @Input() label = '';
  @Input() options: { value: any, label: string }[] = [];
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  select(value: any) {
    if (value === this.value) return;
    this.value = value;
    this.valueChange.emit(value);
  }
}
