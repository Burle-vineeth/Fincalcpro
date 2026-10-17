import { ChartSeries } from '../components/chart-wrapper.component';

export const INVESTED_COLOR = '#3b82f6';
export const RETURNS_COLOR = '#10b981';
export const RETURNS_TEXT = '#059669';

export interface GrowthPoint {
  label: string;
  invested: number;
  value: number;
}

// Stacked "invested + returns" bars for year-wise growth charts
export function growthChart(points: GrowthPoint[], investedLabel = 'Invested', returnsLabel = 'Returns'): { labels: string[], series: ChartSeries[] } {
  return {
    labels: points.map(p => p.label),
    series: [
      { label: investedLabel, data: points.map(p => p.invested), color: INVESTED_COLOR },
      { label: returnsLabel, data: points.map(p => Math.max(0, p.value - p.invested)), color: RETURNS_COLOR }
    ]
  };
}

// Years for money to double at a yearly growth rate (in %)
export function doublingYears(annualRate: number): number {
  return annualRate > 0 ? Math.log(2) / Math.log(1 + annualRate / 100) : Infinity;
}
