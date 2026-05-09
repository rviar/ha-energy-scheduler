import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cardStyles, evStyles } from '@/styles';
import type { HomeAssistant, IntegrationConfig, ScheduleData, ScheduleEntry } from '@/types';
import { formatHour, formatDayLabel, getCurrentDateHour, evChargeNow, evChargeStop } from '@/utils';

interface EvScheduleItem {
  date: string;
  hour: number;
  reason: string;
  amps: number;
}

@customElement('es-ev-tab')
export class EsEvTab extends LitElement {
  static styles = [cardStyles, evStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;

  private _dispatchRefresh() {
    this.dispatchEvent(
      new CustomEvent('data-refresh-needed', { bubbles: true, composed: true })
    );
  }

  private async _handleEvChargeNow() {
    if (!this.hass) return;
    await evChargeNow(this.hass);
    this._dispatchRefresh();
  }

  private async _handleEvChargeStop() {
    if (!this.hass) return;
    await evChargeStop(this.hass);
    this._dispatchRefresh();
  }

  private _getEntityState(entityId?: string): string | undefined {
    if (!entityId || !this.hass) return undefined;
    return this.hass.states[entityId]?.state;
  }

  private _getEvSchedule(): EvScheduleItem[] {
    const schedule = this.data?.schedule ?? {};
    const maxAmps = this.integrationConfig?.ev_max_charge_amps ?? 16;
    const items: EvScheduleItem[] = [];

    for (const [date, hours] of Object.entries(schedule)) {
      for (const [hour, entry] of Object.entries(hours)) {
        const e = entry as ScheduleEntry;
        if (e.ev_charging) {
          items.push({
            date,
            hour: parseInt(hour),
            reason: e.ev_charge_reason ?? 'scheduled',
            amps: maxAmps,
          });
        }
      }
    }

    items.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour - b.hour;
    });

    return items;
  }

  render() {
    const connected = this._getEntityState(this.integrationConfig?.ev_connected_sensor);
    const evSoc = this._getEntityState(this.integrationConfig?.ev_soc_sensor);
    const isConnected = connected === 'on' || connected === 'true';
    const maxAmps = this.integrationConfig?.ev_max_charge_amps ?? 16;
    const voltage = this.integrationConfig?.ev_voltage ?? 230;
    const evSchedule = this._getEvSchedule();

    const tz = this.hass?.config?.time_zone;
    const { date: today, hour: currentHourNum } = getCurrentDateHour(tz);
    const currentEntry = this.data?.schedule?.[today]?.[currentHourNum.toString()] as ScheduleEntry | undefined;
    const isCharging = currentEntry?.ev_charging ?? false;
    const chargeReason = currentEntry?.ev_charge_reason ?? 'none';

    return html`
      <div class="ev-tab">
        <div class="ev-control-bar">
          <button class="btn btn-primary" @click=${this._handleEvChargeNow}>
            <ha-icon icon="mdi:lightning-bolt"></ha-icon> Charge Now
          </button>
          <button class="btn btn-secondary" @click=${this._handleEvChargeStop}>
            <ha-icon icon="mdi:stop"></ha-icon> Stop
          </button>
        </div>

        <div class="ev-status">
          <h3>EV Status</h3>
          <div class="status-grid">
            <div class="status-field">
              <span class="field-label">Connection</span>
              <span class="field-value ${isConnected ? 'connected' : 'disconnected'}">
                ${isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div class="status-field">
              <span class="field-label">SOC</span>
              <span class="field-value">${evSoc ?? '--'}%</span>
            </div>
            <div class="status-field">
              <span class="field-label">Charging</span>
              <span class="field-value ${isCharging ? 'charging' : ''}">
                ${isCharging ? 'Yes' : 'No'}
              </span>
            </div>
            <div class="status-field">
              <span class="field-label">Reason</span>
              <span class="field-value">${chargeReason}</span>
            </div>
          </div>
        </div>

        ${isCharging ? html`
          <div class="session-block">
            <h3>Current Session</h3>
            <div class="status-grid">
              <div class="status-field">
                <span class="field-label">Mode</span>
                <span class="field-value">${currentEntry?.manual ? 'Manual' : 'Scheduled'}</span>
              </div>
              <div class="status-field">
                <span class="field-label">Current</span>
                <span class="field-value">${maxAmps}A</span>
              </div>
              <div class="status-field">
                <span class="field-label">Power</span>
                <span class="field-value">${((maxAmps * voltage) / 1000).toFixed(1)} kW</span>
              </div>
              <div class="status-field">
                <span class="field-label">Reason</span>
                <span class="field-value">${chargeReason}</span>
              </div>
            </div>
          </div>
        ` : nothing}

        <div class="ev-schedule-list">
          <h3>Charge Schedule</h3>
          ${evSchedule.length === 0
            ? html`<div class="empty-ev">No EV charging scheduled</div>`
            : evSchedule.map((item) => html`
              <div class="ev-hour-item">
                <span class="ev-hour-time">${formatDayLabel(item.date, tz)} ${formatHour(item.hour)}</span>
                <span class="ev-hour-reason">${item.reason}</span>
                <span class="ev-hour-amps">${item.amps}A</span>
              </div>
            `)}
        </div>
      </div>
    `;
  }
}
