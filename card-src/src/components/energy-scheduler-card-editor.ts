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

  private _valueChanged(ev: Event): void {
    if (!this._config) return;

    const target = ev.target as HTMLInputElement;
    const configKey = target.id as keyof EnergySchedulerCardConfig;
    let value: string | number | boolean = target.value;

    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = parseInt(target.value, 10);
    }

    const newConfig = {
      ...this._config,
      [configKey]: value,
    };

    this._config = newConfig;

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  protected render() {
    if (!this._config) {
      return html`<div>No configuration</div>`;
    }

    return html`
      <div class="editor">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            .value=${this._config.title ?? 'Energy Scheduler'}
            @change=${this._valueChanged}
          />
        </div>

        <div class="form-group">
          <label for="chart_height">Chart Height (px)</label>
          <input
            type="number"
            id="chart_height"
            .value=${String(this._config.chart_height ?? 250)}
            min="100"
            max="500"
            @change=${this._valueChanged}
          />
        </div>

        <div class="form-group">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="show_chart"
              .checked=${this._config.show_chart !== false}
              @change=${this._valueChanged}
            />
            <label for="show_chart">Show Chart</label>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="show_schedule"
              .checked=${this._config.show_schedule !== false}
              @change=${this._valueChanged}
            />
            <label for="show_schedule">Show Schedule Grid</label>
          </div>
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
