/**
 * Energy Scheduler Pstryk - Lovelace Card for Home Assistant
 * Provides UI for scheduling actions based on energy prices from Pstryk API
 */

// Load Chart.js from CDN
const loadChartJS = () => {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve(window.Chart);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.onload = () => resolve(window.Chart);
    script.onerror = () => reject(new Error('Failed to load Chart.js'));
    document.head.appendChild(script);
  });
};

class EnergySchedulerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._data = null;
    this._schedule = {};
    this._chartInstance = null;
    this._dialogOpen = false;
    this._initialized = false;
    this._refreshInterval = null;
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

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialize();
    } else {
      this._updateCurrentMode();
    }
  }

  setConfig(config) {
    this._config = {
      title: config.title || 'Energy Scheduler',
      show_chart: config.show_chart !== false,
      show_schedule: config.show_schedule !== false,
      chart_height: config.chart_height || 250,
      ...config
    };

    if (this._initialized) {
      this._render();
    }
  }

  getCardSize() {
    let size = 1; // Header
    if (this._config?.show_chart) size += 4;
    if (this._config?.show_schedule) size += 6;
    return size;
  }

  connectedCallback() {
    if (this._initialized && !this._refreshInterval) {
      this._startAutoRefresh();
    }
    // Recreate chart when card becomes visible again (tab switch)
    if (this._initialized && this._config?.show_chart && !this._chartInstance) {
      this._setupChart();
    }
  }

  disconnectedCallback() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }
  }

  _formatDate(date) {
    // Use local timezone, not UTC
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
    const dayName = dayNames[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${dayName} ${day}/${month} ${this._formatHour(hour)}`;
  }

  _formatShortDate(date) {
    const d = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  }

  async _initialize() {
    this._initialized = true;
    this._render();
    await this._loadIntegrationConfig();
    await this._loadData();
    if (this._config.show_chart) {
      await this._setupChart();
    }
    this._startAutoRefresh();
  }

  async _loadIntegrationConfig() {
    try {
      const response = await this._hass.callApi('GET', 'energy_scheduler_pstryk/config');
      this._integrationConfig = response;
    } catch (error) {
      console.error('Failed to load integration config:', error);
    }
  }

  async _loadData() {
    try {
      const response = await this._hass.callApi('GET', 'energy_scheduler_pstryk/data');
      this._data = response;
      this._schedule = response.schedule || {};
      this._updateChart();
      this._updateScheduleList();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async _saveSchedule(date, hour, action, socLimit, socLimitType, fullHour, minutes, evCharging) {
    try {
      await this._hass.callApi('POST', 'energy_scheduler_pstryk/schedule', {
        date,
        hour: parseInt(hour),
        action,
        soc_limit: socLimit,
        soc_limit_type: socLimitType,
        full_hour: fullHour,
        minutes: minutes,
        ev_charging: evCharging
      });
      await this._loadData();
      this._showNotification('Schedule saved');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      this._showNotification('Failed to save', 'error');
    }
  }

  async _clearSchedule(date, hour) {
    try {
      let url = `energy_scheduler_pstryk/schedule?date=${date}`;
      if (hour !== undefined) {
        url += `&hour=${hour}`;
      }
      await this._hass.callApi('DELETE', url);
      await this._loadData();
      this._showNotification('Schedule cleared');
    } catch (error) {
      console.error('Failed to clear schedule:', error);
      this._showNotification('Failed to clear', 'error');
    }
  }

  _startAutoRefresh() {
    if (this._refreshInterval) return;
    this._refreshInterval = setInterval(() => {
      this._loadData();
    }, 60000);
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = this._getStyles();

    const card = document.createElement('ha-card');
    card.innerHTML = this._getTemplate();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(card);

    this._setupEventListeners();
  }

  _getStyles() {
    return `
      :host {
        --chart-height: ${this._config?.chart_height || 250}px;
      }

      ha-card {
        padding: 16px;
        overflow: hidden;
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

      .header-info {
        font-size: 12px;
        color: var(--secondary-text-color);
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
      }

      .hour-slot:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .hour-slot.scheduled {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .hour-slot.current {
        border-color: var(--success-color, #4CAF50);
        background: rgba(76, 175, 80, 0.1);
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
        margin-bottom: 12px;
      }

      .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        font-size: 12px;
      }

      .form-group select,
      .form-group input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        box-sizing: border-box;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
      }

      .checkbox-group input[type="checkbox"] {
        width: auto;
      }

      .modal-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
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
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .chart-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: var(--chart-height);
        color: var(--secondary-text-color);
        font-size: 13px;
      }
    `;
  }

  _getTemplate() {
    return `
      <div class="card-header">
        <h2>⚡ ${this._config?.title || 'Energy Scheduler'}</h2>
        <span class="header-info">48h</span>
      </div>

      ${this._config?.show_chart ? `
        <div class="chart-section">
          <div class="chart-container">
            <canvas id="priceChart"></canvas>
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
            <div class="empty-state">Loading...</div>
          </div>
        </div>
      ` : ''}

      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">Schedule</h3>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>

          <div class="price-info">
            <div class="row">
              <span>Buy:</span>
              <span id="modalBuyPrice">--</span>
            </div>
            <div class="row">
              <span>Sell:</span>
              <span id="modalSellPrice">--</span>
            </div>
          </div>

          <div class="form-group">
            <label for="actionSelect">Action</label>
            <select id="actionSelect">
              <option value="">-- Select --</option>
            </select>
          </div>

          <div class="form-group" id="evChargingGroup" style="display: none;">
            <div class="checkbox-group">
              <input type="checkbox" id="evCharging">
              <label for="evCharging">🚗 EV Charging (auto-stop when complete)</label>
            </div>
          </div>

          <div class="form-group" id="socLimitGroup" style="display: none;">
            <label for="socLimitType">SOC Limit Type</label>
            <select id="socLimitType">
              <option value="max">🔋 Charge to (stop when SOC ≥)</option>
              <option value="min">⚡ Discharge to (stop when SOC ≤)</option>
            </select>
          </div>

          <div class="form-group" id="socLimitValueGroup" style="display: none;">
            <label for="socLimit">SOC Limit: <span id="socLimitValue">100%</span></label>
            <input type="range" id="socLimit" min="0" max="100" value="100">
          </div>

          <div class="form-group" id="fullHourGroup" style="display: none;">
            <div class="checkbox-group">
              <input type="checkbox" id="fullHour">
              <label for="fullHour">Full hour</label>
            </div>
          </div>

          <div class="form-group" id="minutesGroup" style="display: none;">
            <label for="minutes">Minutes: <span id="minutesValue">30</span></label>
            <input type="range" id="minutes" min="1" max="60" value="30">
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="modalCancel">Cancel</button>
            <button class="btn btn-danger" id="modalClear" style="display: none;">Clear</button>
            <button class="btn btn-primary" id="modalSave">Save</button>
          </div>
        </div>
      </div>

      <div class="notification" id="notification"></div>
    `;
  }

  _setupEventListeners() {
    const root = this.shadowRoot;

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

    if (minutes) {
      minutes.addEventListener('input', (e) => {
        root.getElementById('minutesValue').textContent = e.target.value;
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
        // When EV charging is checked, hide SOC limit (use EV sensor instead)
        const socGroup = root.getElementById('socLimitGroup');
        if (socGroup) {
          socGroup.style.display = e.target.checked ? 'none' : 'block';
        }
      });
    }
  }

  async _setupChart() {
    const canvas = this.shadowRoot.getElementById('priceChart');
    if (!canvas) return;

    try {
      await loadChartJS();

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
            const canvas = event.native?.target;
            if (canvas) {
              canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
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

  _updateScheduleList() {
    const grid = this.shadowRoot.getElementById('scheduleGrid');
    if (!grid) return;

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
      const isCurrent = h.date === today && h.hour === currentHour;

      let classes = 'hour-slot';
      if (isScheduled) classes += ' scheduled';
      if (isCurrent) classes += ' current';

      const evIndicator = schedule?.ev_charging ? '🚗 ' : '';

      html += `
        <div class="${classes}" data-date="${h.date}" data-hour="${h.hour}">
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
      html = '<div class="empty-state">No data</div>';
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.hour-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const date = slot.dataset.date;
        const hour = parseInt(slot.dataset.hour);
        this._openModal(date, hour);
      });
    });

    this._updateCurrentMode();
  }

  _updateCurrentMode() {
    const modeEntity = this._integrationConfig?.inverter_mode_entity;
    if (modeEntity && this._hass) {
      const state = this._hass.states[modeEntity];
      const modeValue = this.shadowRoot.getElementById('currentModeValue');
      if (state && modeValue) {
        modeValue.textContent = state.state;
      }
    }
  }

  _openModal(date, hour) {
    const modal = this.shadowRoot.getElementById('modalOverlay');
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
      this.shadowRoot.getElementById('minutesValue').textContent = schedule.minutes || 30;
      this.shadowRoot.getElementById('evCharging').checked = schedule.ev_charging || false;
      this.shadowRoot.getElementById('modalClear').style.display = 'block';
    } else {
      this.shadowRoot.getElementById('socLimitType').value = 'max';
      this.shadowRoot.getElementById('socLimit').value = 100;
      this.shadowRoot.getElementById('socLimitValue').textContent = '100%';
      this.shadowRoot.getElementById('fullHour').checked = false;
      this.shadowRoot.getElementById('minutes').value = 30;
      this.shadowRoot.getElementById('minutesValue').textContent = '30';
      this.shadowRoot.getElementById('evCharging').checked = false;
      this.shadowRoot.getElementById('modalClear').style.display = 'none';
    }

    this._toggleParameterFields(schedule?.action || '');

    this._modalDate = date;
    this._modalHour = hour;
    this._dialogOpen = true;

    modal.classList.add('open');
  }

  _closeModal() {
    const modal = this.shadowRoot.getElementById('modalOverlay');
    if (modal) modal.classList.remove('open');
    this._dialogOpen = false;
  }

  _toggleParameterFields(action) {
    const defaultMode = this._data?.default_mode || '';
    const isNonDefault = action && action !== defaultMode && action !== '';
    const hasEvSensor = !!this._integrationConfig?.ev_sensor;
    const hasSocSensor = !!this._integrationConfig?.soc_sensor;

    const socGroup = this.shadowRoot.getElementById('socLimitGroup');
    const socValueGroup = this.shadowRoot.getElementById('socLimitValueGroup');
    const fullHourGroup = this.shadowRoot.getElementById('fullHourGroup');
    const minutesGroup = this.shadowRoot.getElementById('minutesGroup');
    const evChargingGroup = this.shadowRoot.getElementById('evChargingGroup');

    // Show EV charging option only if EV sensor is configured and action is non-default
    if (evChargingGroup) {
      evChargingGroup.style.display = isNonDefault && hasEvSensor ? 'block' : 'none';
    }

    // Check if EV charging is selected to hide SOC limit
    const evChargingChecked = this.shadowRoot.getElementById('evCharging')?.checked;

    // Show SOC limit only if SOC sensor is configured and not using EV charging
    const showSocLimit = isNonDefault && hasSocSensor && !evChargingChecked;
    if (socGroup) socGroup.style.display = showSocLimit ? 'block' : 'none';
    if (socValueGroup) socValueGroup.style.display = showSocLimit ? 'block' : 'none';
    if (fullHourGroup) fullHourGroup.style.display = isNonDefault ? 'block' : 'none';

    const fullHourChecked = this.shadowRoot.getElementById('fullHour')?.checked;
    if (minutesGroup) {
      minutesGroup.style.display = isNonDefault && !fullHourChecked ? 'block' : 'none';
    }
  }

  async _handleSave() {
    const action = this.shadowRoot.getElementById('actionSelect').value;

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
      evCharging = this.shadowRoot.getElementById('evCharging').checked;
      // Only set SOC limit if not using EV charging (EV uses its own sensor)
      if (!evCharging && this._integrationConfig?.soc_sensor) {
        socLimit = parseInt(this.shadowRoot.getElementById('socLimit').value);
        socLimitType = this.shadowRoot.getElementById('socLimitType').value;
      }
      fullHour = this.shadowRoot.getElementById('fullHour').checked;
      if (!fullHour) {
        minutes = parseInt(this.shadowRoot.getElementById('minutes').value);
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

  _showNotification(message, type = 'success') {
    const notification = this.shadowRoot.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }
}

// Card Editor
class EnergySchedulerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  _render() {
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

    this.shadowRoot.getElementById('title').addEventListener('change', (e) => {
      this._updateConfig('title', e.target.value);
    });
    this.shadowRoot.getElementById('chart_height').addEventListener('change', (e) => {
      this._updateConfig('chart_height', parseInt(e.target.value));
    });
    this.shadowRoot.getElementById('show_chart').addEventListener('change', (e) => {
      this._updateConfig('show_chart', e.target.checked);
    });
    this.shadowRoot.getElementById('show_schedule').addEventListener('change', (e) => {
      this._updateConfig('show_schedule', e.target.checked);
    });
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

customElements.define('energy-scheduler-card', EnergySchedulerCard);
customElements.define('energy-scheduler-card-editor', EnergySchedulerCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-scheduler-card',
  name: 'Energy Scheduler Card',
  description: 'Schedule energy actions based on electricity prices',
  preview: true
});

console.info('%c ENERGY-SCHEDULER-CARD %c v1.0.0 ',
  'color: white; background: #2196F3; font-weight: bold;',
  'color: #2196F3; background: white; font-weight: bold;'
);
