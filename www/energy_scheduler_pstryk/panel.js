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
    this._selectedDate = this._formatDate(new Date());
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

  async _loadSchedule(date) {
    try {
      const response = await this._hass.callApi('GET', `energy_scheduler_pstryk/schedule?date=${date}`);
      return response;
    } catch (error) {
      console.error('Failed to load schedule:', error);
      return {};
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
    // Refresh data every minute
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

      .date-selector {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .date-selector input {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .date-nav-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      }

      .date-nav-btn:hover {
        opacity: 0.8;
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
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 16px;
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
      }

      .hour-slot .time {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .hour-slot .prices {
        font-size: 11px;
        color: var(--secondary-text-color);
      }

      .hour-slot .action {
        font-size: 12px;
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

      .empty-state svg {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
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
          font-size: 12px;
        }

        .hour-slot .prices {
          display: none;
        }
      }
    `;
  }

  _getTemplate() {
    return `
      <div class="header">
        <h1>⚡ Energy Scheduler</h1>
        <div class="date-selector">
          <button class="date-nav-btn" id="prevDay">◀</button>
          <input type="date" id="dateInput" value="${this._selectedDate}">
          <button class="date-nav-btn" id="nextDay">▶</button>
          <button class="date-nav-btn" id="today">Today</button>
        </div>
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
              <label for="fullHour">Charge for entire hour</label>
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

    // Date navigation
    root.getElementById('prevDay').addEventListener('click', () => this._changeDate(-1));
    root.getElementById('nextDay').addEventListener('click', () => this._changeDate(1));
    root.getElementById('today').addEventListener('click', () => this._goToToday());
    root.getElementById('dateInput').addEventListener('change', (e) => {
      this._selectedDate = e.target.value;
      this._loadData();
    });

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

  _changeDate(delta) {
    const date = new Date(this._selectedDate);
    date.setDate(date.getDate() + delta);
    this._selectedDate = this._formatDate(date);
    this.shadowRoot.getElementById('dateInput').value = this._selectedDate;
    this._loadData();
  }

  _goToToday() {
    this._selectedDate = this._formatDate(new Date());
    this.shadowRoot.getElementById('dateInput').value = this._selectedDate;
    this._loadData();
  }

  _setupChart() {
    const canvas = this.shadowRoot.getElementById('priceChart');
    const ctx = canvas.getContext('2d');

    // Simple line chart implementation without external dependencies
    this._chart = {
      canvas,
      ctx,
      data: { buy: [], sell: [] },
      draw: () => this._drawChart()
    };
  }

  _updateChart() {
    if (!this._data || !this._chart) return;

    const buyPrices = this._data.buy_prices || [];
    const sellPrices = this._data.sell_prices || [];

    // Filter data for selected date
    const filteredBuy = buyPrices.filter(p => p.date === this._selectedDate);
    const filteredSell = sellPrices.filter(p => p.date === this._selectedDate);

    this._chart.data.buy = filteredBuy;
    this._chart.data.sell = filteredSell;
    this._drawChart();
  }

  _drawChart() {
    const { canvas, ctx, data } = this._chart;
    const buyData = data.buy;
    const sellData = data.sell;

    // Get device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (buyData.length === 0 && sellData.length === 0) {
      ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No price data available for this date', width / 2, height / 2);
      return;
    }

    // Find min/max values
    const allValues = [...buyData.map(d => d.value), ...sellData.map(d => d.value)];
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    ctx.strokeStyle = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (valueRange / 5) * i;
      ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(2), padding.left - 8, y + 4);
    }

    // Draw lines
    const drawLine = (data, color) => {
      if (data.length === 0) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, i) => {
        const x = padding.left + (chartWidth / 23) * point.hour;
        const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      data.forEach((point) => {
        const x = padding.left + (chartWidth / 23) * point.hour;
        const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    drawLine(buyData, '#2196F3');
    drawLine(sellData, '#4CAF50');

    // X-axis labels
    ctx.fillStyle = getComputedStyle(this).getPropertyValue('--secondary-text-color') || '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    for (let hour = 0; hour < 24; hour += 3) {
      const x = padding.left + (chartWidth / 23) * hour;
      ctx.fillText(this._formatHour(hour), x, height - padding.bottom + 20);
    }

    // Store click areas for interaction
    this._chartClickAreas = [];
    const allData = [...buyData, ...sellData];
    const uniqueHours = [...new Set(allData.map(d => d.hour))];

    uniqueHours.forEach(hour => {
      const x = padding.left + (chartWidth / 23) * hour;
      this._chartClickAreas.push({
        hour,
        x: x - 15,
        y: padding.top,
        width: 30,
        height: chartHeight
      });
    });

    // Add click handler
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const area of this._chartClickAreas) {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
          this._openModal(area.hour);
          break;
        }
      }
    };
  }

  _updateScheduleList() {
    const grid = this.shadowRoot.getElementById('scheduleGrid');
    const currentHour = new Date().getHours();
    const isToday = this._selectedDate === this._formatDate(new Date());
    const daySchedule = this._schedule[this._selectedDate] || {};

    // Get price data for this date
    const buyPrices = (this._data?.buy_prices || []).filter(p => p.date === this._selectedDate);
    const sellPrices = (this._data?.sell_prices || []).filter(p => p.date === this._selectedDate);

    let html = '';

    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString();
      const schedule = daySchedule[hourStr];
      const isScheduled = !!schedule;
      const isCurrent = isToday && hour === currentHour;

      const buyPrice = buyPrices.find(p => p.hour === hour);
      const sellPrice = sellPrices.find(p => p.hour === hour);

      let classes = 'hour-slot';
      if (isScheduled) classes += ' scheduled';
      if (isCurrent) classes += ' current';

      html += `
        <div class="${classes}" data-hour="${hour}">
          <div class="time">${this._formatHour(hour)}</div>
          <div class="prices">
            ${buyPrice ? `B: ${buyPrice.value.toFixed(2)}` : ''}
            ${sellPrice ? ` S: ${sellPrice.value.toFixed(2)}` : ''}
          </div>
          ${isScheduled ? `<div class="action">${schedule.action}</div>` : ''}
        </div>
      `;
    }

    grid.innerHTML = html;

    // Add click handlers
    grid.querySelectorAll('.hour-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const hour = parseInt(slot.dataset.hour);
        this._openModal(hour);
      });
    });

    // Update current mode display
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

  _openModal(hour) {
    const modal = this.shadowRoot.getElementById('modalOverlay');
    const hourStr = hour.toString();
    const daySchedule = this._schedule[this._selectedDate] || {};
    const schedule = daySchedule[hourStr];

    // Update modal title
    this.shadowRoot.getElementById('modalTitle').textContent =
      `Schedule - ${this._formatHour(hour)} on ${this._selectedDate}`;

    // Update price info
    const buyPrices = (this._data?.buy_prices || []).filter(p => p.date === this._selectedDate);
    const sellPrices = (this._data?.sell_prices || []).filter(p => p.date === this._selectedDate);
    const buyPrice = buyPrices.find(p => p.hour === hour);
    const sellPrice = sellPrices.find(p => p.hour === hour);

    this.shadowRoot.getElementById('modalBuyPrice').textContent =
      buyPrice ? `${buyPrice.value.toFixed(4)}` : 'N/A';
    this.shadowRoot.getElementById('modalSellPrice').textContent =
      sellPrice ? `${sellPrice.value.toFixed(4)}` : 'N/A';

    // Populate action options
    const actionSelect = this.shadowRoot.getElementById('actionSelect');
    const modes = this._data?.inverter_modes || [];
    const defaultMode = this._data?.default_mode || '';

    actionSelect.innerHTML = '<option value="">-- Select Action --</option>';
    modes.forEach(mode => {
      const selected = schedule?.action === mode ? 'selected' : '';
      const isDefault = mode === defaultMode ? ' (Default)' : '';
      actionSelect.innerHTML += `<option value="${mode}" ${selected}>${mode}${isDefault}</option>`;
    });

    // Set form values from existing schedule
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

    // Toggle parameter fields based on action
    this._toggleParameterFields(schedule?.action || '');

    // Store selected hour
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
      this._selectedDate,
      this._modalHour,
      action,
      socLimit,
      fullHour,
      minutes
    );

    this._closeModal();
  }

  async _handleClear() {
    await this._clearSchedule(this._selectedDate, this._modalHour);
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

// Register the custom element
customElements.define('energy-scheduler-panel', EnergySchedulerPanel);

// Export for Home Assistant panel registration
window.customPanel = EnergySchedulerPanel;
