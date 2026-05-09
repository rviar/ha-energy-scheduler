import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cardStyles } from '@/styles';
import type {
  HomeAssistant,
  EnergySchedulerCardConfig,
  IntegrationConfig,
  ScheduleData,
} from '@/types';
import { fetchConfig, fetchData, EVENT_SCHEDULE_UPDATED, CARD_VERSION } from '@/utils';

import './shared/status-bar';
import './shared/tab-bar';
import './tabs/schedule-tab';
import './tabs/ev-tab';
import './tabs/stats-tab';

@customElement('energy-scheduler-card')
export class EnergySchedulerCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private _config?: EnergySchedulerCardConfig;
  @state() private _integrationConfig?: IntegrationConfig;
  @state() private _data?: ScheduleData;
  @state() private _loading = false;
  @state() private _dataLoaded = false;
  @state() private _error?: string;
  @state() private _activeTab = 'schedule';

  private _refreshInterval?: ReturnType<typeof setInterval>;
  private _unsubEvents?: () => void;
  private _initAttempts = 0;
  private _maxInitAttempts = 20;
  private _initRetryTimer?: ReturnType<typeof setTimeout>;
  private _versionChecked = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('data-refresh-needed', this._handleRefreshEvent);
    this.addEventListener('card-state-patch', this._handleStatePatch as EventListener);
    if (this.hass && this._config && !this._dataLoaded && !this._loading) {
      this._tryInitialize();
    }
    if (this._dataLoaded && !this._refreshInterval) {
      this._startAutoRefresh();
    }
    this._checkVersion();
  }

  /**
   * Query the integration for its backend version and prompt the user to
   * reload if the bundled card version differs. Runs once per mount. This
   * protects against stale cached bundles on any platform (browser, mobile
   * companion app) where hard refresh may not be obvious or available.
   */
  private async _checkVersion(): Promise<void> {
    if (this._versionChecked || !this.hass) return;
    this._versionChecked = true;
    try {
      const result = (await this.hass.connection.sendMessagePromise({
        type: 'hacs_energy_scheduler/version',
      })) as { version?: string };
      const backendVersion = result?.version;
      if (backendVersion && backendVersion !== CARD_VERSION) {
        this._showVersionMismatch(backendVersion);
      }
    } catch (err) {
      // Older integration versions may not expose the endpoint — ignore.
      console.debug('[energy-scheduler-card] version check skipped', err);
    }
  }

  private _showVersionMismatch(backendVersion: string): void {
    console.warn(
      `[energy-scheduler-card] Version mismatch — card: ${CARD_VERSION}, integration: ${backendVersion}. Reload to apply updates.`
    );
    this.dispatchEvent(
      new CustomEvent('hass-notification', {
        detail: {
          message:
            `Energy Scheduler card is out of date (card ${CARD_VERSION}, integration ${backendVersion}). Reload to apply the new version.`,
          duration: 0,
          dismissable: true,
          action: { text: 'Reload', action: () => this._reloadWithCacheClear() },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _reloadWithCacheClear = async (): Promise<void> => {
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch (err) {
      console.warn('[energy-scheduler-card] cache clear failed', err);
    }
    window.location.reload();
  };

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('data-refresh-needed', this._handleRefreshEvent);
    this.removeEventListener('card-state-patch', this._handleStatePatch as EventListener);
    this._stopAutoRefresh();
    this._unsubscribeEvents();
    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = undefined;
    }
  }

  setConfig(config: EnergySchedulerCardConfig): void {
    this._config = {
      title: 'Energy Scheduler',
      show_chart: true,
      show_status_bar: true,
      show_ev_tab: 'auto',
      chart_height: 250,
      default_tab: 'schedule',
      price_decimals: 2,
      ...config,
    };
    this._activeTab = this._config.default_tab ?? 'schedule';

    if (this.hass && !this._dataLoaded && !this._loading) {
      this._tryInitialize();
    }
  }

  static getConfigElement(): HTMLElement {
    return document.createElement('energy-scheduler-card-editor');
  }

  static getStubConfig(): EnergySchedulerCardConfig {
    return {
      type: 'custom:energy-scheduler-card',
      title: 'Energy Scheduler',
      show_chart: true,
      show_status_bar: true,
      chart_height: 250,
      default_tab: 'schedule',
    };
  }

  getCardSize(): number {
    return 8;
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has('hass')) {
      const firstHass = !changedProps.get('hass') && this.hass;
      if (firstHass && this._config && !this._dataLoaded && !this._loading) {
        this._tryInitialize();
      }
    }
  }

  private _isHassReady(): boolean {
    return !!this.hass && typeof this.hass.callApi === 'function' && this.hass.connected !== false;
  }

  private _tryInitialize(): void {
    if (this._loading || this._dataLoaded) return;

    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = undefined;
    }

    if (!this._isHassReady()) {
      this._initAttempts++;
      if (this._initAttempts < this._maxInitAttempts) {
        const delay = Math.min(100 * Math.pow(1.5, this._initAttempts), 2000);
        this._initRetryTimer = setTimeout(() => {
          this._initRetryTimer = undefined;
          this._tryInitialize();
        }, delay);
        return;
      }
    }

    this._initAttempts = 0;
    this._initialize();
  }

  private async _initialize(): Promise<void> {
    if (this._loading || this._dataLoaded) return;
    this._loading = true;
    this._error = undefined;

    try {
      await this._loadData();
      this._dataLoaded = true;
      this._startAutoRefresh();
      this._subscribeEvents();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load data';
      setTimeout(() => {
        this._loading = false;
        this._initAttempts = 0;
        if (this.hass && this._config) this._tryInitialize();
      }, 5000);
    } finally {
      this._loading = false;
    }
  }

  private async _loadData(): Promise<void> {
    if (!this.hass) throw new Error('Home Assistant not available');
    const [config, data] = await Promise.all([
      fetchConfig(this.hass),
      fetchData(this.hass),
    ]);
    this._integrationConfig = config;
    this._data = data;
  }

  private _startAutoRefresh(): void {
    if (this._refreshInterval) return;
    this._refreshInterval = setInterval(() => this._refreshData(), 60000);
  }

  private _stopAutoRefresh(): void {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = undefined;
    }
  }

  private _subscribing = false;

  private _subscribeEvents(): void {
    if (this._unsubEvents || this._subscribing || !this.hass?.connection) return;
    this._subscribing = true;
    this.hass.connection.subscribeEvents(
      () => this._refreshData(),
      EVENT_SCHEDULE_UPDATED,
    ).then((unsub) => {
      this._unsubEvents = unsub;
      this._stopAutoRefresh();
    }).catch(() => {
      // Subscription failed — polling fallback remains active
    }).finally(() => {
      this._subscribing = false;
    });
  }

  private _unsubscribeEvents(): void {
    if (this._unsubEvents) {
      this._unsubEvents();
      this._unsubEvents = undefined;
    }
  }

  private async _refreshData(): Promise<void> {
    if (!this.hass || !this._dataLoaded) return;
    try {
      const [config, data] = await Promise.all([
        fetchConfig(this.hass),
        fetchData(this.hass),
      ]);
      this._integrationConfig = config;
      this._data = data;
    } catch {
      // Silent refresh failure
    }
  }

  private _handleRefreshEvent = () => {
    this._refreshData();
  };

  private _handleStatePatch = (
    e: CustomEvent<{ integrationConfig?: Partial<IntegrationConfig>; data?: Partial<ScheduleData> }>
  ) => {
    const patch = e.detail;
    if (patch.integrationConfig) {
      this._integrationConfig = {
        ...(this._integrationConfig ?? {}),
        ...patch.integrationConfig,
      } as IntegrationConfig;
    }
    if (patch.data) {
      this._data = {
        ...(this._data ?? {}),
        ...patch.data,
      } as ScheduleData;
    }
  };

  private _onTabChanged(e: CustomEvent) {
    this._activeTab = e.detail.tab;
  }

  private _getCurrency(): string {
    return this._integrationConfig?.currency ?? this._config?.currency ?? '\u20ac';
  }

  private _shouldShowEvTab(): boolean {
    const setting = this._config?.show_ev_tab ?? 'auto';
    if (setting === 'always') return true;
    if (setting === 'never') return false;
    return this._integrationConfig?.ev_enabled ?? false;
  }

  render() {
    if (!this._config) return html`<ha-card>No configuration</ha-card>`;
    const currency = this._getCurrency();

    return html`
      <ha-card>
        ${this._config.title
          ? html`
              <div class="card-header">
                <div class="card-header-icon">
                  <ha-icon icon="mdi:flash"></ha-icon>
                </div>
                <div class="card-header-title">${this._config.title}</div>
              </div>
            `
          : nothing}
        <div class="card-content">
          ${this._config.show_status_bar !== false && this._dataLoaded
            ? html`
                <es-status-bar
                  .hass=${this.hass}
                  .data=${this._data}
                  .integrationConfig=${this._integrationConfig}
                  .priceDecimals=${this._config.price_decimals ?? 2}
                  .currency=${currency}
                ></es-status-bar>
              `
            : nothing}

          ${this._dataLoaded
            ? html`
                <es-tab-bar
                  .activeTab=${this._activeTab}
                  .showEvTab=${this._shouldShowEvTab()}
                  @tab-changed=${this._onTabChanged}
                ></es-tab-bar>
              `
            : nothing}

          ${this._loading && !this._dataLoaded ? this._renderLoading() : nothing}
          ${this._error ? this._renderError() : nothing}
          ${this._dataLoaded ? this._renderActiveTab() : nothing}
        </div>
        <div class="notification" id="notification"></div>
      </ha-card>
    `;
  }

  private _renderLoading() {
    return html`
      <div class="card-loading">
        <div class="card-loading-spinner"></div>
        <span class="card-loading-text">Loading schedule...</span>
      </div>
    `;
  }

  private _renderError() {
    return html`
      <div class="card-error">
        <div class="card-error-icon">\u26a0\ufe0f</div>
        <div class="card-error-message">${this._error}</div>
        <button class="btn btn-primary" @click=${() => {
          this._loading = false;
          this._dataLoaded = false;
          this._error = undefined;
          this._initialize();
        }}>Retry</button>
      </div>
    `;
  }

  private _renderActiveTab() {
    const currency = this._getCurrency();
    switch (this._activeTab) {
      case 'schedule':
        return html`
          <es-schedule-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
            .cardConfig=${this._config}
            .currency=${currency}
          ></es-schedule-tab>
        `;
      case 'ev':
        return html`
          <es-ev-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
          ></es-ev-tab>
        `;
      case 'stats':
        return html`
          <es-stats-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
            .priceDecimals=${this._config?.price_decimals ?? 2}
            .currency=${currency}
          ></es-stats-tab>
        `;
      default:
        return nothing;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-scheduler-card': EnergySchedulerCard;
  }
}
