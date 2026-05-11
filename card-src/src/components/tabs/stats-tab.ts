import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Chart } from 'chart.js';
import { statsStyles } from '@/styles';
import type {
  HomeAssistant,
  IntegrationConfig,
  ScheduleData,
  ScheduleEntry,
  ConsumptionProfile,
} from '@/types';
import {
  fetchConsumptionProfile,
  formatHour,
  formatTimeAgo,
  formatPrice,
  getCurrentDateHour,
  getWeekdayName,
  getWeekdayShort,
  getTodayWeekday,
} from '@/utils';

@customElement('es-stats-tab')
export class EsStatsTab extends LitElement {
  static styles = statsStyles;

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ type: Number }) priceDecimals = 2;
  @property({ type: String }) currency = '€';

  @state() private _consumptionProfile?: ConsumptionProfile;
  @state() private _selectedWeekday = -1;
  @state() private _profileLoading = false;

  private _consumptionChart?: Chart;

  connectedCallback(): void {
    super.connectedCallback();
    if (this._selectedWeekday < 0) {
      this._selectedWeekday = getTodayWeekday(this.hass?.config?.time_zone);
    }
    this._loadConsumptionProfile();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._consumptionChart) {
      this._consumptionChart.destroy();
      this._consumptionChart = undefined;
    }
  }

  private async _loadConsumptionProfile() {
    if (!this.hass || this._profileLoading) return;
    this._profileLoading = true;
    try {
      this._consumptionProfile = await fetchConsumptionProfile(this.hass);
      await this.updateComplete;
      this._setupConsumptionChart();
    } catch {
      // Profile not available
    } finally {
      this._profileLoading = false;
    }
  }

  private _setupConsumptionChart() {
    const canvas = this.shadowRoot?.getElementById('consumptionChart') as HTMLCanvasElement;
    if (!canvas || !this._consumptionProfile?.has_profile) return;

    if (this._consumptionChart) {
      this._consumptionChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dayName = getWeekdayName(this._selectedWeekday);
    const dayData = this._consumptionProfile.profile?.[dayName] ?? {};
    const evDayData = this._consumptionProfile.ev_profile?.[dayName] ?? {};
    const hasEv = this._consumptionProfile.has_ev_sensor && Object.keys(evDayData).length > 0;
    const labels = Array.from({ length: 24 }, (_, i) => formatHour(i));
    const homeValues = Array.from({ length: 24 }, (_, i) => dayData[i.toString()] ?? 0);
    const evValues = Array.from({ length: 24 }, (_, i) => evDayData[i.toString()] ?? 0);

    const textColor = getComputedStyle(this).getPropertyValue('--primary-text-color') || '#333';
    const gridColor = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';

    const datasets: any[] = [{
      label: hasEv ? 'Home' : 'Consumption',
      data: homeValues,
      backgroundColor: 'rgba(33, 150, 243, 0.4)',
      borderColor: '#2196F3',
      borderWidth: 1,
      borderRadius: hasEv ? 0 : 2,
      stack: 'consumption',
    }];

    if (hasEv) {
      datasets.push({
        label: 'EV',
        data: evValues,
        backgroundColor: 'rgba(76, 175, 80, 0.4)',
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderRadius: 2,
        stack: 'consumption',
      });
    }

    this._consumptionChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: hasEv, position: 'top', labels: { boxWidth: 12, font: { size: 10 }, color: textColor } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(2)} kWh`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: textColor, font: { size: 8 }, maxTicksLimit: 12 },
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 9 },
              callback: (v) => `${Number(v).toFixed(1)}`,
            },
          },
        },
      },
    });
  }

  private _handleWeekdayChange(e: Event) {
    this._selectedWeekday = parseInt((e.target as HTMLSelectElement).value);
    this._setupConsumptionChart();
  }

  private _isFutureHour(date: string, hour: number): boolean {
    const { date: todayStr, hour: currentHour } = getCurrentDateHour(this.hass?.config?.time_zone);
    if (date > todayStr) return true;
    if (date < todayStr) return false;
    return hour >= currentHour;
  }

  private _getChargeHours(): Array<{ hour: string; price: number }> {
    const schedule = this.data?.schedule ?? {};
    const items: Array<{ date: string; hour: number; price: number }> = [];
    const buyPrices = this.data?.buy_prices ?? [];

    for (const [date, hours] of Object.entries(schedule)) {
      for (const [hour, entry] of Object.entries(hours)) {
        const hourNum = parseInt(hour);
        if (!this._isFutureHour(date, hourNum)) continue;
        const e = entry as ScheduleEntry;
        if (e.action === 'CHARGE' || e.action === this.integrationConfig?.mode_charge_battery) {
          const price = buyPrices.find((p) => p.date === date && p.hour === hourNum)?.value ?? 0;
          items.push({ date, hour: hourNum, price });
        }
      }
    }

    items.sort((a, b) => a.price - b.price);
    return items.map((i) => ({
      hour: `${i.date.substring(5)} ${formatHour(i.hour)}`,
      price: i.price,
    }));
  }

  private _getDischargeHours(): Array<{ hour: string; price: number }> {
    const schedule = this.data?.schedule ?? {};
    const items: Array<{ date: string; hour: number; price: number }> = [];
    const sellPrices = this.data?.sell_prices ?? [];
    const sellMode = this.integrationConfig?.mode_sell;

    for (const [date, hours] of Object.entries(schedule)) {
      for (const [hour, entry] of Object.entries(hours)) {
        const hourNum = parseInt(hour);
        if (!this._isFutureHour(date, hourNum)) continue;
        if ((entry as ScheduleEntry).action === sellMode) {
          const price = sellPrices.find((p) => p.date === date && p.hour === hourNum)?.value ?? 0;
          items.push({ date, hour: hourNum, price });
        }
      }
    }

    items.sort((a, b) => b.price - a.price);
    return items.map((i) => ({
      hour: `${i.date.substring(5)} ${formatHour(i.hour)}`,
      price: i.price,
    }));
  }

  render() {
    const opt = this.data?.last_optimization;
    const chargeHours = this._getChargeHours();
    const dischargeHours = this._getDischargeHours();
    const profile = this._consumptionProfile;

    return html`
      <div class="stats-tab">
        ${this._renderArbitrage(opt, chargeHours, dischargeHours)}
        ${this._renderPvConfidence()}
        ${this._renderConsumption(profile)}
        ${this._renderLastOptimization(opt)}
      </div>
    `;
  }

  private _renderPvConfidence() {
    const dyn = this.data?.pv_dynamic;
    if (!dyn) return null;
    const factorPct = Math.round(dyn.factor * 100);
    const reasonLabel = (() => {
      if (dyn.active) return dyn.reason === 'clamped' ? 'Active (clamped)' : 'Active';
      switch (dyn.reason) {
        case 'disabled': return 'Disabled in settings';
        case 'no_sensor': return 'No PV production sensor configured';
        case 'sensor_missing': return 'PV sensor not found';
        case 'sensor_unavailable': return 'PV sensor unavailable';
        case 'sensor_invalid': return 'PV sensor returned invalid value';
        case 'sensor_negative': return 'PV sensor returned negative value';
        case 'below_threshold': return 'Waiting for ≥ 2 kWh of elapsed forecast';
        case 'not_computed': return 'Not yet computed';
        default: return dyn.reason || 'Inactive';
      }
    })();
    let factorColor = 'var(--success-color, #43a047)';
    if (dyn.active) {
      if (factorPct < 50) factorColor = 'var(--error-color, #e53935)';
      else if (factorPct < 80) factorColor = 'var(--warning-color, #fb8c00)';
    } else {
      factorColor = 'var(--secondary-text-color)';
    }
    const conf = dyn.solcast_confidence;
    return html`
      <div class="stats-block">
        <h3>PV Confidence</h3>
        <div class="profit-value" style="color: ${factorColor}">
          ${dyn.active ? `${factorPct}%` : '—'}
        </div>
        <div class="stats-row">
          <span class="label">Status</span>
          <span class="value">${reasonLabel}</span>
        </div>
        ${dyn.actual_today_kwh !== null && dyn.baseline_elapsed_kwh !== null ? html`
          <div class="stats-row">
            <span class="label">Actual today / baseline elapsed</span>
            <span class="value">${dyn.actual_today_kwh.toFixed(2)} kWh / ${dyn.baseline_elapsed_kwh.toFixed(2)} kWh</span>
          </div>
        ` : null}
        ${dyn.baseline_today_kwh !== null ? html`
          <div class="stats-row">
            <span class="label">Baseline today (full day)</span>
            <span class="value">${dyn.baseline_today_kwh.toFixed(2)} kWh</span>
          </div>
        ` : null}
        ${conf !== null && conf !== undefined ? html`
          <div class="stats-row">
            <span class="label">Solcast confidence (avg)</span>
            <span class="value">${(conf * 100).toFixed(0)}%</span>
          </div>
        ` : null}
      </div>
    `;
  }

  private _renderArbitrage(
    opt: ScheduleData['last_optimization'],
    chargeHours: Array<{ hour: string; price: number }>,
    dischargeHours: Array<{ hour: string; price: number }>
  ) {
    return html`
      <div class="stats-block">
        <h3>Arbitrage</h3>
        <div class="profit-value">
          ${opt?.estimated_profit !== undefined
            ? `${opt.estimated_profit > 0 ? '+' : ''}${opt.estimated_profit.toFixed(2)} ${this.currency}`
            : '--'}
        </div>
        ${opt?.cycle_cost !== undefined ? html`
          <div class="stats-row">
            <span class="label">Cycle cost</span>
            <span class="value">${opt.cycle_cost.toFixed(4)} ${this.currency}/kWh</span>
          </div>
        ` : nothing}
        ${dischargeHours.length > 0 ? html`
          <div class="stats-row"><span class="label">Sell hours</span></div>
          <div class="hours-list">
            ${dischargeHours.map((h) => html`
              <span class="hour-chip discharge">${h.hour} ${formatPrice(h.price, this.priceDecimals, this.currency)}</span>
            `)}
          </div>
        ` : nothing}
        ${chargeHours.length > 0 ? html`
          <div class="stats-row" style="margin-top: 8px"><span class="label">Buy hours</span></div>
          <div class="hours-list">
            ${chargeHours.map((h) => html`
              <span class="hour-chip charge">${h.hour} ${formatPrice(h.price, this.priceDecimals, this.currency)}</span>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderConsumption(profile?: ConsumptionProfile) {
    return html`
      <div class="stats-block">
        <div class="consumption-header">
          <h3 style="margin:0">Consumption Profile</h3>
          <select @change=${this._handleWeekdayChange}>
            ${Array.from({ length: 7 }, (_, i) => html`
              <option value=${i} ?selected=${i === this._selectedWeekday}>${getWeekdayShort(i)}</option>
            `)}
          </select>
        </div>
        ${profile?.has_profile ? html`
          <div class="consumption-chart">
            <canvas id="consumptionChart"></canvas>
          </div>
          <div class="consumption-source">Source: History (60d)</div>
        ` : html`
          <div class="consumption-source">
            Fallback: ${profile?.fallback_avg ?? '?'} kWh/h (no history sensor configured)
          </div>
        `}
      </div>
    `;
  }

  private _renderLastOptimization(opt: ScheduleData['last_optimization']) {
    if (!opt) {
      return html`
        <div class="stats-block">
          <h3>Last Optimization</h3>
          <div class="consumption-source">No optimization has been run yet</div>
        </div>
      `;
    }

    return html`
      <div class="stats-block">
        <h3>Last Optimization</h3>
        <div class="optimization-meta">
          <div class="meta-item">
            <span class="meta-label">When</span>
            <span class="meta-value">${formatTimeAgo(opt.timestamp)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Charge</span>
            <span class="meta-value">${opt.charge_hours}h</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Discharge</span>
            <span class="meta-value">${opt.discharge_hours}h</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Self-consume</span>
            <span class="meta-value">${opt.self_consume_hours}h</span>
          </div>
        </div>
        ${opt.warnings.length > 0
          ? html`${opt.warnings.map((w) => html`<div class="warning-item">${w}</div>`)}`
          : nothing}
      </div>
    `;
  }
}
