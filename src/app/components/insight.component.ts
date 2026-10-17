import { Component, Input } from '@angular/core';

// One-line takeaway under a result, e.g. "For every ₹1 you borrow, you repay ₹2.08."
@Component({
  selector: 'app-insight',
  standalone: true,
  template: `
    <p class="text-sm text-slate-600 rounded-lg px-4 py-3 border"
       [class]="tone === 'green' ? 'bg-green-50 border-green-100' : tone === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'">
      <ng-content></ng-content>
    </p>
  `
})
export class InsightComponent {
  @Input() tone: 'amber' | 'green' | 'blue' = 'amber';
}
