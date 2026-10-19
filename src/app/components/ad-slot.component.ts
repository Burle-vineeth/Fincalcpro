import { Component, Input, OnChanges, SimpleChanges, afterNextRender, isDevMode, signal } from '@angular/core';
import { AdsService } from '../services/ads.service';
import { ADSENSE_CLIENT, ADS_ENABLED, AD_SLOTS, AdPlacement } from '../shared/ads.config';

// Reserved size per placement, so the page doesn't jump when an ad loads
const BOX: Record<AdPlacement, string> = {
  top: 'w-[320px] h-[50px] md:w-[728px] md:h-[90px]',
  sidebar: 'w-[300px] h-[600px]',
  inContent: 'w-full min-h-[250px]'
};

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  host: { '[class.hidden]': '!enabled && !showPlaceholder' },
  template: `
    @if (enabled || showPlaceholder) {
      <div class="flex flex-col items-center" role="complementary" aria-label="Advertisement">
        <p class="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Advertisement</p>
        <div [class]="box + ' overflow-hidden'">
          @if (enabled) {
            <!-- Added only in the browser, after hydration, so AdSense never touches server-rendered markup -->
            @if (ready()) {
              <ins class="adsbygoogle"
                   style="display:block"
                   [style.width.%]="100"
                   [style.height.%]="placement === 'inContent' ? null : 100"
                   [attr.data-ad-client]="client"
                   [attr.data-ad-slot]="slot"
                   [attr.data-ad-format]="placement === 'inContent' ? 'auto' : null"
                   [attr.data-full-width-responsive]="placement === 'inContent' ? 'true' : null"></ins>
            }
          } @else {
            <div class="w-full h-full min-h-[inherit] bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
              Ad: {{ placement }}
            </div>
          }
        </div>
      </div>
    }
  `
})
export class AdSlotComponent implements OnChanges {
  @Input({ required: true }) placement!: AdPlacement;
  // Change this to replace the ad with a fresh one (e.g. on page change for ads outside the routed page)
  @Input() refreshKey: unknown;

  readonly enabled = ADS_ENABLED;
  // Grey boxes mark ad positions during development, until a publisher ID is set
  readonly showPlaceholder = !ADS_ENABLED && isDevMode();
  readonly client = ADSENSE_CLIENT;
  readonly ready = signal(false);

  constructor(private ads: AdsService) {
    afterNextRender(() => this.show());
  }

  ngOnChanges(changes: SimpleChanges) {
    const refresh = changes['refreshKey'];
    if (!refresh || refresh.firstChange || !this.ready()) return;
    // Remove the filled <ins>, then add a new one for AdSense to fill
    this.ready.set(false);
    setTimeout(() => this.show());
  }

  private show() {
    if (!this.enabled) return;
    this.ready.set(true);
    // Fill once the <ins> element is in the DOM
    setTimeout(() => this.ads.fill());
  }

  get box() { return BOX[this.placement]; }
  get slot() { return AD_SLOTS[this.placement]; }
}
