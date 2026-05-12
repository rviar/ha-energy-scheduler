import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
  formatHour,
  formatDayLabel,
  resolveActionType,
  getActionColor,
  getActionBgColor,
  getActionIcon,
  getActionLabel,
  runOptimization,
  clearAllSchedules,
  setPaused,
  setOptimizeInterval,
} from '@/utils';

import '../shared/hour-modal';
import '../shared/confirm-modal';
import type { EsConfirmModal } from '../shared/confirm-modal';
import './schedule-chart';

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
  @state() private _modeMenuOpen = false;

  private _onDocClick = (e: MouseEvent) => {
    if (!this._modeMenuOpen) return;
    const path = e.composedPath();
    const split = this.shadowRoot?.querySelector('.btn-split');
    if (split && path.includes(split)) return;
    this._modeMenuOpen = false;
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    super.disconnectedCallback();
  }

  // Memoize the hours array so a hass-only re-render (HA fires `hass` on every
  // entity state change) doesn't pass a fresh array reference to
  // `<es-schedule-chart>` — that would re-trigger `chart.update()` and reset
  // hover state on every tick, causing point flicker.
  private _hoursCache?: {
    dataRef: ScheduleData | undefined;
    tz: string | undefined;
    hours: HourData[];
  };

  private _getHours(): HourData[] {
    const tz = this.hass?.config?.time_zone;
    if (
      this._hoursCache &&
      this._hoursCache.dataRef === this.data &&
      this._hoursCache.tz === tz
    ) {
      return this._hoursCache.hours;
    }
    const hours = this.data
      ? getAvailableHours(this.data.buy_prices ?? [], this.data.sell_prices ?? [], tz)
      : [];
    this._hoursCache = { dataRef: this.data, tz, hours };
    return hours;
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
    const modal = this.shadowRoot?.querySelector('es-confirm-modal') as EsConfirmModal | null;
    if (!modal) return;
    const ok = await modal.confirm({
      title: 'Clear schedule',
      message: 'Remove all scheduled tasks? The optimizer will rebuild the schedule on the next run.',
      confirmLabel: 'Clear',
      destructive: true,
    });
    if (!ok) return;
    this._clearing = true;
    try {
      await clearAllSchedules(this.hass);
    } finally {
      this._clearing = false;
    }
    this._dispatchRefresh();
  }

  private async _setPaused(paused: boolean) {
    if (!this.hass) return;
    if ((this.data?.paused ?? false) === paused) return;
    await setPaused(this.hass, paused);
    this._dispatchStatePatch({ data: { paused } });
    this._dispatchRefresh();
  }

  private async _setInterval(interval: 'auto' | 'manual') {
    if (!this.hass) return;
    this._modeMenuOpen = false;
    if ((this.integrationConfig?.optimize_interval ?? 'auto') === interval) return;
    await setOptimizeInterval(this.hass, interval);
    this._dispatchStatePatch({ integrationConfig: { optimize_interval: interval } });
    this._dispatchRefresh();
  }

  private _toggleModeMenu(e: Event) {
    e.stopPropagation();
    this._modeMenuOpen = !this._modeMenuOpen;
  }

  private _handleHourClick(date: string, hour: number) {
    const modal = this.shadowRoot?.querySelector('es-hour-modal') as
      | (HTMLElement & { open: (d: string, h: number) => void })
      | null;
    modal?.open(date, hour);
  }

  private _onChartClick(e: CustomEvent<{ date: string; hour: number }>) {
    this._handleHourClick(e.detail.date, e.detail.hour);
  }

  render() {
    const tz = this.hass?.config?.time_zone;
    const showChart = this.cardConfig?.show_chart !== false;
    const hours = this._getHours();
    const schedule = this.data?.schedule ?? {};
    const { date: today, hour: currentHour } = getCurrentDateHour(tz);
    const decimals = this.cardConfig?.price_decimals ?? 2;

    let currentDate: string | null = null;

    const rawInterval = this.integrationConfig?.optimize_interval ?? 'auto';
    const normalizedInterval = rawInterval === 'manual' ? 'manual' : 'auto';
    const paused = this.data?.paused ?? false;

    return html`
      <div class="schedule-tab">
        ${showChart
          ? html`
              <es-schedule-chart
                .hours=${hours}
                .schedule=${this.data?.schedule}
                .pvForecast=${this.data?.pv_forecast}
                .integrationConfig=${this.integrationConfig}
                .tz=${tz}
                .chartHeight=${this.cardConfig?.chart_height ?? 250}
                @hour-slot-clicked=${this._onChartClick}
              ></es-schedule-chart>
            `
          : nothing}

        <div class="controls-bar">
          <div class="btn-split">
            <button
              class="btn btn-primary btn-split-main"
              @click=${this._handleOptimize}
              ?disabled=${this._optimizing}
              title="Run optimizer now"
            >
              <ha-icon icon="mdi:play"></ha-icon>
              ${this._optimizing ? 'Running...' : 'Optimize'}
            </button>
            <button
              class="btn btn-primary btn-split-chev"
              @click=${this._toggleModeMenu}
              ?disabled=${this._optimizing}
              aria-haspopup="menu"
              aria-expanded=${this._modeMenuOpen}
              title="Optimization mode"
            >
              <ha-icon icon="mdi:menu-down"></ha-icon>
            </button>
            ${this._modeMenuOpen
              ? html`
                  <div class="optimize-menu" role="menu">
                    <div class="optimize-menu-header">Mode</div>
                    <button
                      class="optimize-menu-option ${normalizedInterval === 'auto' ? 'active' : ''}"
                      role="menuitemradio"
                      aria-checked=${normalizedInterval === 'auto'}
                      @click=${() => this._setInterval('auto')}
                      title="Optimizer reruns hourly and on price/PV updates"
                    >
                      <ha-icon icon="mdi:check"></ha-icon> Auto
                    </button>
                    <button
                      class="optimize-menu-option ${normalizedInterval === 'manual' ? 'active' : ''}"
                      role="menuitemradio"
                      aria-checked=${normalizedInterval === 'manual'}
                      @click=${() => this._setInterval('manual')}
                      title="Optimizer only runs when you press Optimize"
                    >
                      <ha-icon icon="mdi:check"></ha-icon> Manual
                    </button>
                  </div>
                `
              : nothing}
          </div>
          <button class="btn btn-secondary" @click=${this._handleClearAll} ?disabled=${this._clearing}>
            <ha-icon icon="mdi:delete-outline"></ha-icon> ${this._clearing ? 'Clearing...' : 'Clear'}
          </button>
          <label class="auto-apply" title="${paused ? 'Schedule executor is paused — inverter not auto-managed' : 'Schedule executor applies the schedule to the inverter'}">
            <span class="auto-apply-label">Auto-apply</span>
            <span class="toggle-switch">
              <input
                type="checkbox"
                .checked=${!paused}
                @change=${(e: Event) => this._setPaused(!(e.target as HTMLInputElement).checked)}
              />
              <span class="toggle-slider"></span>
            </span>
          </label>
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
                    @click=${() => this._handleHourClick(h.date, h.hour)}
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
        <es-confirm-modal></es-confirm-modal>
      </div>
    `;
  }
}
