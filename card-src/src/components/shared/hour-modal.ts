import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { modalStyles } from '@/styles';
import type { HomeAssistant, IntegrationConfig, ScheduleData, ScheduleEntry, HourData } from '@/types';
import { formatDateTime, formatPrice, saveSchedule, clearSchedule, setManualFlag } from '@/utils';

@customElement('es-hour-modal')
export class EsHourModal extends LitElement {
  static styles = modalStyles;

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ type: Number }) priceDecimals = 2;
  @property({ type: String }) currency = '€';

  @state() private _open = false;
  @state() private _date?: string;
  @state() private _hour?: number;
  @state() private _action = '';
  @state() private _socLimit = 100;
  @state() private _socLimitType = 'auto';
  @state() private _fullHour = true;
  @state() private _minutes = 30;
  @state() private _evCharging = false;

  open(date: string, hour: number) {
    this._date = date;
    this._hour = hour;
    this._open = true;
    this._loadFormValues();
  }

  close() {
    this._open = false;
    this._date = undefined;
    this._hour = undefined;
  }

  private _resolveAction(action: string): string {
    const defaultMode = this.data?.default_mode ?? '';
    const selfConsumeMode = this.integrationConfig?.mode_self_consume ?? '';
    const gridOnlyMode = this.integrationConfig?.mode_grid_only ?? '';
    if (action === 'PV_CHARGE' || action === 'SELF_CONSUME_FIRST') return defaultMode;
    if (action === 'SELF_CONSUME_ONLY') return selfConsumeMode || defaultMode;
    if (action === 'PAID_IMPORT') return gridOnlyMode || defaultMode;
    if (action === 'CHARGE') return this.integrationConfig?.mode_charge_battery ?? defaultMode;
    return action;
  }

  private _loadFormValues() {
    if (!this._date || this._hour === undefined) return;
    const entry = this.data?.schedule?.[this._date]?.[this._hour.toString()];
    if (entry) {
      this._action = this._resolveAction(entry.action ?? '');
      this._socLimit = entry.soc_limit ?? 100;
      this._socLimitType = entry.soc_limit_type ?? 'auto';
      this._fullHour = entry.full_hour ?? true;
      this._minutes = entry.minutes ?? 30;
      this._evCharging = entry.ev_charging ?? false;
    } else {
      this._action = '';
      this._socLimit = 100;
      this._socLimitType = 'auto';
      this._fullHour = true;
      this._minutes = 30;
      this._evCharging = false;
    }
  }

  private _getHourData(): HourData | undefined {
    if (!this._date || this._hour === undefined || !this.data) return undefined;
    const bp = this.data.buy_prices?.find(
      (p) => p.date === this._date && p.hour === this._hour
    );
    const sp = this.data.sell_prices?.find(
      (p) => p.date === this._date && p.hour === this._hour
    );
    return { date: this._date, hour: this._hour, buyPrice: bp?.value, sellPrice: sp?.value };
  }

  private _getScheduleEntry(): ScheduleEntry | undefined {
    if (!this._date || this._hour === undefined) return undefined;
    return this.data?.schedule?.[this._date]?.[this._hour.toString()];
  }

  private _isNonDefault(): boolean {
    return !!this._action && this._action !== this.data?.default_mode;
  }

  private _hasEvStopCondition(): boolean {
    const cond = this.integrationConfig?.ev_stop_condition;
    if (!cond) return false;
    if (Array.isArray(cond)) return cond.length > 0;
    return typeof cond === 'string' && cond.length > 0;
  }

  private _supportsSocLimit(): boolean {
    if (!this._action) return false;
    const config = this.integrationConfig;
    return [
      config?.mode_charge_battery,
      config?.mode_charge_ev,
      config?.mode_charge_ev_and_battery,
      config?.mode_sell,
    ].includes(this._action);
  }

  private async _handleSave() {
    if (!this.hass || !this._date || this._hour === undefined || !this._action) return;
    const defaultMode = this.data?.default_mode ?? '';
    const options: Record<string, unknown> = {};

    if (this._action !== defaultMode) {
      if (this._hasEvStopCondition()) options.ev_charging = this._evCharging;
      if (!this._evCharging && this.integrationConfig?.soc_sensor && this._supportsSocLimit()) {
        options.soc_limit = this._socLimit;
        options.soc_limit_type = this._socLimitType;
      }
      options.full_hour = this._fullHour;
      if (!this._fullHour) options.minutes = this._minutes;
    }

    await saveSchedule(this.hass, this._date, this._hour, this._action, options);
    this._dispatchRefresh();
    this.close();
  }

  private async _handleClear() {
    if (!this.hass || !this._date || this._hour === undefined) return;
    await clearSchedule(this.hass, this._date, this._hour);
    this._dispatchRefresh();
    this.close();
  }

  private async _handleUnlock() {
    if (!this.hass || !this._date || this._hour === undefined) return;
    await setManualFlag(this.hass, this._date, this._hour, false);
    this._dispatchRefresh();
    this.close();
  }

  private _dispatchRefresh() {
    this.dispatchEvent(
      new CustomEvent('data-refresh-needed', { bubbles: true, composed: true })
    );
  }

  render() {
    if (!this._open || !this._date || this._hour === undefined) return nothing;

    const hourData = this._getHourData();
    const entry = this._getScheduleEntry();
    const hasEntry = !!entry;
    const isManual = entry?.manual === true;
    const modes: string[] = this.data?.inverter_modes ?? [];
    const defaultMode = this.data?.default_mode ?? '';
    const hasSoc = !!this.integrationConfig?.soc_sensor;
    const showSocLimit = hasSoc && !this._evCharging && this._supportsSocLimit();
    const showEvToggle = this._hasEvStopCondition();
    const showOptions = this._isNonDefault();

    return html`
      <div class="modal-overlay open"
        @click=${(e: Event) => {
          if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
        }}>
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${formatDateTime(this._date, this._hour)}</h3>
            <button class="modal-close" @click=${this.close}>&times;</button>
          </div>

          <div class="price-info">
            <div class="row">
              <span>Buy:</span>
              <span>${formatPrice(hourData?.buyPrice, this.priceDecimals, this.currency)}</span>
            </div>
            <div class="row">
              <span>Sell:</span>
              <span>${formatPrice(hourData?.sellPrice, this.priceDecimals, this.currency)}</span>
            </div>
            ${this.integrationConfig?.inverter_export_surplus_switch && entry?.export_surplus !== undefined ? html`
              <div class="row">
                <span>Export:</span>
                <span>${entry.export_surplus ? 'ON' : 'OFF'}</span>
              </div>
            ` : nothing}
            ${this.integrationConfig?.inverter_pv_input_switch && entry?.pv_input !== undefined ? html`
              <div class="row">
                <span>PV Input:</span>
                <span>${entry.pv_input ? 'ON' : 'OFF'}</span>
              </div>
            ` : nothing}
          </div>

          <div class="form-group">
            <label>Inverter Mode</label>
            <select .value=${this._action}
              @change=${(e: Event) => { this._action = (e.target as HTMLSelectElement).value; }}>
              <option value="">-- Select --</option>
              ${modes.map((m) => html`
                <option value=${m} ?selected=${m === this._action}>
                  ${m}${m === defaultMode ? ' *' : ''}
                </option>
              `)}
            </select>
          </div>

          ${showOptions ? html`
            ${showEvToggle ? html`
              <div class="toggle-row">
                <span class="toggle-label">EV Charging</span>
                <label class="toggle-switch">
                  <input type="checkbox" .checked=${this._evCharging}
                    @change=${(e: Event) => { this._evCharging = (e.target as HTMLInputElement).checked; }} />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            ` : nothing}

            ${showSocLimit ? html`
              <div class="form-divider"></div>
              <div class="form-group">
                <label>SOC Limit Type</label>
                <select .value=${this._socLimitType}
                  @change=${(e: Event) => { this._socLimitType = (e.target as HTMLSelectElement).value; }}>
                  <option value="auto">Auto</option>
                  <option value="max">Max (charge to)</option>
                  <option value="min">Min (discharge to)</option>
                </select>
              </div>
              <div class="range-group">
                <div class="range-header">
                  <span class="range-label">SOC Limit</span>
                  <span class="range-value">${this._socLimit}%</span>
                </div>
                <input type="range" class="range-input" min="5" max="100" step="5"
                  .value=${String(this._socLimit)}
                  @input=${(e: Event) => { this._socLimit = parseInt((e.target as HTMLInputElement).value); }} />
              </div>
            ` : nothing}

            <div class="form-divider"></div>
            <div class="toggle-row">
              <span class="toggle-label">Full Hour</span>
              <label class="toggle-switch">
                <input type="checkbox" .checked=${this._fullHour}
                  @change=${(e: Event) => { this._fullHour = (e.target as HTMLInputElement).checked; }} />
                <span class="toggle-slider"></span>
              </label>
            </div>
            ${!this._fullHour ? html`
              <div class="range-group">
                <div class="range-header">
                  <span class="range-label">Minutes</span>
                  <span class="range-value">${this._minutes} min</span>
                </div>
                <input type="range" class="range-input" min="5" max="55" step="5"
                  .value=${String(this._minutes)}
                  @input=${(e: Event) => { this._minutes = parseInt((e.target as HTMLInputElement).value); }} />
              </div>
            ` : nothing}
          ` : nothing}

          <div class="modal-actions">
            ${hasEntry ? html`<button class="btn btn-danger" @click=${this._handleClear}>
              <ha-icon icon="mdi:delete-outline"></ha-icon> Clear
            </button>` : nothing}
            ${isManual ? html`<button class="btn btn-warning" @click=${this._handleUnlock}>
              <ha-icon icon="mdi:lock-open-outline"></ha-icon> Unlock
            </button>` : nothing}
            <button class="btn btn-primary" @click=${this._handleSave} ?disabled=${!this._action}>
              <ha-icon icon="mdi:check"></ha-icon> Save
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
