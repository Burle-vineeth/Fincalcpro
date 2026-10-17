import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { formatCompact, formatIndian } from '../shared/format';

let nextId = 0;

// Range position resolution for log-scale sliders
const LOG_STEPS = 1000;

@Component({
  selector: 'app-slider-input',
  standalone: true,
  template: `
    <div [class]="showSlider ? 'mb-6' : 'mb-4'">
      <div class="flex justify-between items-center gap-3" [class.mb-2]="showSlider">
        <div class="min-w-0">
          <label [for]="id" class="block text-sm font-medium text-slate-700 leading-snug">{{label}}</label>
          @if (hint) {
            <p class="text-xs text-slate-400 mt-0.5">{{hint}}</p>
          }
          <ng-content select="[labelExtra]"></ng-content>
        </div>
        <div class="flex items-center shrink-0 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
          @if (prefix) {
            <span class="text-slate-500 mr-1 text-sm">{{prefix}}</span>
          }
          <input
            #numberInput
            [id]="id"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            [value]="focused ? rawText : formatIndian(value)"
            (focus)="onFocus(numberInput)"
            (input)="onTyped(numberInput.value)"
            (blur)="commitTyped(numberInput)"
            (keydown.enter)="numberInput.blur()"
            class="bg-transparent text-slate-800 font-semibold w-28 sm:w-32 text-right outline-none"
          >
          @if (suffix) {
            <span class="text-slate-500 ml-1 text-sm whitespace-nowrap">{{suffix}}</span>
          }
        </div>
      </div>
      @if (showSlider) {
      <input
        type="range"
        [min]="isLog ? 0 : min"
        [max]="isLog ? LOG_STEPS : max"
        [step]="isLog ? 1 : step"
        [value]="isLog ? toPosition(value) : value"
        (input)="onSlide(slider.valueAsNumber)"
        #slider
        [attr.aria-label]="label"
        [attr.aria-valuetext]="prefix + formatIndian(value) + (suffix ? ' ' + suffix : '')"
        [style.background]="'linear-gradient(to right, #2563eb ' + getPercentage() + '%, #e2e8f0 ' + getPercentage() + '%)'"
        class="w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider"
      >
      <div class="flex justify-between text-xs text-slate-400 mt-2 font-medium">
        <span>{{ caption(min) }}</span>
        <span>{{ caption(max) }}</span>
      </div>
      }
    </div>
  `,
  styles: [`
    .custom-slider {
      -webkit-appearance: none;
    }
    .custom-slider::-webkit-slider-runnable-track {
      -webkit-appearance: none;
      height: 8px;
    }
    .custom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #ffffff;
      border: 3px solid #2563eb;
      border-radius: 50%;
      cursor: pointer;
      margin-top: -6px; /* center thumb on 8px track */
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
    }
    .custom-slider::-webkit-slider-thumb:hover {
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
      transform: scale(1.1);
    }
    .custom-slider::-webkit-slider-thumb:active {
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.25);
    }
    .custom-slider:focus-visible {
      outline: 2px solid #93c5fd;
      outline-offset: 4px;
    }

    .custom-slider::-moz-range-track {
      height: 8px;
      border: none;
      background: transparent;
    }
    .custom-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: #ffffff;
      border: 3px solid #2563eb;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
    }
    .custom-slider::-moz-range-thumb:hover {
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
      transform: scale(1.1);
    }
    .custom-slider::-moz-range-thumb:active {
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.25);
    }
  `]
})
export class SliderInputComponent implements OnChanges {
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  // 'auto' uses a log scale for wide ranges (e.g. ₹10K–₹1Cr) so typical values
  // aren't squeezed into the first few pixels of the track.
  @Input() scale: 'auto' | 'linear' | 'log' = 'auto';
  // false renders just the labelled number field, for compact forms
  @Input() showSlider = true;

  @Output() valueChange = new EventEmitter<number>();

  readonly id = `slider-input-${nextId++}`;
  readonly LOG_STEPS = LOG_STEPS;
  readonly formatIndian = formatIndian;

  isLog = false;
  focused = false;
  rawText = '';

  ngOnChanges() {
    this.isLog = this.scale === 'log' || (this.scale === 'auto' && this.min > 0 && this.max / this.min >= 100);
  }

  onSlide(position: number) {
    const val = this.isLog ? this.fromPosition(position) : position;
    this.setValue(this.clamp(val));
  }

  onFocus(input: HTMLInputElement) {
    this.focused = true;
    this.rawText = String(this.value);
    input.value = this.rawText;
    input.select();
  }

  // While typing, only push values that are already in range, so typing
  // "5" on the way to "50000" isn't immediately clamped to the minimum.
  onTyped(text: string) {
    this.rawText = text;
    const val = this.parse(text);
    if (val === null || val < this.min || val > this.max) return;
    this.setValue(val);
  }

  // On blur/Enter, clamp whatever was typed and show the formatted value.
  commitTyped(input: HTMLInputElement) {
    const typed = this.parse(input.value);
    this.focused = false;
    this.setValue(this.clamp(typed ?? this.value));
    input.value = formatIndian(this.value);
  }

  getPercentage(): number {
    if (this.isLog) return (this.toPosition(this.value) / LOG_STEPS) * 100;
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value - this.min) / range) * 100;
  }

  caption(val: number): string {
    let unit = this.suffix;
    if (val === 1 && unit.endsWith('s')) unit = unit.slice(0, -1); // "1 year", not "1 years"
    const sep = unit && unit !== '%' ? ' ' : '';
    return `${this.prefix}${formatCompact(val)}${sep}${unit}`;
  }

  toPosition(val: number): number {
    const ratio = Math.log(Math.max(val, this.min) / this.min) / Math.log(this.max / this.min);
    return Math.round(ratio * LOG_STEPS);
  }

  private fromPosition(position: number): number {
    if (position <= 0) return this.min;
    if (position >= LOG_STEPS) return this.max;
    const raw = this.min * Math.pow(this.max / this.min, position / LOG_STEPS);
    // Snap to a round number about two significant digits wide (e.g. 15,00,000 not 14,87,312)
    const niceStep = Math.max(this.step, Math.pow(10, Math.floor(Math.log10(raw)) - 1));
    return Math.round(raw / niceStep) * niceStep;
  }

  private parse(text: string): number | null {
    const cleaned = text.replace(/[,\s₹%]/g, '');
    if (cleaned === '') return null;
    const val = Number(cleaned);
    return isNaN(val) ? null : val;
  }

  private clamp(val: number): number {
    return Math.min(this.max, Math.max(this.min, val));
  }

  private setValue(val: number) {
    if (val === this.value) return;
    this.value = val;
    this.valueChange.emit(val);
  }
}
