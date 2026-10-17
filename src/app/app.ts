import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CALCULATORS } from './shared/calculators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  title = 'calculators';
  
  calculators = CALCULATORS;

  isMenuOpen = signal<boolean>(false);
  activeCalcName = signal<string>(this.getInitialCalcName());
  
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      // @ts-ignore
      if (event instanceof NavigationEnd || event?.type === 1 || event?.constructor?.name === 'NavigationEnd') {
        const url = (event as any).urlAfterRedirects;
        this.autoDetectRoute(url);
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
