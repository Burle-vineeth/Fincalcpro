import { TestBed } from '@angular/core/testing';
import { TaxComponent } from './tax.component';

describe('TaxComponent', () => {
  it('has a tax result as soon as it is created, before ngOnInit runs', () => {
    // The dev server's hot reload can render a fresh instance before ngOnInit;
    // the template reads result.totalTax, so it must never be undefined.
    const component = TestBed.createComponent(TaxComponent).componentInstance;
    expect(component.result).toBeDefined();
    expect(Math.round(component.result.totalTax)).toBe(97500); // ₹15L default, new regime
  });

  it('renders without errors', async () => {
    const fixture = TestBed.createComponent(TaxComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Total Tax Payable');
  });
});
