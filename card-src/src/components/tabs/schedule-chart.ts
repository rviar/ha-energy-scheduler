import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { chartStyles } from '@/styles';
import type {
  IntegrationConfig,
  ScheduleData,
  HourData,
} from '@/types';
import {
  getToday,
  getTomorrow,
  formatHour,
  formatDateTime,
  resolveActionType,
  getActionBgColor,
} from '@/utils';

Chart.register(...registerables);

type ScheduleMap = ScheduleData['schedule'];
type PvForecast = NonNullable<ScheduleData['pv_forecast']>;

@customElement('es-schedule-chart')
export class EsScheduleChart extends LitElement {
  static styles = chartStyles;

  // All inputs are optional refs from the parent — passing stable `undefined`
  // is preferred over a fresh fallback (`?? []` / `?? {}`) because Lit's
  // identity check would treat each render's new empty as a real change and
  // trigger `chart.update()` mid-hover.
  @property({ attribute: false }) hours: HourData[] = [];
  @property({ attribute: false }) schedule?: ScheduleMap;
  @property({ attribute: false }) pvForecast?: PvForecast;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ type: String }) tz?: string;
  @property({ type: Number }) chartHeight = 250;

  private _chartInstance?: Chart;
  // Snapshot of `hours` used at the last chart.update() — read by the click
  // handler to map elementIndex → {date, hour}. Kept separately so a parent
  // re-render that swaps `this.hours` mid-flight doesn't desync indices.
  private _hoursSnapshot: HourData[] = [];
  private _resizeObserver?: ResizeObserver;

  firstUpdated(): void {
    this.updateComplete.then(() => this._setupChart());
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has('hours') || changedProps.has('schedule') ||
        changedProps.has('pvForecast') || changedProps.has('integrationConfig')) {
      if (this._chartInstance) {
        this._updateChart();
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyChart();
  }

  private _setupChart(): void {
    const canvas = this.shadowRoot?.getElementById('priceChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textColor = getComputedStyle(this).getPropertyValue('--primary-text-color') || '#333';
    const gridColor = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';
    const secondaryBg = getComputedStyle(this).getPropertyValue('--secondary-background-color') || '#f5f5f5';

    const buyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 250);
    buyGradient.addColorStop(0, 'rgba(33, 150, 243, 0.3)');
    buyGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');

    const sellGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 250);
    sellGradient.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
    sellGradient.addColorStop(1, 'rgba(76, 175, 80, 0)');

    this._chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Buy',
            data: [],
            borderColor: '#2196F3',
            backgroundColor: buyGradient,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#2196F3',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.4,
            fill: true,
            order: 2,
          },
          {
            label: 'Sell',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: sellGradient,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4CAF50',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.4,
            fill: true,
            order: 3,
          },
          {
            label: 'PV Forecast',
            data: [],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.12)',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#FF9800',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.35,
            fill: false,
            order: 4,
            yAxisID: 'yPv',
          },
          {
            label: 'Schedule',
            data: [],
            type: 'bar' as const,
            backgroundColor: [] as string[],
            borderWidth: 0,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
            order: 1,
            yAxisID: 'ySchedule',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 11 },
              padding: 12,
              boxWidth: 8,
              boxHeight: 8,
              filter: (item) => item.text !== 'Schedule',
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: secondaryBg,
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            usePointStyle: true,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            filter: (item) => item.datasetIndex < 3,
            callbacks: {
              title: (context) => {
                const idx = context[0]?.dataIndex;
                if (idx === undefined) return '';
                const h = this._hoursSnapshot[idx];
                return h ? formatDateTime(h.date, h.hour) : context[0]?.label ?? '';
              },
              label: (context) => {
                const val = context.parsed.y ?? 0;
                const suffix = context.dataset.label === 'PV Forecast' ? ' kWh' : '';
                return ` ${context.dataset.label}: ${val.toFixed(4)}${suffix}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: { color: gridColor, drawTicks: false },
            border: { display: false },
            ticks: { color: textColor, maxRotation: 0, font: { size: 9 }, padding: 8, maxTicksLimit: 12 },
          },
          y: {
            display: true,
            grid: { color: gridColor, drawTicks: false },
            border: { display: false },
            ticks: {
              color: textColor,
              callback: (value) => Number(value).toFixed(2),
              font: { size: 10 },
              padding: 8,
            },
          },
          yPv: {
            display: true,
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#FF9800',
              callback: (value) => `${Number(value).toFixed(1)} kWh`,
              font: { size: 10 },
              padding: 8,
            },
          },
          ySchedule: {
            display: false,
            min: 0,
            max: 1,
          },
        },
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            const h = this._hoursSnapshot[elements[0].index];
            if (h) {
              this.dispatchEvent(
                new CustomEvent('hour-slot-clicked', {
                  detail: { date: h.date, hour: h.hour },
                  bubbles: true,
                  composed: true,
                })
              );
            }
          }
        },
      },
    });

    this._updateChart();

    if (canvas.parentElement) {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._chartInstance && canvas.offsetParent !== null) {
          this._chartInstance.resize();
        }
      });
      this._resizeObserver.observe(canvas.parentElement);
    }
  }

  private _updateChart(): void {
    if (!this._chartInstance) return;

    const hours = this.hours;
    this._hoursSnapshot = hours;
    const schedule = this.schedule ?? {};
    const pvForecast = this.pvForecast ?? [];

    const pvForecastMap = new Map(
      pvForecast.map((entry) => [`${entry.date}-${entry.hour}`, entry.kwh ?? 0])
    );
    const today = getToday(this.tz);
    const tomorrow = getTomorrow(this.tz);

    const labels = hours.map((h) => {
      if (h.date === today) return formatHour(h.hour);
      if (h.date === tomorrow) return 'T+' + formatHour(h.hour);
      return h.date.substring(5) + ' ' + formatHour(h.hour);
    });

    const chart = this._chartInstance;
    chart.data.labels = labels;
    chart.data.datasets[0].data = hours.map((h) => h.buyPrice ?? null);
    chart.data.datasets[1].data = hours.map((h) => h.sellPrice ?? null);
    chart.data.datasets[2].data = hours.map((h) => pvForecastMap.get(`${h.date}-${h.hour}`) ?? 0);

    const scheduleBg = hours.map((h) => {
      const entry = schedule[h.date]?.[h.hour.toString()];
      if (!entry || !this.integrationConfig) return 'transparent';
      const actionType = resolveActionType(entry, this.integrationConfig);
      return getActionBgColor(actionType);
    });
    chart.data.datasets[3].data = hours.map((h) => {
      const entry = schedule[h.date]?.[h.hour.toString()];
      return entry ? 1 : 0;
    });
    (chart.data.datasets[3] as unknown as { backgroundColor: string[] }).backgroundColor = scheduleBg;

    chart.update('none');
  }

  private _destroyChart(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = undefined;
    }
  }

  render() {
    return html`
      <div class="chart-section">
        <div class="chart-container" style="--chart-height: ${this.chartHeight}px">
          <canvas id="priceChart"></canvas>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'es-schedule-chart': EsScheduleChart;
  }
}
