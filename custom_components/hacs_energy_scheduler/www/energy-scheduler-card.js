// First line - verify file loading (appears before any other code)
console.log('%c[Energy Scheduler] File loading started v1.5.0 @ ' + new Date().toISOString(), 'background: #222; color: #bada55; font-size: 14px;');

// Global error handler to catch any parsing/loading errors
window.__energySchedulerLoaded = false;
window.__energySchedulerLoadStart = Date.now();

window.addEventListener('error', function(e) {
  if (e.filename && e.filename.includes('energy-scheduler-card')) {
    console.error('%c[Energy Scheduler] SCRIPT ERROR!', 'background: red; color: white; font-size: 16px;', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error
    });
  }
});

// Check if we're loading too late (card might already be trying to render)
if (document.querySelector('energy-scheduler-card')) {
  console.warn('%c[Energy Scheduler] WARNING: Card element exists before script loaded!', 'background: orange; color: black;');
}

/**
 * HACS Energy Scheduler - Lovelace Card for Home Assistant
 * Provides UI for scheduling actions based on energy prices
 *
 * Best practices applied:
 * - Simple, robust initialization following HA official patterns
 * - setConfig never throws, renders gracefully
 * - hass setter handles reactive updates efficiently
 * - Uses Shadow DOM for encapsulation
 * - Proper lifecycle management with connectedCallback/disconnectedCallback
 */

// Version for cache busting and debugging
const CARD_VERSION = '1.5.0';

// Debug mode - set to true for verbose logging
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[Energy Scheduler]', ...args);
const logWarn = (...args) => console.warn('[Energy Scheduler]', ...args);
const logError = (...args) => console.error('[Energy Scheduler]', ...args);

// Chart.js loading state (singleton)
let chartJSPromise = null;
let chartJSLoaded = false;

