import { TestBed } from '@angular/core/testing';
import { CountUpComponent } from './count-up.component';

describe('CountUpComponent', () => {
  const setup = (value: number, inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(CountUpComponent);
    fixture.componentRef.setInput('value', value);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return fixture;
  };
  const text = (fixture: any) => (fixture.nativeElement as HTMLElement).textContent!.trim();

  it('shows the first value immediately, formatted in Indian style', () => {
    expect(text(setup(1000000, { prefix: '₹' }))).toBe('₹10,00,000');
    expect(text(setup(20.1134, { decimals: 2, suffix: '%' }))).toBe('20.11%');
  });

  it('counts through intermediate values to the new value', async () => {
    const fixture = setup(0, { duration: 200 });
    fixture.componentRef.setInput('value', 100000);
    fixture.detectChanges();

    await new Promise(r => setTimeout(r, 80));
    fixture.detectChanges();
    const midway = Number(text(fixture).replace(/,/g, ''));
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(100000);

    await new Promise(r => setTimeout(r, 250));
    fixture.detectChanges();
    expect(text(fixture)).toBe('1,00,000');
  });

  it('jumps straight to the value when duration is 0', () => {
    const fixture = setup(5, { duration: 0 });
    fixture.componentRef.setInput('value', 12399);
    fixture.detectChanges();
    expect(text(fixture)).toBe('12,399');
  });
});
