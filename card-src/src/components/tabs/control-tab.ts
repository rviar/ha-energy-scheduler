import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { controlStyles } from '@/styles';
import type { HomeAssistant, IntegrationConfig, ScheduleData } from '@/types';
import {
  runOptimization,
  clearAllSchedules,
  setPaused,
  setOptimizeInterval,
  applyMode,
  evChargeNow,
  evChargeStop,
} from '@/utils';

@customElement('es-control-tab')
export class EsControlTab extends LitElement {
  static styles = controlStyles;

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;

  @state() private _optimizing = false;
  @state() private _clearing = false;

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
      new CustomEvent('card-state-patch', {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  private async _handleIntervalChange(e: Event) {
    if (!this.hass) return;
    const interval = (e.target as HTMLSelectElement).value;
    await setOptimizeInterval(this.hass, interval);
    this._dispatchStatePatch({ integrationConfig: { optimize_interval: interval } });
    this._dispatchRefresh();
  }

  private async _handlePauseToggle(e: Event) {
    if (!this.hass) return;
    const active = (e.target as HTMLInputElement).checked;
    await setPaused(this.hass, !active);
    this._dispatchStatePatch({ data: { paused: !active } });
    this._dispatchRefresh();
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

  private async _handleApplyMode() {
    if (!this.hass) return;
    const select = this.shadowRoot?.getElementById('applyModeSelect') as HTMLSelectElement;
    if (!select?.value) return;
    await applyMode(this.hass, select.value);
    this._dispatchRefresh();
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

  render() {
    return html`
      <div class="control-tab">
        ${this._renderSystem()}
        ${this._renderInverter()}
        ${this.integrationConfig?.ev_enabled ? this._renderEvControl() : nothing}
      </div>
    `;
  }

  private _renderSystem() {
    const interval = this.integrationConfig?.optimize_interval ?? 'manual';
    const paused = this.data?.paused ?? false;

    return html`
      <div class="control-block">
        <h3>System</h3>
        <div class="control-row">
          <label>Optimization Mode</label>
          <select .value=${interval} @change=${this._handleIntervalChange}>
            <option value="manual" ?selected=${interval === 'manual'}>Manual</option>
            <option value="hourly" ?selected=${interval === 'hourly'}>Hourly</option>
            <option value="6h" ?selected=${interval === '6h'}>Every 6h</option>
            <option value="daily" ?selected=${interval === 'daily'}>Daily</option>
            <option value="reactive" ?selected=${interval === 'reactive'}>Reactive</option>
          </select>
        </div>
        <div class="control-row">
          <label>Scheduler</label>
          <div class="toggle-container">
            <span>${paused ? 'Paused' : 'Active'}</span>
            <label class="toggle-switch">
              <input type="checkbox" .checked=${!paused} @change=${this._handlePauseToggle} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <div class="control-actions">
          <button class="btn btn-primary" @click=${this._handleOptimize} ?disabled=${this._optimizing}>
            <span class="btn-icon">${this._optimizing ? '\u23F3' : '\u25B6'}</span>
            ${this._optimizing ? 'Running...' : 'Optimize'}
          </button>
          <button class="btn btn-secondary" @click=${this._handleClearAll} ?disabled=${this._clearing}>
            <span class="btn-icon">${this._clearing ? '\u23F3' : '\u2715'}</span>
            ${this._clearing ? 'Clearing...' : 'Clear'}
          </button>
        </div>
      </div>
    `;
  }

  private _renderInverter() {
    const modes: string[] = this.data?.inverter_modes ?? [];
    return html`
      <div class="control-block">
        <h3>Inverter</h3>
        <div class="apply-row">
          <select id="applyModeSelect">
            <option value="">-- Select mode --</option>
            ${modes.map((m) => html`<option value=${m}>${m}</option>`)}
          </select>
          <button class="btn btn-primary" @click=${this._handleApplyMode}>
            <span class="btn-icon">\u2714</span> Apply
          </button>
        </div>
      </div>
    `;
  }

  private _renderEvControl() {
    return html`
      <div class="control-block">
        <h3>EV Control</h3>
        <div class="ev-control-actions">
          <button class="btn btn-primary" @click=${this._handleEvChargeNow}>
            <span class="btn-icon">\u26A1</span> Charge Now
          </button>
          <button class="btn btn-secondary" @click=${this._handleEvChargeStop}>
            <span class="btn-icon">\u23F9</span> Stop Charge
          </button>
        </div>
      </div>
    `;
  }
}