const loadChartJS = () => {
  if (chartJSLoaded && window.Chart) {
    return Promise.resolve(window.Chart);
  }

  if (chartJSPromise) {
    return chartJSPromise;
  }

  chartJSPromise = new Promise((resolve, reject) => {
    if (window.Chart) {
      chartJSLoaded = true;
      resolve(window.Chart);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.async = true;

    script.onload = () => {
      chartJSLoaded = true;
      resolve(window.Chart);
    };

    script.onerror = () => {
      chartJSPromise = null; // Allow retry
      reject(new Error('Failed to load Chart.js'));
    };

    document.head.appendChild(script);
  });

  return chartJSPromise;
};

class EnergySchedulerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Internal state
    this._hass = null;
    this._config = null;
    this._rendered = false;
    this._dataLoaded = false;
    this._loadingData = false;
    this._initAttempts = 0;
    this._maxInitAttempts = 20; // Max attempts to wait for connection
    this._initRetryTimer = null;

    // Data state
    this._data = null;
    this._schedule = {};
    this._integrationConfig = null;

    // UI state
    this._chartInstance = null;
    this._chartHoursData = [];
    this._refreshInterval = null;
    this._resizeObserver = null;

    // Modal state
    this._modalDate = null;
    this._modalHour = null;

    log('Constructor called');
  }

  static getConfigElement() {
    return document.createElement('energy-scheduler-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Energy Scheduler',
      show_chart: true,
      show_schedule: true,
      chart_height: 250
    };
  }

  /**
   * Home Assistant calls this setter whenever hass object updates.
   * This is the MAIN reactive entry point - keep it simple and fast.
   */
  set hass(hass) {
    const firstHass = !this._hass && hass;
    const prevHass = this._hass;
    this._hass = hass;

    if (firstHass) {
      log('First hass received', {
        hasConnection: !!hass?.connection,
        hasCallApi: typeof hass?.callApi === 'function',
        connected: hass?.connected,
        hasConfig: !!this._config
      });
    }

    // If this is the first time we have hass and we have config, try to initialize
    if (firstHass && this._config) {
      this._tryInitialize();
    }

    // If we were waiting for connection and now have it, try again
    if (!firstHass && this._config && !this._dataLoaded && !this._loadingData) {
      const wasConnected = prevHass?.connected;
      const nowConnected = hass?.connected;
      if (!wasConnected && nowConnected) {
        log('Connection became ready, retrying initialization');
        this._tryInitialize();
      }
    }

    // Update mode display if we have data
    if (this._dataLoaded) {
      this._updateCurrentMode();
    }
  }

  get hass() {
    return this._hass;
  }

  /**
   * Check if hass is ready for API calls
   */
  _isHassReady() {
    if (!this._hass) return false;
    if (typeof this._hass.callApi !== 'function') return false;
    // Check connection state if available
    if (this._hass.connected === false) return false;
    return true;
  }

  /**
   * Lovelace calls this once when card is added/configured.
   * CRITICAL: Must NOT throw errors - causes "Configuration Error" in UI.
   */
  setConfig(config) {
    log('setConfig called', { hasHass: !!this._hass, config });

    try {
      // Store config with defaults
      this._config = {
        title: config?.title || 'Energy Scheduler',
        show_chart: config?.show_chart !== false,
        show_schedule: config?.show_schedule !== false,
        chart_height: config?.chart_height || 250,
        ...(config || {})
      };

      // Render the card structure immediately
      this._renderCard();
      this._rendered = true;

      // If we already have hass, try to initialize data loading
      if (this._hass) {
        this._tryInitialize();
      }
    } catch (e) {
      // Log error but don't throw - this prevents "Configuration Error"
      logError('setConfig error', e);
      this._renderError('Configuration error: ' + e.message);
    }
  }

  getCardSize() {
    let size = 1;
    if (this._config?.show_chart) size += 4;
    if (this._config?.show_schedule) size += 6;
    return size;
  }

  /**
   * Called when card is added to DOM.
   */
  connectedCallback() {
    log('connectedCallback', {
      dataLoaded: this._dataLoaded,
      hasConfig: !!this._config,
      hasHass: !!this._hass
    });

    // Restart refresh interval if we were previously loaded
    if (this._dataLoaded && !this._refreshInterval) {
      this._startAutoRefresh();
    }

    // Recreate chart if needed (tab switch scenario)
    if (this._dataLoaded && this._config?.show_chart && !this._chartInstance) {
      this._setupChart();
    }

    // If we have config and hass but haven't loaded data, try again
    if (this._config && this._hass && !this._dataLoaded && !this._loadingData) {
      log('connectedCallback: Retrying initialization');
      this._tryInitialize();
    }
  }

  /**
   * Called when card is removed from DOM.
   */
  disconnectedCallback() {
    log('disconnectedCallback');
    this._stopAutoRefresh();
    this._destroyChart();
    // Clear any pending init retry
    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = null;
    }
  }

  // ==================== Initialization ====================

  /**
   * Try to initialize the card - checks if hass is ready first
   * Will retry with polling if connection isn't ready yet
   */
  _tryInitialize() {
    // Prevent duplicate initialization
    if (this._loadingData || this._dataLoaded) {
      log('_tryInitialize: Already loading or loaded, skipping');
      return;
    }

    // Clear any pending retry
    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = null;
    }

    // Check if hass is ready
    if (!this._isHassReady()) {
      this._initAttempts++;
      log(`_tryInitialize: Hass not ready, attempt ${this._initAttempts}/${this._maxInitAttempts}`, {
        hasHass: !!this._hass,
        hasCallApi: typeof this._hass?.callApi === 'function',
        connected: this._hass?.connected
      });

      if (this._initAttempts < this._maxInitAttempts) {
        // Exponential backoff: 100ms, 200ms, 400ms, ... up to 2s
        const delay = Math.min(100 * Math.pow(1.5, this._initAttempts), 2000);
        log(`_tryInitialize: Scheduling retry in ${delay}ms`);
        this._initRetryTimer = setTimeout(() => {
          this._initRetryTimer = null;
          this._tryInitialize();
        }, delay);
        return;
      } else {
        logWarn('_tryInitialize: Max attempts reached, forcing initialization anyway');
        // Fall through to try initialization anyway
      }
    }

    log('_tryInitialize: Hass is ready, starting initialization');
    this._initAttempts = 0;
    this._initialize();
  }

  /**
   * Initialize the card - load data from API
   * Called when we have both config and hass is ready
   */
  async _initialize() {
    // Prevent duplicate initialization
    if (this._loadingData || this._dataLoaded) {
      return;
    }

    this._loadingData = true;
    this._showLoadingState();
    log('_initialize: Starting data load');

    try {
      await this._loadData();
      this._dataLoaded = true;
      log('_initialize: Data loaded successfully');
      this._updateUI();
      this._startAutoRefresh();
    } catch (error) {
      logError('_initialize: Failed to load data', error);
      this._showError(error.message || 'Failed to load data');
      // Schedule retry after 5 seconds
      setTimeout(() => {
        this._loadingData = false;
        this._initAttempts = 0; // Reset attempts for fresh retry
        if (this._hass && this._config) {
          this._tryInitialize();
        }
      }, 5000);
    } finally {
      this._loadingData = false;
    }
  }

  /**
   * Load data from API with retries
   */
  async _loadData() {
    const MAX_RETRIES = 5;
    const BASE_DELAY = 500;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        log(`_loadData: Attempt ${attempt}/${MAX_RETRIES}`);

        // Validate hass is ready
        if (!this._hass) {
          throw new Error('Home Assistant not available');
        }

        if (typeof this._hass.callApi !== 'function') {
          throw new Error('Home Assistant API not ready (callApi not a function)');
        }

        // Check connection status
        if (this._hass.connected === false) {
          throw new Error('Home Assistant not connected');
        }

        log('_loadData: Making API calls...');

        // Load config and data in parallel
        const [configResult, dataResult] = await Promise.all([
          this._hass.callApi('GET', 'hacs_energy_scheduler/config'),
          this._hass.callApi('GET', 'hacs_energy_scheduler/data')
        ]);

        log('_loadData: API responses received', {
          configResult: !!configResult,
          dataResult: !!dataResult
        });

        if (!configResult || !dataResult) {
          throw new Error('Invalid API response (null or undefined)');
        }

        this._integrationConfig = configResult;
        this._data = dataResult;
        this._schedule = dataResult?.schedule || {};

        log('_loadData: Success!');
        return;

      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);

        logWarn(`_loadData: Attempt ${attempt} failed:`, error.message);

        if (isLastAttempt) {
          throw error;
        }

        log(`_loadData: Retrying in ${delay}ms...`);
        await this._delay(delay);
      }
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== Lifecycle Helpers ====================

  _startAutoRefresh() {
    if (this._refreshInterval) return;
    this._refreshInterval = setInterval(() => {
      this._refreshData();
    }, 60000);
  }

  _stopAutoRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  _destroyChart() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }
  }

  async _refreshData() {
    if (!this._hass || !this._dataLoaded) return;

    try {
      const data = await this._hass.callApi('GET', 'hacs_energy_scheduler/data');
      this._data = data;
      this._schedule = data?.schedule || {};
      this._updateScheduleGrid();
      this._updateChart();
    } catch (error) {
      console.error('Energy Scheduler: Refresh failed', error);
    }
  }

  // ==================== UI Rendering ====================

  /**
   * Render the main card structure
   * Called once from setConfig
   */
  _renderCard() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <h2>⚡ ${this._config?.title || 'Energy Scheduler'}</h2>
            <div class="header-actions">
              <button class="optimize-btn" id="optimizeBtn" title="Run optimization">
                <span class="icon">🔄</span>
                <span class="text">Optimize</span>
              </button>
            </div>
          </div>

          ${this._config?.show_chart ? `
            <div class="chart-section">
              <div class="chart-container">
                <div class="chart-loading" id="chartLoading">Loading chart...</div>
                <canvas id="priceChart" style="display: none;"></canvas>
              </div>
            </div>
          ` : ''}

          ${this._config?.show_schedule ? `
            <div class="schedule-section">
              <div class="current-mode">
                <span class="label">Mode:</span>
                <span class="value" id="currentModeValue">--</span>
              </div>
              <div class="schedule-grid" id="scheduleGrid">
                <div class="loading-placeholder">
                  <div class="loading-spinner"></div>
                  <span>Loading schedule...</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        ${this._getModalTemplate()}

        <div class="notification" id="notification"></div>
      </ha-card>
    `;

    this._setupEventListeners();
  }

  /**
   * Show loading state within the already rendered card
   */
  _showLoadingState() {
    const grid = this.shadowRoot?.getElementById('scheduleGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-placeholder">
          <div class="loading-spinner"></div>
          <span>Loading schedule...</span>
        </div>
      `;
    }
  }

  /**
   * Show error state within the already rendered card
   */
  _showError(message) {
    const grid = this.shadowRoot?.getElementById('scheduleGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-placeholder">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${message}</div>
          <button class="retry-btn" id="retryBtn">Retry</button>
        </div>
      `;

      this.shadowRoot.getElementById('retryBtn')?.addEventListener('click', () => {
        this._loadingData = false;
        this._dataLoaded = false;
        this._initialize();
      });
    }
  }

  /**
   * Render a complete error card (for critical errors)
   */
  _renderError(message) {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 16px;
        }
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          text-align: center;
        }
        .error-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .error-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
          margin-bottom: 8px;
        }
        .error-message {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
      </style>
      <ha-card>
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div class="error-title">⚡ ${this._config?.title || 'Energy Scheduler'}</div>
          <div class="error-message">${message || 'Failed to load'}</div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Update all UI components after data is loaded
   */
  _updateUI() {
    this._updateScheduleGrid();
    this._updateCurrentMode();

    if (this._config?.show_chart) {
      this._setupChart();
    }
  }

  // ==================== Date/Time Formatters ====================

  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  _formatHour(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  _formatDateTime(date, hour) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(date);
    return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ${this._formatHour(hour)}`;
  }

  _formatShortDate(date) {
    const d = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  }

  async _saveSchedule(date, hour, action, socLimit, socLimitType, fullHour, minutes, evCharging) {
    try {
      await this._hass.callApi('POST', 'hacs_energy_scheduler/schedule', {
        date,
        hour: parseInt(hour),
        action,
        soc_limit: socLimit,
        soc_limit_type: socLimitType,
        full_hour: fullHour,
        minutes: minutes,
        ev_charging: evCharging
      });
      await this._refreshData();
      this._showNotification('Schedule saved');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      this._showNotification('Failed to save', 'error');
    }
  }

  async _clearSchedule(date, hour) {
    try {
      let url = `hacs_energy_scheduler/schedule?date=${date}`;
      if (hour !== undefined) {
        url += `&hour=${hour}`;
      }
      await this._hass.callApi('DELETE', url);
      await this._refreshData();
      this._showNotification('Schedule cleared');
    } catch (error) {
      console.error('Failed to clear schedule:', error);
      this._showNotification('Failed to clear', 'error');
    }
  }

  _getStyles() {
    return `
      :host {
        --chart-height: ${this._config?.chart_height || 250}px;
      }

      ha-card {
        overflow: hidden;
      }

      .card-content {
        padding: 16px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .card-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .optimize-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .optimize-btn:hover {
        opacity: 0.85;
        transform: translateY(-1px);
      }

      .optimize-btn:active {
        transform: translateY(0);
      }

      .optimize-btn.loading {
        opacity: 0.7;
        pointer-events: none;
      }

      .optimize-btn .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .chart-section {
        margin-bottom: 16px;
      }

      .chart-container {
        position: relative;
        height: var(--chart-height);
        width: 100%;
      }

      #priceChart {
        width: 100% !important;
        height: 100% !important;
      }

      .chart-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .current-mode {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 13px;
      }

      .current-mode .label {
        color: var(--secondary-text-color);
      }

      .current-mode .value {
        font-weight: 600;
        color: var(--primary-color);
      }

      .schedule-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 6px;
      }

      .loading-placeholder,
      .error-placeholder {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        color: var(--secondary-text-color);
        text-align: center;
        gap: 12px;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--divider-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .error-placeholder .error-icon {
        font-size: 32px;
      }

      .error-placeholder .error-message {
        font-size: 13px;
        max-width: 250px;
      }

      .retry-btn {
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      }

      .retry-btn:hover {
        opacity: 0.9;
      }

      .day-separator {
        grid-column: 1 / -1;
        padding: 6px 0;
        font-weight: 600;
        font-size: 12px;
        color: var(--primary-color);
        border-bottom: 1px solid var(--divider-color);
        margin-top: 4px;
      }

      .day-separator:first-child {
        margin-top: 0;
      }

      .hour-slot {
        padding: 8px 4px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        border: 2px solid transparent;
        font-size: 11px;
        position: relative;
      }

      .hour-slot:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .hour-slot.scheduled {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .hour-slot.scheduled.manual {
        border-color: var(--warning-color, #FF9800);
        background: rgba(255, 152, 0, 0.1);
      }

      .hour-slot.current {
        border-color: var(--success-color, #4CAF50);
        background: rgba(76, 175, 80, 0.1);
      }

      .hour-slot .lock-indicator {
        font-size: 8px;
        position: absolute;
        top: 2px;
        right: 2px;
      }

      .hour-slot .time {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 2px;
      }

      .hour-slot .prices {
        font-size: 9px;
        color: var(--secondary-text-color);
        display: flex;
        justify-content: center;
        gap: 4px;
      }

      .hour-slot .prices .buy {
        color: #2196F3;
      }

      .hour-slot .prices .sell {
        color: #4CAF50;
      }

      .hour-slot .action {
        font-size: 9px;
        margin-top: 2px;
        color: var(--primary-color);
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Modal Dialog */
      .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        justify-content: center;
        align-items: center;
      }

      .modal-overlay.open {
        display: flex;
      }

      .modal {
        background: var(--card-background-color, #fff);
        border-radius: 12px;
        padding: 20px;
        max-width: 360px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .modal-title {
        font-size: 16px;
        font-weight: 500;
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 4px;
        line-height: 1;
      }

      .price-info {
        background: var(--secondary-background-color);
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 12px;
      }

      .price-info .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .price-info .row:last-child {
        margin-bottom: 0;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 13px;
        color: var(--primary-text-color);
      }

      .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      .form-group select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .form-divider {
        height: 1px;
        background: var(--divider-color);
        margin: 16px 0;
      }

      /* Toggle switch */
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
      }

      .toggle-row .toggle-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .toggle-row .toggle-hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--divider-color);
        transition: 0.3s;
        border-radius: 24px;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .toggle-switch input:checked + .toggle-slider {
        background-color: var(--primary-color);
      }

      .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }

      /* Range slider */
      .range-group {
        padding: 8px 0;
      }

      .range-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .range-header .range-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .range-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-color);
        min-width: 40px;
        text-align: right;
      }

      .range-input {
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .range-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      }

      .modal-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .btn {
        flex: 1;
        padding: 10px 12px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .btn:hover {
        opacity: 0.85;
      }

      .btn-primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .btn-secondary {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .btn-danger {
        background: var(--error-color, #F44336);
        color: white;
      }

      .btn-warning {
        background: var(--warning-color, #FF9800);
        color: white;
        flex: 0 0 auto;
      }

      .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 6px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .notification.show {
        opacity: 1;
      }

      .notification.error {
        background: var(--error-color, #F44336);
      }

      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }
    `;
  }

  _getModalTemplate() {
    return `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">Schedule</h3>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>

          <div class="price-info">
            <div class="row">
              <span>📈 Buy:</span>
              <span id="modalBuyPrice">--</span>
            </div>
            <div class="row">
              <span>📉 Sell:</span>
              <span id="modalSellPrice">--</span>
            </div>
          </div>

          <div class="form-group">
            <label for="actionSelect">Inverter Mode</label>
            <select id="actionSelect">
              <option value="">-- Select --</option>
            </select>
          </div>

          <div id="optionsSection" style="display: none;">
            <div class="form-divider"></div>

            <div class="toggle-row" id="evChargingGroup" style="display: none;">
              <div>
                <div class="toggle-label">🚗 EV Charging</div>
                <div class="toggle-hint">Stop when EV condition met</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="evCharging">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="form-divider" id="socDivider" style="display: none;"></div>

            <div id="socSection" style="display: none;">
              <div class="form-group" id="socLimitGroup">
                <label for="socLimitType">SOC Condition</label>
                <select id="socLimitType">
                  <option value="max">Charge to SOC ≥</option>
                  <option value="min">Discharge to SOC ≤</option>
                </select>
              </div>
              <div class="range-group" id="socLimitValueGroup">
                <div class="range-header">
                  <span class="range-label">Target SOC</span>
                  <span class="range-value" id="socLimitValue">100%</span>
                </div>
                <input type="range" class="range-input" id="socLimit" min="0" max="100" value="100">
              </div>
            </div>

            <div class="form-divider" id="durationDivider" style="display: none;"></div>

            <div class="toggle-row" id="fullHourGroup" style="display: none;">
              <div>
                <div class="toggle-label">⏱️ Full Hour</div>
                <div class="toggle-hint">Run for entire hour</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="fullHour">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="range-group" id="minutesGroup" style="display: none;">
              <div class="range-header">
                <span class="range-label">Duration</span>
                <span class="range-value" id="minutesValue">30 min</span>
              </div>
              <input type="range" class="range-input" id="minutes" min="1" max="60" value="30">
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="modalCancel">Cancel</button>
            <button class="btn btn-warning" id="modalUnlock" style="display: none;" title="Remove lock - allows optimization to overwrite">🔓 Unlock</button>
            <button class="btn btn-danger" id="modalClear" style="display: none;">Clear</button>
            <button class="btn btn-primary" id="modalSave">Save</button>
          </div>
        </div>
      </div>
    `;
  }

  _setupEventListeners() {
    const root = this.shadowRoot;
    if (!root) return;

    // Optimize button
    const optimizeBtn = root.getElementById('optimizeBtn');
    if (optimizeBtn) {
      optimizeBtn.addEventListener('click', () => this._runOptimization());
    }

    const modalClose = root.getElementById('modalClose');
    const modalCancel = root.getElementById('modalCancel');
    const modalOverlay = root.getElementById('modalOverlay');
    const modalSave = root.getElementById('modalSave');
    const modalClear = root.getElementById('modalClear');
    const actionSelect = root.getElementById('actionSelect');
    const socLimit = root.getElementById('socLimit');
    const minutes = root.getElementById('minutes');
    const fullHour = root.getElementById('fullHour');
    const evCharging = root.getElementById('evCharging');

    if (modalClose) modalClose.addEventListener('click', () => this._closeModal());
    if (modalCancel) modalCancel.addEventListener('click', () => this._closeModal());
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') this._closeModal();
      });
    }
    if (modalSave) modalSave.addEventListener('click', () => this._handleSave());
    if (modalClear) modalClear.addEventListener('click', () => this._handleClear());

    const modalUnlock = root.getElementById('modalUnlock');
    if (modalUnlock) modalUnlock.addEventListener('click', () => this._handleUnlock());

    if (actionSelect) {
      actionSelect.addEventListener('change', (e) => {
        this._toggleParameterFields(e.target.value);
      });
    }

    if (socLimit) {
      socLimit.addEventListener('input', (e) => {
        root.getElementById('socLimitValue').textContent = `${e.target.value}%`;
      });
    }

    const socLimitType = root.getElementById('socLimitType');
    if (socLimitType) {
      socLimitType.addEventListener('change', (e) => {
        const defaultValue = e.target.value === 'max' ? 100 : 30;
        root.getElementById('socLimit').value = defaultValue;
        root.getElementById('socLimitValue').textContent = `${defaultValue}%`;
      });
    }

    if (minutes) {
      minutes.addEventListener('input', (e) => {
        root.getElementById('minutesValue').textContent = `${e.target.value} min`;
      });
    }

    if (fullHour) {
      fullHour.addEventListener('change', (e) => {
        const minutesGroup = root.getElementById('minutesGroup');
        if (minutesGroup) {
          minutesGroup.style.display = e.target.checked ? 'none' : 'block';
        }
      });
    }

    if (evCharging) {
      evCharging.addEventListener('change', (e) => {
        // When EV charging is checked, hide SOC section (use EV condition instead)
        const socSection = root.getElementById('socSection');
        if (socSection) {
          socSection.style.display = e.target.checked ? 'none' : 'block';
        }
      });
    }
  }

  async _setupChart() {
    const canvas = this.shadowRoot?.getElementById('priceChart');
    const chartLoading = this.shadowRoot?.getElementById('chartLoading');
    if (!canvas) return;

    // Destroy existing chart instance before creating a new one
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }

    try {
      await loadChartJS();

      // Hide loading, show canvas
      if (chartLoading) chartLoading.style.display = 'none';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d');
      const textColor = getComputedStyle(this).getPropertyValue('--primary-text-color') || '#333';
      const gridColor = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';

      this._chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Buy',
              data: [],
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#2196F3',
              pointHoverBackgroundColor: '#2196F3',
              pointBorderColor: '#fff',
              pointHoverBorderColor: '#fff',
              pointBorderWidth: 1,
              pointHoverBorderWidth: 2,
              tension: 0.3,
              fill: false
            },
            {
              label: 'Sell',
              data: [],
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#4CAF50',
              pointHoverBackgroundColor: '#4CAF50',
              pointBorderColor: '#fff',
              pointHoverBorderColor: '#fff',
              pointBorderWidth: 1,
              pointHoverBorderWidth: 2,
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: textColor,
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                font: { size: 11 }
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              titleFont: { size: 12, weight: 'bold' },
              bodyFont: { size: 11 },
              padding: 10,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                title: (context) => {
                  const idx = context[0].dataIndex;
                  const hours = this._chartHoursData || [];
                  if (hours[idx]) {
                    return this._formatDateTime(hours[idx].date, hours[idx].hour);
                  }
                  return context[0].label;
                },
                label: (context) => {
                  const value = context.parsed.y;
                  const label = context.dataset.label;
                  return `${label}: ${value.toFixed(4)}`;
                },
                afterBody: (context) => {
                  const idx = context[0].dataIndex;
                  const hours = this._chartHoursData || [];
                  if (hours[idx]) {
                    const h = hours[idx];
                    const schedule = this._schedule[h.date]?.[h.hour.toString()];
                    if (schedule) {
                      const evIcon = schedule.ev_charging ? '🚗 ' : '';
                      return [`📅 ${evIcon}${schedule.action}`];
                    }
                  }
                  return [];
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: { color: gridColor, drawBorder: false },
              ticks: {
                color: textColor,
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 8,
                font: { size: 9 }
              }
            },
            y: {
              display: true,
              grid: { color: gridColor, drawBorder: false },
              ticks: {
                color: textColor,
                callback: (value) => value.toFixed(2),
                font: { size: 10 }
              },
              beginAtZero: false
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const idx = elements[0].index;
              const hours = this._chartHoursData || [];
              if (hours[idx]) {
                this._openModal(hours[idx].date, hours[idx].hour);
              }
            }
          },
          onHover: (event, elements) => {
            const canvasEl = event.native?.target;
            if (canvasEl) {
              canvasEl.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
          }
        }
      });

      this._updateChart();

      // Setup ResizeObserver to handle tab switches and visibility changes
      if (!this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          if (this._chartInstance && canvas.offsetParent !== null) {
            this._chartInstance.resize();
          }
        });
        this._resizeObserver.observe(canvas.parentElement);
      }
    } catch (error) {
      console.error('Failed to initialize Chart.js:', error);
      if (chartLoading) {
        chartLoading.textContent = 'Failed to load chart';
      }
    }
  }

  _getAvailableHours() {
    const now = new Date();
    const currentHour = now.getHours();
    const today = this._formatDate(now);

    const buyPrices = this._data?.buy_prices || [];
    const sellPrices = this._data?.sell_prices || [];

    const allHours = [];
    const seenKeys = new Set();

    [...buyPrices, ...sellPrices].forEach(p => {
      const key = `${p.date}-${p.hour}`;
      if (seenKeys.has(key)) return;

      if (p.date === today && p.hour < currentHour) return;
      if (p.date < today) return;

      seenKeys.add(key);
      allHours.push({
        date: p.date,
        hour: p.hour,
        buyPrice: buyPrices.find(b => b.date === p.date && b.hour === p.hour)?.value,
        sellPrice: sellPrices.find(s => s.date === p.date && s.hour === p.hour)?.value
      });
    });

    allHours.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour - b.hour;
    });

    return allHours;
  }

  _updateChart() {
    if (!this._data || !this._chartInstance) return;

    const hours = this._getAvailableHours();
    this._chartHoursData = hours;

    const labels = hours.map(h => {
      const now = new Date();
      const today = this._formatDate(now);
      const tomorrow = this._formatDate(new Date(now.getTime() + 86400000));

      if (h.date === today) return this._formatHour(h.hour);
      if (h.date === tomorrow) return 'T+' + this._formatHour(h.hour);
      return this._formatShortDate(h.date).substring(0, 3) + ' ' + this._formatHour(h.hour);
    });

    this._chartInstance.data.labels = labels;
    this._chartInstance.data.datasets[0].data = hours.map(h => h.buyPrice);
    this._chartInstance.data.datasets[1].data = hours.map(h => h.sellPrice);

    const scheduledPoints = hours.map(h => {
      const schedule = this._schedule[h.date]?.[h.hour.toString()];
      return schedule ? 6 : 3;
    });

    this._chartInstance.data.datasets[0].pointRadius = scheduledPoints;
    this._chartInstance.data.datasets[1].pointRadius = scheduledPoints;

    this._chartInstance.update('none');
  }

  _updateScheduleGrid() {
    const grid = this.shadowRoot?.getElementById('scheduleGrid');
    if (!grid || !this._data) return;

    const hours = this._getAvailableHours();

    const now = new Date();
    const currentHour = now.getHours();
    const today = this._formatDate(now);

    let html = '';
    let currentDate = null;

    hours.forEach(h => {
      if (h.date !== currentDate) {
        currentDate = h.date;
        const isToday = h.date === today;
        const isTomorrow = h.date === this._formatDate(new Date(now.getTime() + 86400000));
        let dayLabel = this._formatShortDate(h.date);
        if (isToday) dayLabel = 'Today';
        if (isTomorrow) dayLabel = 'Tomorrow';

        html += `<div class="day-separator">${dayLabel}</div>`;
      }

      const daySchedule = this._schedule[h.date] || {};
      const schedule = daySchedule[h.hour.toString()];
      const isScheduled = !!schedule;
      const isManual = schedule?.manual === true;
      const isCurrent = h.date === today && h.hour === currentHour;

      let classes = 'hour-slot';
      if (isScheduled) classes += ' scheduled';
      if (isManual) classes += ' manual';
      if (isCurrent) classes += ' current';

      const evIndicator = schedule?.ev_charging ? '🚗 ' : '';
      const lockIndicator = isManual ? '<span class="lock-indicator">🔒</span>' : '';

      html += `
        <div class="${classes}" data-date="${h.date}" data-hour="${h.hour}">
          ${lockIndicator}
          <div class="time">${this._formatHour(h.hour)}</div>
          <div class="prices">
            ${h.buyPrice !== undefined ? `<span class="buy">${h.buyPrice.toFixed(2)}</span>` : ''}
            ${h.sellPrice !== undefined ? `<span class="sell">${h.sellPrice.toFixed(2)}</span>` : ''}
          </div>
          ${isScheduled ? `<div class="action">${evIndicator}${schedule.action}</div>` : ''}
        </div>
      `;
    });

    if (html === '') {
      html = '<div class="empty-state">No price data available</div>';
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.hour-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const date = slot.dataset.date;
        const hour = parseInt(slot.dataset.hour);
        this._openModal(date, hour);
      });
    });
  }

  _updateCurrentMode() {
    const modeEntity = this._integrationConfig?.inverter_mode_entity;
    if (modeEntity && this._hass) {
      const state = this._hass.states[modeEntity];
      const modeValue = this.shadowRoot?.getElementById('currentModeValue');
      if (state && modeValue) {
        modeValue.textContent = state.state;
      }
    }
  }

  _openModal(date, hour) {
    const modal = this.shadowRoot?.getElementById('modalOverlay');
    if (!modal) return;

    const hourStr = hour.toString();
    const daySchedule = this._schedule[date] || {};
    const schedule = daySchedule[hourStr];

    this.shadowRoot.getElementById('modalTitle').textContent =
      this._formatDateTime(date, hour);

    const hours = this._getAvailableHours();
    const hourData = hours.find(h => h.date === date && h.hour === hour);

    this.shadowRoot.getElementById('modalBuyPrice').textContent =
      hourData?.buyPrice !== undefined ? hourData.buyPrice.toFixed(4) : 'N/A';
    this.shadowRoot.getElementById('modalSellPrice').textContent =
      hourData?.sellPrice !== undefined ? hourData.sellPrice.toFixed(4) : 'N/A';

    const actionSelect = this.shadowRoot.getElementById('actionSelect');
    const modes = this._data?.inverter_modes || [];
    const defaultMode = this._data?.default_mode || '';

    actionSelect.innerHTML = '<option value="">-- Select --</option>';
    modes.forEach(mode => {
      const selected = schedule?.action === mode ? 'selected' : '';
      const isDefault = mode === defaultMode ? ' *' : '';
      actionSelect.innerHTML += `<option value="${mode}" ${selected}>${mode}${isDefault}</option>`;
    });

    if (schedule) {
      this.shadowRoot.getElementById('socLimitType').value = schedule.soc_limit_type || 'max';
      this.shadowRoot.getElementById('socLimit').value = schedule.soc_limit || 100;
      this.shadowRoot.getElementById('socLimitValue').textContent = `${schedule.soc_limit || 100}%`;
      this.shadowRoot.getElementById('fullHour').checked = schedule.full_hour || false;
      this.shadowRoot.getElementById('minutes').value = schedule.minutes || 30;
      this.shadowRoot.getElementById('minutesValue').textContent = `${schedule.minutes || 30} min`;
      this.shadowRoot.getElementById('evCharging').checked = schedule.ev_charging || false;
      this.shadowRoot.getElementById('modalClear').style.display = 'block';
      // Show unlock button only for manual entries
      this.shadowRoot.getElementById('modalUnlock').style.display = schedule.manual ? 'block' : 'none';
    } else {
      this.shadowRoot.getElementById('socLimitType').value = 'max';
      this.shadowRoot.getElementById('socLimit').value = 100;
      this.shadowRoot.getElementById('socLimitValue').textContent = '100%';
      this.shadowRoot.getElementById('fullHour').checked = true;
      this.shadowRoot.getElementById('minutes').value = 30;
      this.shadowRoot.getElementById('minutesValue').textContent = '30 min';
      this.shadowRoot.getElementById('evCharging').checked = false;
      this.shadowRoot.getElementById('modalClear').style.display = 'none';
      this.shadowRoot.getElementById('modalUnlock').style.display = 'none';
    }

    this._toggleParameterFields(schedule?.action || '');

    this._modalDate = date;
    this._modalHour = hour;

    modal.classList.add('open');
  }

  _closeModal() {
    const modal = this.shadowRoot?.getElementById('modalOverlay');
    if (modal) modal.classList.remove('open');
  }

  _toggleParameterFields(action) {
    const defaultMode = this._data?.default_mode || '';
    const isNonDefault = action && action !== defaultMode && action !== '';
    const hasEvStopCondition = this._integrationConfig?.ev_stop_condition &&
                                Array.isArray(this._integrationConfig.ev_stop_condition) &&
                                this._integrationConfig.ev_stop_condition.length > 0;
    const hasSocSensor = !!this._integrationConfig?.soc_sensor;

    const optionsSection = this.shadowRoot?.getElementById('optionsSection');
    const evChargingGroup = this.shadowRoot?.getElementById('evChargingGroup');
    const socDivider = this.shadowRoot?.getElementById('socDivider');
    const socSection = this.shadowRoot?.getElementById('socSection');
    const fullHourGroup = this.shadowRoot?.getElementById('fullHourGroup');
    const durationDivider = this.shadowRoot?.getElementById('durationDivider');
    const minutesGroup = this.shadowRoot?.getElementById('minutesGroup');

    // Show options section when action is non-default
    if (optionsSection) {
      optionsSection.style.display = isNonDefault ? 'block' : 'none';
    }

    // Show EV charging option only if EV stop condition is configured
    if (evChargingGroup) {
      evChargingGroup.style.display = hasEvStopCondition ? 'flex' : 'none';
    }

    // Check if EV charging is selected to hide SOC section
    const evChargingChecked = this.shadowRoot?.getElementById('evCharging')?.checked;

    // Show SOC section only if SOC sensor is configured and not using EV charging
    const showSocSection = hasSocSensor && !evChargingChecked;

    // Show divider between EV and SOC only if both are visible
    if (socDivider) {
      socDivider.style.display = hasEvStopCondition && showSocSection ? 'block' : 'none';
    }
    if (socSection) {
      socSection.style.display = showSocSection ? 'block' : 'none';
    }

    // Show duration divider and full hour toggle
    if (durationDivider) {
      durationDivider.style.display = 'block';
    }
    if (fullHourGroup) {
      fullHourGroup.style.display = 'flex';
    }

    // Handle full hour toggle state
    const fullHourChecked = this.shadowRoot?.getElementById('fullHour')?.checked;
    if (minutesGroup) {
      minutesGroup.style.display = !fullHourChecked ? 'block' : 'none';
    }
  }

  async _handleSave() {
    const action = this.shadowRoot?.getElementById('actionSelect')?.value;

    if (!action) {
      this._showNotification('Select action', 'error');
      return;
    }

    const defaultMode = this._data?.default_mode || '';
    let socLimit = null;
    let socLimitType = null;
    let fullHour = false;
    let minutes = null;
    let evCharging = false;

    if (action !== defaultMode) {
      const hasEvStopCondition = this._integrationConfig?.ev_stop_condition &&
                                  Array.isArray(this._integrationConfig.ev_stop_condition) &&
                                  this._integrationConfig.ev_stop_condition.length > 0;
      if (hasEvStopCondition) {
        evCharging = this.shadowRoot.getElementById('evCharging')?.checked || false;
      }
      // Only set SOC limit if not using EV charging (EV uses its own stop condition)
      if (!evCharging && this._integrationConfig?.soc_sensor) {
        socLimit = parseInt(this.shadowRoot.getElementById('socLimit')?.value || '100');
        socLimitType = this.shadowRoot.getElementById('socLimitType')?.value || 'max';
      }
      fullHour = this.shadowRoot.getElementById('fullHour')?.checked || false;
      if (!fullHour) {
        minutes = parseInt(this.shadowRoot.getElementById('minutes')?.value || '30');
      }
    }

    await this._saveSchedule(
      this._modalDate,
      this._modalHour,
      action,
      socLimit,
      socLimitType,
      fullHour,
      minutes,
      evCharging
    );

    this._closeModal();
  }

  async _handleClear() {
    await this._clearSchedule(this._modalDate, this._modalHour);
    this._closeModal();
  }

  async _handleUnlock() {
    try {
      const response = await this._hass.callApi(
        'POST',
        'hacs_energy_scheduler/manual',
        {
          date: this._modalDate,
          hour: this._modalHour,
          manual: false
        }
      );

      if (response.success) {
        this._showNotification('Schedule unlocked');
        await this._refreshData();
        this._closeModal();
      } else {
        this._showNotification('Failed to unlock', 'error');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      this._showNotification('Failed to unlock', 'error');
    }
  }

  _showNotification(message, type = 'success') {
    const notification = this.shadowRoot?.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }

  async _runOptimization() {
    const btn = this.shadowRoot?.getElementById('optimizeBtn');
    if (!btn || btn.classList.contains('loading')) return;

    // Set loading state
    btn.classList.add('loading');
    const iconSpan = btn.querySelector('.icon');
    const textSpan = btn.querySelector('.text');
    const originalIcon = iconSpan?.textContent;
    const originalText = textSpan?.textContent;

    if (iconSpan) iconSpan.innerHTML = '<div class="spinner"></div>';
    if (textSpan) textSpan.textContent = 'Running...';

    try {
      await this._hass.callService('hacs_energy_scheduler', 'run_optimization', {
        hours_ahead: 24
      });

      this._showNotification('Optimization complete!');

      // Reload data to show new schedule
      await this._refreshData();
    } catch (error) {
      console.error('Optimization failed:', error);
      this._showNotification('Optimization failed', 'error');
    } finally {
      // Reset button state
      btn.classList.remove('loading');
      if (iconSpan) iconSpan.textContent = originalIcon;
      if (textSpan) textSpan.textContent = originalText;
    }
  }
}

// Card Editor
class EnergySchedulerCardEditor extends HTMLElement {
  constructor() {
    super();
    try {
      this.attachShadow({ mode: 'open' });
    } catch (e) {
      console.warn('Energy Scheduler Editor: Shadow DOM issue:', e.message);
    }
  }

  setConfig(config) {
    try {
      this._config = config || {};
      this._render();
    } catch (e) {
      console.error('Energy Scheduler Editor: setConfig error', e);
    }
  }

  _render() {
    if (!this.shadowRoot) return;

    try {
      this.shadowRoot.innerHTML = `
        <style>
          .editor {
            padding: 16px;
          }
          .form-group {
            margin-bottom: 12px;
          }
          .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            font-size: 14px;
          }
          .form-group input[type="text"],
          .form-group input[type="number"] {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            box-sizing: border-box;
          }
          .checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        </style>
        <div class="editor">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="title" value="${this._config?.title || 'Energy Scheduler'}">
          </div>
          <div class="form-group">
            <label>Chart Height (px)</label>
            <input type="number" id="chart_height" value="${this._config?.chart_height || 250}" min="100" max="500">
          </div>
          <div class="form-group">
            <div class="checkbox-row">
              <input type="checkbox" id="show_chart" ${this._config?.show_chart !== false ? 'checked' : ''}>
              <label for="show_chart">Show Chart</label>
            </div>
          </div>
          <div class="form-group">
            <div class="checkbox-row">
              <input type="checkbox" id="show_schedule" ${this._config?.show_schedule !== false ? 'checked' : ''}>
              <label for="show_schedule">Show Schedule Grid</label>
            </div>
          </div>
        </div>
      `;

      this.shadowRoot.getElementById('title')?.addEventListener('change', (e) => {
        this._updateConfig('title', e.target.value);
      });
      this.shadowRoot.getElementById('chart_height')?.addEventListener('change', (e) => {
        this._updateConfig('chart_height', parseInt(e.target.value));
      });
      this.shadowRoot.getElementById('show_chart')?.addEventListener('change', (e) => {
        this._updateConfig('show_chart', e.target.checked);
      });
      this.shadowRoot.getElementById('show_schedule')?.addEventListener('change', (e) => {
        this._updateConfig('show_schedule', e.target.checked);
      });
    } catch (e) {
      console.error('Energy Scheduler Editor: render error', e);
    }
  }

  _updateConfig(key, value) {
    this._config = { ...this._config, [key]: value };
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

// Store classes globally so they survive iframe recreation
window.EnergySchedulerCard = EnergySchedulerCard;
window.EnergySchedulerCardEditor = EnergySchedulerCardEditor;

const CARD_TYPE = 'energy-scheduler-card';
const EDITOR_TYPE = 'energy-scheduler-card-editor';

// Registration function that can be called multiple times safely
function registerEnergySchedulerCard() {
  try {
    if (!customElements.get(CARD_TYPE)) {
      customElements.define(CARD_TYPE, window.EnergySchedulerCard);
      console.log(`%c[Energy Scheduler] Registered ${CARD_TYPE}`, 'color: #4caf50;');
    }
    if (!customElements.get(EDITOR_TYPE)) {
      customElements.define(EDITOR_TYPE, window.EnergySchedulerCardEditor);
      console.log(`%c[Energy Scheduler] Registered ${EDITOR_TYPE}`, 'color: #4caf50;');
    }
    return true;
  } catch (e) {
    // If registration fails with "already defined", that's actually OK
    if (e.message.includes('already been defined')) {
      console.log('%c[Energy Scheduler] Elements already defined (OK)', 'color: #2196f3;');
      return true;
    }
    console.error('%c[Energy Scheduler] Registration error:', 'color: red;', e);
    return false;
  }
}

// Initial registration
console.log('%c[Energy Scheduler] Starting element registration...', 'color: #ff9800;');
registerEnergySchedulerCard();

// Register with card picker
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: 'Energy Scheduler Card',
    description: 'Schedule energy actions based on electricity prices',
    preview: true,
    documentationURL: 'https://github.com/your-repo/hacs-energy-scheduler'
  });
  console.log('%c[Energy Scheduler] Added to customCards', 'color: #4caf50;');
}

// Log version
console.info(
  `%c ENERGY-SCHEDULER-CARD %c v${CARD_VERSION} %c READY `,
  'color: white; background: #4caf50; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: #4caf50; background: #e8f5e9; font-weight: bold;',
  'color: white; background: #4caf50; border-radius: 0 3px 3px 0;'
);

window.__energySchedulerLoaded = true;
const loadTime = Date.now() - (window.__energySchedulerLoadStart || Date.now());
console.log(`%c[Energy Scheduler] File fully loaded in ${loadTime}ms`, 'background: #222; color: #bada55; font-size: 14px;');

// Monitor for registry clearing and re-register if needed
// This handles the case when HA frontend reloads and clears the registry
let registryCheckInterval = setInterval(() => {
  if (!customElements.get(CARD_TYPE) && window.EnergySchedulerCard) {
    console.warn('%c[Energy Scheduler] Registry cleared, re-registering...', 'background: orange; color: black;');
    if (registerEnergySchedulerCard()) {
      console.log('%c[Energy Scheduler] Re-registration successful!', 'color: #4caf50; font-weight: bold;');
    }
  }
}, 50);

// Stop monitoring after 2 seconds (HA should be stable by then)
setTimeout(() => {
  clearInterval(registryCheckInterval);
  registryCheckInterval = null;

  const finalCheck = customElements.get(CARD_TYPE);
  if (finalCheck) {
    console.log('%c[Energy Scheduler] Final check: Element stable in registry ✓', 'color: #4caf50; font-weight: bold;');
  } else {
    console.error('%c[Energy Scheduler] Final check: Element NOT in registry!', 'background: red; color: white;');
    // One last attempt
    registerEnergySchedulerCard();
  }
}, 2000);
