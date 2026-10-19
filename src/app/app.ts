import { Component, isDevMode, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CALCULATORS } from './shared/calculators';
import { AdSlotComponent } from './components/ad-slot.component';
import { AdsService } from './services/ads.service';
import { ADS_ENABLED } from './shared/ads.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AdSlotComponent],
  templateUrl: './app.html',
})
export class App {
  title = 'calculators';
  
  calculators = CALCULATORS;

  isMenuOpen = signal<boolean>(false);
  activeCalcName = signal<string>(this.getInitialCalcName());

  // Ad areas are shown once AdSense is configured (or as placeholders in development)
  readonly showAds = ADS_ENABLED || isDevMode();
  // Bumped on every page change to refresh the header and sidebar ads
  navCount = signal(0);
  private firstNavDone = false;
  
  constructor(private router: Router, ads: AdsService) {
    ads.addVerificationTag();
    this.router.events.subscribe(event => {
      // @ts-ignore
      if (event instanceof NavigationEnd || event?.type === 1 || event?.constructor?.name === 'NavigationEnd') {
        const url = (event as any).urlAfterRedirects;
        this.autoDetectRoute(url);
        // The first navigation is the initial page load, whose ads are already in place
        if (this.firstNavDone) this.navCount.update(n => n + 1);
        this.firstNavDone = true;
      }
    });
  }

  getInitialCalcName(): string {
    let url = '';
    if (typeof window !== 'undefined') {
      url = window.location.pathname;
    }
    
    if (!url || url === '/') return 'EMI Calculator';
    
    for (const c of this.calculators) {
      if (this.pathOf(url) === c.route) return c.name;
    }
    
    return 'Calculators';
  }

  // Path without query string or fragment, e.g. "/emi?x=1" -> "/emi"
  pathOf(url: string): string {
    return url.split(/[?#]/)[0];
  }

  autoDetectRoute(url: string) {
    if (!url) return;
    for (const c of this.calculators) {
      if (this.pathOf(url) === c.route) {
        this.activeCalcName.set(c.name);
        return;
      }
    }
    this.activeCalcName.set(url === '/' || url === '' ? 'EMI Calculator' : 'Calculators');
  }

  selectCalc(name: string) {
    this.activeCalcName.set(name);
    this.isMenuOpen.set(false);
  }
  
  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
  
  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
