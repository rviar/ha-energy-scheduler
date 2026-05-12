import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cardStyles, modalStyles } from '@/styles';
import type { HomeAssistant, IntegrationConfig, ScheduleData, ScheduleEntry, HourData } from '@/types';
import {
  formatDateTime,
  formatPrice,
  saveSchedule,
  clearSchedule,
  setManualFlag,
  isPlaceholderAction,
  PLACEHOLDER_LABELS,
  resolveActionType,
  getActionLabel,
  type PlaceholderAction,
} from '@/utils';

interface FormSnapshot {
  action: string;
  socLimit: number;
  socLimitType: string;
  fullHour: boolean;
  minutes: number;
  evCharging: boolean;
}

@customElement('es-hour-modal')
export class EsHourModal extends LitElement {
  static styles = [cardStyles, modalStyles];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) data?: ScheduleData;
  @property({ attribute: false }) integrationConfig?: IntegrationConfig;
  @property({ type: Number }) priceDecimals = 2;
  @property({ type: String }) currency = '€';

  @state() private _open = false;
  @state() private _date?: string;
  @state() private _hour?: number;
  // For non-placeholder slots: the chosen real inverter mode (pre-filled).
  // For placeholder slots: the user's *override* — empty until they pick one.
  @state() private _action = '';
  @state() private _placeholder?: PlaceholderAction;
  // True when the loaded entry was set by the optimizer (entry.manual !== true).
  // Drives the banner and the no-op-on-Save-if-unchanged behavior.
  @state() private _isOptimizerSet = false;
  // Banner label for non-placeholder optimizer slots ("Discharge", "Charge",
  // etc.) — resolved via resolveActionType when the entry has a real mode.
  @state() private _optimizerActionLabel = '';
  @state() private _socLimit = 100;
  @state() private _socLimitType = 'auto';
  @state() private _fullHour = true;
  @state() private _minutes = 30;
  @state() private _evCharging = false;

  // Snapshot of the form taken right after _loadFormValues. If the user clicks
  // Save without changing anything AND the slot is optimizer-set, we skip the
  // API call — saving would silently flip manual=true and lock the slot for
  // no reason.
  private _initialSnapshot?: FormSnapshot;

  private _escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
  };

  open(date: string, hour: number) {
    this._date = date;
    this._hour = hour;
    this._open = true;
    this._loadFormValues();
    document.addEventListener('keydown', this._escHandler);
  }

  close() {
    this._open = false;
    this._date = undefined;
    this._hour = undefined;
    document.removeEventListener('keydown', this._escHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Belt-and-suspenders: if the element is torn down while the modal is
    // still open, the document-level listener would outlive the instance.
    document.removeEventListener('keydown', this._escHandler);
  }

  private _loadFormValues() {
    if (!this._date || this._hour === undefined) return;
    const entry = this.data?.schedule?.[this._date]?.[this._hour.toString()];
    if (entry) {
      const rawAction = entry.action ?? '';
      this._isOptimizerSet = entry.manual !== true;
      if (isPlaceholderAction(rawAction)) {
        // Placeholder — backend resolves at runtime; we don't pre-fill the
        // dropdown. Empty Override means "keep the optimizer's decision".
        this._placeholder = rawAction;
        this._optimizerActionLabel = PLACEHOLDER_LABELS[rawAction];
        this._action = '';
        this._socLimit = 100;
        this._socLimitType = 'auto';
        this._fullHour = true;
        this._minutes = 30;
        this._evCharging = false;
      } else {
        this._placeholder = undefined;
        this._optimizerActionLabel = this.integrationConfig
          ? getActionLabel(resolveActionType(entry, this.integrationConfig))
          : rawAction;
        this._action = rawAction;
        this._socLimit = entry.soc_limit ?? 100;
        this._socLimitType = entry.soc_limit_type ?? 'auto';
        this._fullHour = entry.full_hour ?? true;
        this._minutes = entry.minutes ?? 30;
        this._evCharging = entry.ev_charging ?? false;
      }
    } else {
      this._isOptimizerSet = false;
      this._placeholder = undefined;
      this._optimizerActionLabel = '';
      this._action = '';
      this._socLimit = 100;
      this._socLimitType = 'auto';
      this._fullHour = true;
      this._minutes = 30;
      this._evCharging = false;
    }
    this._initialSnapshot = this._currentSnapshot();
  }

  private _currentSnapshot(): FormSnapshot {
    return {
      action: this._action,
      socLimit: this._socLimit,
      socLimitType: this._socLimitType,
      fullHour: this._fullHour,
      minutes: this._minutes,
      evCharging: this._evCharging,
    };
  }

  private _isUnchanged(): boolean {
    const s = this._initialSnapshot;
    if (!s) return false;
    return (
      s.action === this._action &&
      s.socLimit === this._socLimit &&
      s.socLimitType === this._socLimitType &&
      s.fullHour === this._fullHour &&
      s.minutes === this._minutes &&
      s.evCharging === this._evCharging
    );
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
    if (!this.hass || !this._date || this._hour === undefined) return;
    // Placeholder slot with no override picked → keep the optimizer's choice,
    // do not stomp it with a real mode.
    if (!this._action) {
      this.close();
      return;
    }
    // Optimizer-set slot with no edits → close without API. Saving would only
    // flip manual=true and lock the slot at values the optimizer just picked,
    // which is almost never what the user wanted (they came to look or tweak).
    if (this._isOptimizerSet && this._isUnchanged()) {
      this.close();
      return;
    }
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

          ${this._isOptimizerSet ? html`
            <div class="placeholder-banner">
              <div class="placeholder-banner-title">
                <ha-icon icon="mdi:auto-fix"></ha-icon>
                Optimizer chose: ${this._optimizerActionLabel}
              </div>
              <div class="placeholder-banner-hint">
                ${this._placeholder
                  ? html`Resolved to a real inverter mode at runtime. Leave Override empty to keep the optimizer's choice.`
                  : html`Tweak values and Save to lock — or close to leave it free for the next optimization run.`}
              </div>
            </div>
          ` : nothing}

          <div class="form-group">
            <label>${this._placeholder ? 'Override to…' : 'Inverter Mode'}</label>
            <select .value=${this._action}
              @change=${(e: Event) => { this._action = (e.target as HTMLSelectElement).value; }}>
              <option value="">${this._placeholder ? '-- Keep optimizer choice --' : '-- Select --'}</option>
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
            <button class="btn btn-primary" @click=${this._handleSave}
              ?disabled=${!this._placeholder && !this._action}>
              <ha-icon icon="mdi:check"></ha-icon> Save
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
