import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';
import { formatCompact, formatIndian } from '../shared/format';

// One data series for multi-series charts (e.g. stacked bars plus a line)
export interface ChartSeries {
  label: string;
  data: number[];
  color: string;
  type?: 'bar' | 'line';
  axis?: 'left' | 'right';
}

const FONT = { family: "'Inter', sans-serif" };

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  template: `
    <div class="relative w-full h-full flex items-center justify-center" [style.min-height.px]="minHeight">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class ChartWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() type: keyof ChartTypeRegistry = 'pie';
  @Input() labels: string[] = [];
  // Single-series charts (pie, doughnut, simple bar): one value and colour per label
  @Input() data: number[] = [];
  @Input() colors: string[] = ['#3b82f6', '#cbd5e1', '#10b981'];
  // Multi-series charts: when set, used instead of data/colors
  @Input() series: ChartSeries[] | null = null;
  @Input() stacked = false;
  @Input() showLegend = true;
  @Input() minHeight = 250;

  private chartInstance: Chart | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.chartInstance || !this.isBrowser) return;
    if (this.series && changes['series']) {
      // Same series, new numbers: update in place so bars animate to their new height
      if (this.series.length !== this.chartInstance.data.datasets.length) {
        this.createChart();
        return;
      }
      this.chartInstance.data.labels = this.labels;
      this.series.forEach((s, i) => {
        const ds = this.chartInstance!.data.datasets[i] as any;
        ds.data = s.data;
        ds.label = s.label;
        ds.backgroundColor = s.color;
        ds.borderColor = s.color;
      });
      this.chartInstance.update();
    } else if (changes['data'] || changes['labels'] || changes['colors']) {
      this.chartInstance.data.labels = this.labels;
      this.chartInstance.data.datasets[0].data = this.data;
      this.chartInstance.data.datasets[0].backgroundColor = this.colors;
      this.chartInstance.update();
    }
  }

  ngOnDestroy() {
    this.chartInstance?.destroy();
  }

  private createChart() {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const multi = !!this.series;
    const rupeeTicks = { callback: (v: number) => '₹' + formatCompact(v), font: FONT };

    const config: ChartConfiguration = {
      type: this.type as any,
      data: {
        labels: this.labels,
        datasets: multi
          ? this.series!.map(s => ({
              type: s.type ?? 'bar',
              label: s.label,
              data: s.data,
              backgroundColor: s.color,
              borderColor: s.color,
              yAxisID: s.axis === 'right' ? 'y1' : 'y',
              ...(s.type === 'line'
                ? { borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.3, order: 0 }
                : { borderRadius: 3, maxBarThickness: 36, order: 1 })
            })) as any
          : [{
              data: this.data,
              backgroundColor: this.colors,
              borderWidth: 0,
              hoverOffset: 4
            }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: multi ? { mode: 'index', intersect: false } : undefined,
        plugins: {
          legend: {
            // A single bar series needs no legend; the card title says what it is
            display: this.showLegend && (multi ? this.series!.length > 1 : this.type !== 'bar'),
            position: 'bottom',
            // Keep the order the series were given in (dataset `order` only controls drawing)
            labels: { usePointStyle: true, padding: 20, font: FONT, sort: (a, b) => (a.datasetIndex ?? 0) - (b.datasetIndex ?? 0) }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleFont: { size: 14, ...FONT },
            bodyFont: { size: 14, ...FONT },
            itemSort: (a, b) => a.datasetIndex - b.datasetIndex,
            callbacks: {
              label: (item) => ` ${multi ? item.dataset.label : item.label}: ₹${formatIndian(Math.round(item.raw as number))}`
            }
          }
        }
      }
    };

    if (this.type === 'bar') {
      const scales: any = {
        // Long ranges (e.g. 30 years) skip labels instead of tilting them
        x: { stacked: this.stacked, grid: { display: false }, ticks: { font: FONT, autoSkip: true, maxRotation: 0 } },
        y: { stacked: this.stacked, beginAtZero: true, ticks: rupeeTicks }
      };
      if (this.series?.some(s => s.axis === 'right')) {
        scales.y1 = { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, ticks: rupeeTicks };
      }
      (config.options as any).scales = scales;
      if (!multi) {
        (config.data.datasets[0] as any).borderRadius = 6;
        (config.data.datasets[0] as any).maxBarThickness = 80;
      }
    }

    if (this.type === 'doughnut') {
      (config.options as any).cutout = '75%';
    }

    this.chartInstance = new Chart(ctx, config);
  }
}
