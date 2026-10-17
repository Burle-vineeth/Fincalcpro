import { Pipe, PipeTransform } from '@angular/core';

const indianNumber = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function formatIndian(val: number): string {
  return indianNumber.format(val);
}

// Short form for slider captions: 10K, 3L, 1Cr
export function formatCompact(val: number): string {
  if (val >= 10000000) return parseFloat((val / 10000000).toFixed(2)) + 'Cr';
  if (val >= 100000) return parseFloat((val / 100000).toFixed(2)) + 'L';
  if (val >= 1000) return parseFloat((val / 1000).toFixed(2)) + 'K';
  return val.toString();
}

// Short rupee amount for tight spaces like a chart centre: ₹1.04 Cr, ₹4.5 L, ₹12,399
export function formatShortInr(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 10000000) return `₹${parseFloat((val / 10000000).toFixed(2))} Cr`;
  if (abs >= 100000) return `₹${parseFloat((val / 100000).toFixed(2))} L`;
  return `₹${formatIndian(Math.round(val))}`;
}

// Readable amount in words for large results: "1.41 Lakh", "8.62 Crore".
// Empty below one lakh, where the digits are already easy to read.
@Pipe({ name: 'inWords', standalone: true })
export class InWordsPipe implements PipeTransform {
  transform(val: number | null | undefined): string {
    if (val == null || !isFinite(val)) return '';
    const abs = Math.abs(val);
    if (abs >= 10000000) return `${parseFloat((val / 10000000).toFixed(2))} Crore`;
    if (abs >= 100000) return `${parseFloat((val / 100000).toFixed(2))} Lakh`;
    return '';
  }
}
