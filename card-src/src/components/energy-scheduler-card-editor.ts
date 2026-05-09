import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { editorStyles } from '@/styles';
import type { HomeAssistant, EnergySchedulerCardConfig } from '@/types';

@customElement('energy-scheduler-card-editor')
export class EnergySchedulerCardEditor extends LitElement {
  static styles = editorStyles;

  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config?: EnergySchedulerCardConfig;

  setConfig(config: EnergySchedulerCardConfig): void {
    this._config = config;
  }

  private _fireConfigChanged() {
    if (!this._config) return;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _updateConfig(key: keyof EnergySchedulerCardConfig, value: unknown) {
    if (!this._config) return;
    this._config = { ...this._config, [key]: value };
    this._fireConfigChanged();
  }

  protected render() {
    if (!this._config) return html`<div>No configuration</div>`;

    return html`
      <div class="editor">
        <div class="section-title">Basic</div>

        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title"
            .value=${this._config.title ?? 'Energy Scheduler'}
            @change=${(e: Event) => this._updateConfig('title', (e.target as HTMLInputElement).value)} />
        </div>

        <div class="form-group">
          <label for="chart_height">Chart Height (px)</label>
          <input type="number" id="chart_height"
            .value=${String(this._config.chart_height ?? 250)}
            min="100" max="500"
            @change=${(e: Event) => this._updateConfig('chart_height', parseInt((e.target as HTMLInputElement).value))} />
        </div>

        <div class="form-group">
          <label for="default_tab">Default Tab</label>
          <select id="default_tab"
            .value=${this._config.default_tab ?? 'schedule'}
            @change=${(e: Event) => this._updateConfig('default_tab', (e.target as HTMLSelectElement).value)}>
            <option value="schedule">Schedule</option>
            <option value="control">Control</option>
            <option value="ev">EV</option>
            <option value="stats">Stats</option>
          </select>
        </div>

        <div class="section-title">Visibility</div>

        <div class="form-group">
          <div class="checkbox-row">
            <input type="checkbox" id="show_chart"
              .checked=${this._config.show_chart !== false}
              @change=${(e: Event) => this._updateConfig('show_chart', (e.target as HTMLInputElement).checked)} />
            <label for="show_chart">Show Chart</label>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-row">
            <input type="checkbox" id="show_status_bar"
              .checked=${this._config.show_status_bar !== false}
              @change=${(e: Event) => this._updateConfig('show_status_bar', (e.target as HTMLInputElement).checked)} />
            <label for="show_status_bar">Show Status Bar</label>
          </div>
        </div>

        <div class="form-group">
          <label for="show_ev_tab">EV Tab</label>
          <select id="show_ev_tab"
            .value=${this._config.show_ev_tab ?? 'auto'}
            @change=${(e: Event) => this._updateConfig('show_ev_tab', (e.target as HTMLSelectElement).value)}>
            <option value="auto">Auto (show if EV configured)</option>
            <option value="always">Always</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div class="section-title">Display</div>

        <div class="form-group">
          <label for="price_decimals">Price Decimal Places</label>
          <select id="price_decimals"
            .value=${String(this._config.price_decimals ?? 2)}
            @change=${(e: Event) => this._updateConfig('price_decimals', parseInt((e.target as HTMLSelectElement).value))}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-scheduler-card-editor': EnergySchedulerCardEditor;
  }
}
