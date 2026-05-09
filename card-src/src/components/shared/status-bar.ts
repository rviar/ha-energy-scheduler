import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { statusBarStyles } from '@/styles';
import type { HomeAssistant, IntegrationConfig, ScheduleData } from '@/types';
import { getCurrentPrice, formatPrice } from '@/utils';

@customElement('es-status-bar')
export class EsStatusBar extends LitElement {
  static styles = statusBarStyles;

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ type: Number }) priceDecimals = 2;
  @property({ type: String }) currency = '€';

  private _getEntityState(entityId?: string): string | undefined {
    if (!entityId || !this.hass) return undefined;
    return this.hass.states[entityId]?.state;
  }

  private _renderPvConfidence() {
    const dyn = this.data?.pv_dynamic;
    if (!dyn || !dyn.active) return nothing;
    const pct = Math.round(dyn.factor * 100);
    let color = 'var(--success-color, #43a047)';
    if (pct < 50) color = 'var(--error-color, #e53935)';
    else if (pct < 80) color = 'var(--warning-color, #fb8c00)';
    const title = `PV dynamic factor: ${pct}% (actual ${(dyn.actual_today_kwh ?? 0).toFixed(1)} kWh / baseline ${(dyn.baseline_elapsed_kwh ?? 0).toFixed(1)} kWh)`;
    return html`
      <div class="status-item" title=${title} style="color: ${color}">
        <ha-icon class="status-icon" icon="mdi:weather-sunny"></ha-icon>
        <span class="status-value">${pct}%</span>
      </div>
    `;
  }

  render() {
    const soc = this._getEntityState(this.integrationConfig?.soc_sensor);
    const price = this.data?.buy_prices
      ? getCurrentPrice(this.data.buy_prices, this.hass?.config?.time_zone)
      : undefined;
    const profit = this.data?.last_optimization?.estimated_profit;
    const evSoc = this._getEntityState(this.integrationConfig?.ev_soc_sensor);
    const showEv = this.integrationConfig?.ev_enabled;

    return html`
      <div class="status-bar">
        <div class="status-item">
          <ha-icon class="status-icon" icon="mdi:battery"></ha-icon>
          <span class="status-value">${soc ?? '--'}%</span>
        </div>
        <div class="status-item">
          <ha-icon class="status-icon" icon="mdi:tag-outline"></ha-icon>
          <span class="status-value">${formatPrice(price, this.priceDecimals, this.currency)}</span>
        </div>
        <div class="status-item profit">
          <ha-icon class="status-icon" icon="mdi:cash-plus"></ha-icon>
          <span class="status-value">
            ${profit !== undefined && profit !== null
              ? `+${profit.toFixed(2)} ${this.currency}`
              : '--'}
          </span>
        </div>
        ${this._renderPvConfidence()}
        ${showEv
          ? html`
              <div class="status-item">
                <ha-icon class="status-icon" icon="mdi:car-electric"></ha-icon>
                <span class="status-value">${evSoc ?? '--'}%</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
