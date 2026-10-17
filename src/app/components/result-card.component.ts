import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 class="text-lg font-semibold text-slate-800">{{title}}</h3>
      </div>
      <div class="p-6 flex-grow flex flex-col gap-6">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ResultCardComponent {
  @Input() title: string = 'Results';
}
