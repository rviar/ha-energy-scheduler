/**
 * Energy Scheduler Pstryk - Custom Panel for Home Assistant
 * Provides UI for scheduling actions based on energy prices from Pstryk API
 */

class EnergySchedulerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._data = null;
    this._schedule = {};
    this._chart = null;
    this._dialogOpen = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialize();
    }
  }

  setConfig(config) {
    this._config = config;
  }

  _formatDate(date) {
    return date.toISOString().split('T')[0];
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
    await this._loadConfig();
    await this._loadData();
    this._setupChart();
    this._startAutoRefresh();
  }

  async _loadConfig() {
    try {
      const response = await this._hass.callApi('GET', 'energy_scheduler_pstryk/config');
      this._config = response;
    } catch (error) {
      console.error('Failed to load config:', error);
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

  async _saveSchedule(date, hour, action, socLimit, fullHour, minutes) {
    try {
      await this._hass.callApi('POST', 'energy_scheduler_pstryk/schedule', {
        date,
        hour: parseInt(hour),
        action,
        soc_limit: socLimit,
        full_hour: fullHour,
        minutes: minutes
      });
      await this._loadData();
      this._showNotification('Schedule saved successfully');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      this._showNotification('Failed to save schedule', 'error');
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
      this._showNotification('Failed to clear schedule', 'error');
    }
  }

  _startAutoRefresh() {
    setInterval(() => {
      this._loadData();
    }, 60000);
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = this._getStyles();

    const container = document.createElement('div');
    container.className = 'energy-scheduler-container';
    container.innerHTML = this._getTemplate();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    this._setupEventListeners();
  }

  _getStyles() {
    return `
      :host {
        display: block;
        padding: 16px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-family: var(--paper-font-common-base_-_font-family);
      }

      .energy-scheduler-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .header-info {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .card {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
      }

      .card-title {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      .chart-container {
        position: relative;
        height: 300px;
        width: 100%;
      }

      #priceChart {
        width: 100%;
        height: 100%;
      }

      .schedule-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
        margin-top: 16px;
      }

      .day-separator {
        grid-column: 1 / -1;
        padding: 8px 0;
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-color);
        border-bottom: 1px solid var(--divider-color);
        margin-top: 8px;
      }

      .day-separator:first-child {
        margin-top: 0;
      }

      .hour-slot {
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        border: 2px solid transparent;
      }

      .hour-slot:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
        font-size: 16px;
        margin-bottom: 4px;
      }

      .hour-slot .prices {
        font-size: 11px;
        color: var(--secondary-text-color);
        display: flex;
        justify-content: center;
        gap: 8px;
      }

      .hour-slot .prices .buy {
        color: #2196F3;
      }

      .hour-slot .prices .sell {
        color: #4CAF50;
      }

      .hour-slot .action {
        font-size: 11px;
        margin-top: 4px;
        color: var(--primary-color);
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .legend {
        display: flex;
        gap: 20px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
      }

      .legend-color {
        width: 16px;
        height: 3px;
        border-radius: 2px;
      }

      .legend-color.buy {
        background: #2196F3;
      }

      .legend-color.sell {
        background: #4CAF50;
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
        z-index: 1000;
        justify-content: center;
        align-items: center;
      }

      .modal-overlay.open {
        display: flex;
      }

      .modal {
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .modal-title {
        font-size: 20px;
        font-weight: 500;
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 4px;
        line-height: 1;
      }

      .modal-close:hover {
        color: var(--primary-text-color);
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 14px;
      }

      .form-group select,
      .form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-group select:focus,
      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .checkbox-group input[type="checkbox"] {
        width: auto;
      }

      .price-info {
        background: var(--secondary-background-color);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .price-info .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .price-info .row:last-child {
        margin-bottom: 0;
      }

      .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }

      .btn {
        flex: 1;
        padding: 12px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .btn:hover {
        opacity: 0.85;
      }

      .btn-primary {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .btn-secondary {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .btn-danger {
        background: var(--error-color, #F44336);
        color: white;
      }

      .current-mode {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .current-mode .label {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .current-mode .value {
        font-weight: 600;
        font-size: 15px;
      }

      .notification {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-radius: 8px;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s;
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
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      @media (max-width: 600px) {
        .header {
          flex-direction: column;
          align-items: flex-start;
        }

        .schedule-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .hour-slot {
          padding: 8px;
        }

        .hour-slot .time {
          font-size: 13px;
        }

        .hour-slot .prices {
          flex-direction: column;
          gap: 2px;
        }
      }
    `;
  }

  _getTemplate() {
    return `
      <div class="header">
        <h1>⚡ Energy Scheduler</h1>
        <div class="header-info">Next 48 hours</div>
      </div>

      <div class="card">
        <div class="card-title">Energy Prices</div>
        <div class="chart-container">
          <canvas id="priceChart"></canvas>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color buy"></div>
            <span>Buy Price</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sell"></div>
            <span>Sell Price</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Hourly Schedule</div>
        <div class="current-mode" id="currentMode">
          <span class="label">Current Mode:</span>
          <span class="value" id="currentModeValue">Loading...</span>
        </div>
        <div class="schedule-grid" id="scheduleGrid">
          <!-- Hours will be populated here -->
        </div>
      </div>

      <div class="modal-overlay" id="modalOverlay">
        <div class="modal" id="scheduleModal">
          <div class="modal-header">
            <h2 class="modal-title" id="modalTitle">Schedule Action</h2>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>

          <div class="price-info" id="priceInfo">
            <div class="row">
              <span>Buy Price:</span>
              <span id="modalBuyPrice">--</span>
            </div>
            <div class="row">
              <span>Sell Price:</span>
              <span id="modalSellPrice">--</span>
            </div>
          </div>

          <div class="form-group">
            <label for="actionSelect">Action / Mode</label>
            <select id="actionSelect">
              <option value="">-- Select Action --</option>
            </select>
          </div>

          <div class="form-group" id="socLimitGroup" style="display: none;">
            <label for="socLimit">SOC Limit (%)</label>
            <input type="range" id="socLimit" min="0" max="100" value="100">
            <span id="socLimitValue">100%</span>
          </div>

          <div class="form-group" id="fullHourGroup" style="display: none;">
            <div class="checkbox-group">
              <input type="checkbox" id="fullHour">
              <label for="fullHour">Run for entire hour</label>
            </div>
          </div>

          <div class="form-group" id="minutesGroup" style="display: none;">
            <label for="minutes">Minutes to run</label>
            <input type="range" id="minutes" min="1" max="60" value="30">
            <span id="minutesValue">30 min</span>
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

    // Modal controls
    root.getElementById('modalClose').addEventListener('click', () => this._closeModal());
    root.getElementById('modalCancel').addEventListener('click', () => this._closeModal());
    root.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') this._closeModal();
    });
    root.getElementById('modalSave').addEventListener('click', () => this._handleSave());
    root.getElementById('modalClear').addEventListener('click', () => this._handleClear());

    // Action select change
    root.getElementById('actionSelect').addEventListener('change', (e) => {
      this._toggleParameterFields(e.target.value);
    });

    // SOC limit slider
    root.getElementById('socLimit').addEventListener('input', (e) => {
      root.getElementById('socLimitValue').textContent = `${e.target.value}%`;
    });

    // Minutes slider
    root.getElementById('minutes').addEventListener('input', (e) => {
      root.getElementById('minutesValue').textContent = `${e.target.value} min`;
    });

    // Full hour checkbox
    root.getElementById('fullHour').addEventListener('change', (e) => {
      root.getElementById('minutesGroup').style.display = e.target.checked ? 'none' : 'block';
    });
  }

  _setupChart() {
    const canvas = this.shadowRoot.getElementById('priceChart');
    const ctx = canvas.getContext('2d');

    this._chart = {
      canvas,
      ctx,
      data: { buy: [], sell: [] },
      draw: () => this._drawChart()
    };
  }

  _getAvailableHours() {
    // Get all future hours from price data
    const now = new Date();
    const currentHour = now.getHours();
    const today = this._formatDate(now);

    const buyPrices = this._data?.buy_prices || [];
    const sellPrices = this._data?.sell_prices || [];

    // Combine and filter future hours
    const allHours = [];
    const seenKeys = new Set();

    [...buyPrices, ...sellPrices].forEach(p => {
      const key = `${p.date}-${p.hour}`;
      if (seenKeys.has(key)) return;

      // Skip past hours
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

    // Sort by date and hour
    allHours.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour - b.hour;
    });

    return allHours;
  }

  _updateChart() {
    if (!this._data || !this._chart) return;

    const hours = this._getAvailableHours();

    this._chart.data.hours = hours;
    this._drawChart();
  }

  _drawChart() {
    const { canvas, ctx, data } = this._chart;
    const hours = data.hours || [];

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (hours.length === 0) {
      ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No price data available', width / 2, height / 2);
      return;
    }

    // Find min/max values
    const allValues = hours.flatMap(h => [h.buyPrice, h.sellPrice]).filter(v => v !== undefined);
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    ctx.strokeStyle = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = maxValue - (valueRange / 5) * i;
      ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(2), padding.left - 8, y + 4);
    }

    const pointSpacing = chartWidth / (hours.length - 1 || 1);

    // Draw lines
    const drawLine = (getValue, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;
      hours.forEach((h, i) => {
        const value = getValue(h);
        if (value === undefined) return;

        const x = padding.left + pointSpacing * i;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      hours.forEach((h, i) => {
        const value = getValue(h);
        if (value === undefined) return;

        const x = padding.left + pointSpacing * i;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    drawLine(h => h.buyPrice, '#2196F3');
    drawLine(h => h.sellPrice, '#4CAF50');

    // X-axis labels
    ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    const labelInterval = Math.max(1, Math.floor(hours.length / 12));
    hours.forEach((h, i) => {
      if (i % labelInterval !== 0 && i !== hours.length - 1) return;

      const x = padding.left + pointSpacing * i;
      const label = `${this._formatHour(h.hour)}`;
      const dateLabel = this._formatShortDate(h.date);

      ctx.fillText(label, x, height - padding.bottom + 15);
      ctx.fillText(dateLabel, x, height - padding.bottom + 28);
    });

    // Store click areas
    this._chartClickAreas = hours.map((h, i) => ({
      date: h.date,
      hour: h.hour,
      x: padding.left + pointSpacing * i - 15,
      y: padding.top,
      width: 30,
      height: chartHeight
    }));

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const area of this._chartClickAreas) {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
          this._openModal(area.date, area.hour);
          break;
        }
      }
    };
  }

  _updateScheduleList() {
    const grid = this.shadowRoot.getElementById('scheduleGrid');
    const hours = this._getAvailableHours();

    const now = new Date();
    const currentHour = now.getHours();
    const today = this._formatDate(now);

    let html = '';
    let currentDate = null;

    hours.forEach(h => {
      // Add day separator
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

      html += `
        <div class="${classes}" data-date="${h.date}" data-hour="${h.hour}">
          <div class="time">${this._formatHour(h.hour)}</div>
          <div class="prices">
            ${h.buyPrice !== undefined ? `<span class="buy">B:${h.buyPrice.toFixed(2)}</span>` : ''}
            ${h.sellPrice !== undefined ? `<span class="sell">S:${h.sellPrice.toFixed(2)}</span>` : ''}
          </div>
          ${isScheduled ? `<div class="action">${schedule.action}</div>` : ''}
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

    this._updateCurrentMode();
  }

  _updateCurrentMode() {
    const modeEntity = this._config?.inverter_mode_entity;
    if (modeEntity && this._hass) {
      const state = this._hass.states[modeEntity];
      if (state) {
        this.shadowRoot.getElementById('currentModeValue').textContent = state.state;
      }
    }
  }

  _openModal(date, hour) {
    const modal = this.shadowRoot.getElementById('modalOverlay');
    const hourStr = hour.toString();
    const daySchedule = this._schedule[date] || {};
    const schedule = daySchedule[hourStr];

    this.shadowRoot.getElementById('modalTitle').textContent =
      `Schedule - ${this._formatDateTime(date, hour)}`;

    const hours = this._getAvailableHours();
    const hourData = hours.find(h => h.date === date && h.hour === hour);

    this.shadowRoot.getElementById('modalBuyPrice').textContent =
      hourData?.buyPrice !== undefined ? hourData.buyPrice.toFixed(4) : 'N/A';
    this.shadowRoot.getElementById('modalSellPrice').textContent =
      hourData?.sellPrice !== undefined ? hourData.sellPrice.toFixed(4) : 'N/A';

    const actionSelect = this.shadowRoot.getElementById('actionSelect');
    const modes = this._data?.inverter_modes || [];
    const defaultMode = this._data?.default_mode || '';

    actionSelect.innerHTML = '<option value="">-- Select Action --</option>';
    modes.forEach(mode => {
      const selected = schedule?.action === mode ? 'selected' : '';
      const isDefault = mode === defaultMode ? ' (Default)' : '';
      actionSelect.innerHTML += `<option value="${mode}" ${selected}>${mode}${isDefault}</option>`;
    });

    if (schedule) {
      this.shadowRoot.getElementById('socLimit').value = schedule.soc_limit || 100;
      this.shadowRoot.getElementById('socLimitValue').textContent = `${schedule.soc_limit || 100}%`;
      this.shadowRoot.getElementById('fullHour').checked = schedule.full_hour || false;
      this.shadowRoot.getElementById('minutes').value = schedule.minutes || 30;
      this.shadowRoot.getElementById('minutesValue').textContent = `${schedule.minutes || 30} min`;
      this.shadowRoot.getElementById('modalClear').style.display = 'block';
    } else {
      this.shadowRoot.getElementById('socLimit').value = 100;
      this.shadowRoot.getElementById('socLimitValue').textContent = '100%';
      this.shadowRoot.getElementById('fullHour').checked = false;
      this.shadowRoot.getElementById('minutes').value = 30;
      this.shadowRoot.getElementById('minutesValue').textContent = '30 min';
      this.shadowRoot.getElementById('modalClear').style.display = 'none';
    }

    this._toggleParameterFields(schedule?.action || '');

    this._modalDate = date;
    this._modalHour = hour;
    this._dialogOpen = true;

    modal.classList.add('open');
  }

  _closeModal() {
    this.shadowRoot.getElementById('modalOverlay').classList.remove('open');
    this._dialogOpen = false;
  }

  _toggleParameterFields(action) {
    const defaultMode = this._data?.default_mode || '';
    const isNonDefault = action && action !== defaultMode && action !== '';

    this.shadowRoot.getElementById('socLimitGroup').style.display = isNonDefault ? 'block' : 'none';
    this.shadowRoot.getElementById('fullHourGroup').style.display = isNonDefault ? 'block' : 'none';

    const fullHourChecked = this.shadowRoot.getElementById('fullHour').checked;
    this.shadowRoot.getElementById('minutesGroup').style.display =
      isNonDefault && !fullHourChecked ? 'block' : 'none';
  }

  async _handleSave() {
    const action = this.shadowRoot.getElementById('actionSelect').value;

    if (!action) {
      this._showNotification('Please select an action', 'error');
      return;
    }

    const defaultMode = this._data?.default_mode || '';
    let socLimit = null;
    let fullHour = false;
    let minutes = null;

    if (action !== defaultMode) {
      socLimit = parseInt(this.shadowRoot.getElementById('socLimit').value);
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
      fullHour,
      minutes
    );

    this._closeModal();
  }

  async _handleClear() {
    await this._clearSchedule(this._modalDate, this._modalHour);
    this._closeModal();
  }

  _showNotification(message, type = 'success') {
    const notification = this.shadowRoot.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

customElements.define('energy-scheduler-panel', EnergySchedulerPanel);
window.customPanel = EnergySchedulerPanel;
