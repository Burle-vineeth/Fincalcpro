import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'emi', 
    loadComponent: () => import('./calculators/emi/emi.component').then(m => m.EmiComponent)
  },
  { 
    path: 'prepayment', 
    loadComponent: () => import('./calculators/prepayment/prepayment.component').then(m => m.PrepaymentComponent)
  },
  { 
    path: 'affordability', 
    loadComponent: () => import('./calculators/affordability/affordability.component').then(m => m.AffordabilityComponent)
  },
  {
    path: 'sip',
    loadComponent: () => import('./calculators/sip/sip.component').then(m => m.SipComponent)
  },
  {
    path: 'lumpsum',
    loadComponent: () => import('./calculators/lumpsum/lumpsum.component').then(m => m.LumpsumComponent)
  },
  {
    path: 'cagr',
    loadComponent: () => import('./calculators/cagr/cagr.component').then(m => m.CagrComponent)
  },
  {
    path: 'compound-interest',
    loadComponent: () => import('./calculators/compound-interest/compound-interest.component').then(m => m.CompoundInterestComponent)
  },
  {
    path: 'fd-rd',
    loadComponent: () => import('./calculators/fd-rd/fd-rd.component').then(m => m.FdRdComponent)
  },
  {
    path: 'tax',
    loadComponent: () => import('./calculators/tax/tax.component').then(m => m.TaxComponent)
  },
  {
    path: 'take-home',
    loadComponent: () => import('./calculators/take-home/take-home.component').then(m => m.TakeHomeComponent)
  },
  {
    path: 'inflation',
    loadComponent: () => import('./calculators/inflation/inflation.component').then(m => m.InflationComponent)
  },
  {
    path: 'retirement',
    loadComponent: () => import('./calculators/retirement/retirement.component').then(m => m.RetirementComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
