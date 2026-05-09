import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { cardStyles, scheduleStyles } from '@/styles';
import type {
  HomeAssistant,
  EnergySchedulerCardConfig,
  IntegrationConfig,
  ScheduleData,
  ScheduleEntry,
  HourData,
} from '@/types';
import {
  getAvailableHours,
  getCurrentDateHour,
  getToday,
  getTomorrow,
  formatHour,
  formatDayLabel,
  formatDateTime,
  resolveActionType,
  getActionColor,
  getActionBgColor,
  getActionIcon,
  getActionLabel,
  runOptimization,
  clearAllSchedules,
  setPaused,
  setOptimizeInterval,
  applyMode,
} from '@/utils';

import '../shared/hour-modal';

Chart.register(...registerables);

@customElement('es-schedule-tab')
export class EsScheduleTab extends LitElement {
  static styles = [cardStyles, scheduleStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ attribute: false }) cardConfig?: EnergySchedulerCardConfig;
  @property({ type: String }) currency = '€';

  @state() private _optimizing = false;
  @state() private _clearing = false;

  private _chartInstance?: Chart;
  private _chartHoursData: HourData[] = [];
  private _resizeObserver?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.data && this.cardConfig?.show_chart !== false) {
      this.updateComplete.then(() => this._setupChart());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyChart();
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has('data') && this.data) {
      if (this._chartInstance) {
        this._updateChart();
      } else if (this.cardConfig?.show_chart !== false) {
        this.updateComplete.then(() => this._setupChart());
      }
    }
  }

  private _setupChart(): void {
    const canvas = this.shadowRoot?.getElementById('priceChart') as HTMLCanvasElement;
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
                const h = this._chartHoursData[idx];
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
            const h = this._chartHoursData[elements[0].index];
            if (h) this._openModal(h.date, h.hour);
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
    if (!this.data || !this._chartInstance) return;

    const tz = this.hass?.config?.time_zone;
    const hours = getAvailableHours(
      this.data.buy_prices ?? [],
      this.data.sell_prices ?? [],
      tz
    );
    this._chartHoursData = hours;
    const schedule = this.data.schedule ?? {};
    const pvForecastMap = new Map(
      (this.data.pv_forecast ?? []).map((entry) => [
        `${entry.date}-${entry.hour}`,
        entry.kwh ?? 0,
      ])
    );
    const today = getToday(tz);
    const tomorrow = getTomorrow(tz);

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
      if (!entry) return 'transparent';
      const actionType = resolveActionType(entry, this.integrationConfig!);
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

  private _dispatchRefresh() {
    this.dispatchEvent(
      new CustomEvent('data-refresh-needed', { bubbles: true, composed: true })
    );
  }

  private _dispatchStatePatch(detail: {
    integrationConfig?: Partial<IntegrationConfig>;
    data?: Partial<ScheduleData>;
  }) {
    this.dispatchEvent(
      new CustomEvent('card-state-patch', { bubbles: true, composed: true, detail })
    );
  }

  private async _handleOptimize() {
    if (!this.hass || this._optimizing) return;
    this._optimizing = true;
    try {
      await runOptimization(this.hass);
    } finally {
      this._optimizing = false;
    }
    this._dispatchRefresh();
  }

  private async _handleClearAll() {
    if (!this.hass || this._clearing) return;
    if (!confirm('Clear all scheduled tasks?')) return;
    this._clearing = true;
    try {
      await clearAllSchedules(this.hass);
    } finally {
      this._clearing = false;
    }
    this._dispatchRefresh();
  }

  private async _handlePauseToggle() {
    if (!this.hass) return;
    const paused = this.data?.paused ?? false;
    await setPaused(this.hass, !paused);
    this._dispatchStatePatch({ data: { paused: !paused } });
    this._dispatchRefresh();
  }

  private async _handleIntervalChange(e: Event) {
    if (!this.hass) return;
    const interval = (e.target as HTMLSelectElement).value;
    await setOptimizeInterval(this.hass, interval);
    this._dispatchStatePatch({ integrationConfig: { optimize_interval: interval } });
    this._dispatchRefresh();
  }

  private async _handleInverterChange(e: Event) {
    if (!this.hass) return;
    const mode = (e.target as HTMLSelectElement).value;
    if (!mode) return;
    await applyMode(this.hass, mode);
    this._dispatchRefresh();
  }

  private _openModal(date: string, hour: number) {
    const modal = this.shadowRoot?.querySelector('es-hour-modal') as
      | (HTMLElement & { open: (d: string, h: number) => void })
      | null;
    modal?.open(date, hour);
  }

  render() {
    const tz = this.hass?.config?.time_zone;
    const showChart = this.cardConfig?.show_chart !== false;
    const hours = this.data
      ? getAvailableHours(this.data.buy_prices ?? [], this.data.sell_prices ?? [], tz)
      : [];
    const schedule = this.data?.schedule ?? {};
    const { date: today, hour: currentHour } = getCurrentDateHour(tz);
    const decimals = this.cardConfig?.price_decimals ?? 2;

    let currentDate: string | null = null;

    const rawInterval = this.integrationConfig?.optimize_interval ?? 'auto';
    const normalizedInterval = rawInterval === 'manual' ? 'manual' : 'auto';
    const paused = this.data?.paused ?? false;
    const modes: string[] = this.data?.inverter_modes ?? [];

    return html`
      <div class="schedule-tab">
        ${showChart
          ? html`
              <div class="chart-section">
                <div class="chart-container"
                  style="--chart-height: ${this.cardConfig?.chart_height ?? 250}px">
                  <canvas id="priceChart"></canvas>
                </div>
              </div>
            `
          : nothing}

        <div class="controls-bar">
          <button class="btn btn-primary" @click=${this._handleOptimize} ?disabled=${this._optimizing}>
            <ha-icon icon="mdi:play"></ha-icon> ${this._optimizing ? 'Running...' : 'Optimize'}
          </button>
          <button class="btn btn-secondary" @click=${this._handleClearAll} ?disabled=${this._clearing}>
            <ha-icon icon="mdi:delete-outline"></ha-icon> ${this._clearing ? 'Clearing...' : 'Clear'}
          </button>
          <div class="controls-spacer"></div>
          <button class="status-chip ${paused ? 'paused' : 'active'}" @click=${this._handlePauseToggle}>
            <ha-icon icon=${paused ? 'mdi:pause-circle-outline' : 'mdi:check-circle-outline'}></ha-icon>
            ${paused ? 'Paused' : 'Active'}
          </button>
        </div>
        <div class="controls-bar">
          <select class="controls-select" .value=${normalizedInterval} @change=${this._handleIntervalChange}>
            <option value="auto" ?selected=${normalizedInterval === 'auto'}>Auto</option>
            <option value="manual" ?selected=${normalizedInterval === 'manual'}>Manual</option>
          </select>
          ${modes.length > 0 ? html`
            <select class="controls-select" @change=${this._handleInverterChange}>
              <option value="">Inverter mode</option>
              ${modes.map((m) => html`<option value=${m}>${m}</option>`)}
            </select>
          ` : nothing}
        </div>

        <div class="schedule-grid">
          ${hours.length === 0
            ? html`<div class="empty-state">No price data available</div>`
            : hours.map((h) => {
                let separator = nothing as unknown as ReturnType<typeof html>;
                if (h.date !== currentDate) {
                  currentDate = h.date;
                  separator = html`<div class="day-separator">${formatDayLabel(h.date, tz)}</div>`;
                }

                const entry: ScheduleEntry | undefined = schedule[h.date]?.[h.hour.toString()];
                const isScheduled = !!entry;
                const isManual = entry?.manual === true;
                const isCurrent = h.date === today && h.hour === currentHour;
                const actionType = entry
                  ? resolveActionType(entry, this.integrationConfig!)
                  : undefined;
                const actionColor = actionType ? getActionColor(actionType) : '';
                const bgColor = actionType ? getActionBgColor(actionType) : '';
                const icon = actionType ? getActionIcon(actionType) : '';
                const label = actionType ? getActionLabel(actionType) : '';

                return html`
                  ${separator}
                  <div
                    class="hour-slot ${isCurrent ? 'current' : ''}"
                    style="${isScheduled
                      ? `border-color: ${actionColor}; background: ${bgColor}`
                      : ''}"
                    @click=${() => this._openModal(h.date, h.hour)}
                  >
                    ${icon ? html`<ha-icon .icon=${icon} style="--mdc-icon-size: 16px; color: ${actionColor};"></ha-icon>` : nothing}
                    <div class="hour-badges">
                      ${isManual ? html`<span class="lock-badge">&#x1f512;</span>` : nothing}
                      ${entry?.export_surplus === false && this.integrationConfig?.inverter_export_surplus_switch
                        ? html`<ha-icon
                            class="no-export-badge"
                            icon="mdi:transmission-tower-off"
                            title="Grid export disabled (low sell price)"
                          ></ha-icon>`
                        : nothing}
                      ${entry?.pv_input === false && this.integrationConfig?.inverter_pv_input_switch
                        ? html`<ha-icon
                            class="no-pv-badge"
                            icon="mdi:weather-sunny-off"
                            title="PV input disabled (paid import / negative-price charge)"
                          ></ha-icon>`
                        : nothing}
                    </div>
                    <div class="time">${formatHour(h.hour)}</div>
                    <div class="prices">
                      ${h.buyPrice !== undefined
                        ? html`<span class="buy">${h.buyPrice.toFixed(decimals)}</span>`
                        : nothing}
                      ${h.sellPrice !== undefined
                        ? html`<span class="sell">${h.sellPrice.toFixed(decimals)}</span>`
                        : nothing}
                    </div>
                    ${isScheduled
                      ? html`<div class="action-label" style="color: ${actionColor}">
                          ${label}
                        </div>
                        ${entry?.soc_limit != null
                          ? html`<div class="soc-label" style="color: ${actionColor}; opacity: 0.7; font-size: 0.65em;">
                              SOC ${entry.soc_limit}%
                            </div>`
                          : nothing}`
                      : nothing}
                  </div>
                `;
              })}
        </div>

        <es-hour-modal
          .hass=${this.hass}
          .data=${this.data}
          .integrationConfig=${this.integrationConfig}
          .priceDecimals=${decimals}
          .currency=${this.currency}
        ></es-hour-modal>
      </div>
    `;
  }
}
