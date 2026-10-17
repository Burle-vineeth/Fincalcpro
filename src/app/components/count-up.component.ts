import { Component, Input, OnChanges, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const formatters = new Map<number, Intl.NumberFormat>();
function format(val: number, decimals: number): string {
  let f = formatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    formatters.set(decimals, f);
  }
  return f.format(val);
}

// Shows a number that counts from its previous value to the new one when it
// changes. The first value is shown as-is, so server-rendered pages don't
// flicker and match the client on hydration.
@Component({
  selector: 'app-count-up',
  standalone: true,
  template: `{{ prefix }}{{ display() }}{{ suffix }}`,
  host: { class: 'tabular-nums' }
})
export class CountUpComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) value = 0;
  @Input() decimals = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() duration = 600; // ms

  readonly display = signal('');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private shown: number | null = null;
  private frame = 0;

  ngOnChanges() {
    const target = Number.isFinite(this.value) ? this.value : 0;
    if (this.isBrowser) cancelAnimationFrame(this.frame);

    if (this.shown === null || !this.isBrowser || this.duration <= 0 || prefersReducedMotion()) {
      this.show(target);
      return;
    }

    // Start from whatever is on screen, so fast slider drags glide instead of restarting
    const from = this.shown;
    const start = performance.now();
    // Read the clock here rather than using the rAF timestamp, which can be
    // slightly earlier than start and would briefly push the number backwards.
    const step = () => {
      const progress = Math.min(1, Math.max(0, (performance.now() - start) / this.duration));
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      this.show(progress < 1 ? from + (target - from) * eased : target);
      if (progress < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  ngOnDestroy() {
    if (this.isBrowser) cancelAnimationFrame(this.frame);
  }

  private show(val: number) {
    this.shown = val;
    this.display.set(format(val, this.decimals));
  }
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
