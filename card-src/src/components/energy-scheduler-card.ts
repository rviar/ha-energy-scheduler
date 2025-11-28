import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { cardStyles } from '@/styles';
import type {
  HomeAssistant,
  EnergySchedulerCardConfig,
  IntegrationConfig,
  ScheduleData,
  PricePoint,
} from '@/types';

// Register Chart.js components
Chart.register(...registerables);

const CARD_VERSION = '2.0.0';
const DEBUG = true;

const log = (...args: unknown[]) => DEBUG && console.log('[Energy Scheduler]', ...args);
const logError = (...args: unknown[]) => console.error('[Energy Scheduler]', ...args);

interface HourData {
  date: string;
  hour: number;
  buyPrice?: number;
  sellPrice?: number;
}

interface ScheduleEntry {
  action: string;
  soc_limit?: number;
  soc_limit_type?: string;
  full_hour?: boolean;
  minutes?: number;
  manual?: boolean;
  ev_charging?: boolean;
}

@customElement('energy-scheduler-card')
export class EnergySchedulerCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private _config?: EnergySchedulerCardConfig;
  @state() private _integrationConfig?: IntegrationConfig;
  @state() private _data?: ScheduleData;
  @state() private _schedule: Record<string, Record<string, ScheduleEntry>> = {};
  @state() private _loading = false;
  @state() private _dataLoaded = false;
  @state() private _error?: string;
  @state() private _optimizing = false;
  @state() private _clearing = false;

  // Modal state
  @state() private _modalOpen = false;
  @state() private _modalDate?: string;
  @state() private _modalHour?: number;

  private _refreshInterval?: ReturnType<typeof setInterval>;
  private _chartInstance?: Chart;
  private _chartHoursData: HourData[] = [];
  private _resizeObserver?: ResizeObserver;
  private _initAttempts = 0;
  private _maxInitAttempts = 20;
  private _initRetryTimer?: ReturnType<typeof setTimeout>;

  // Lifecycle
  connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && this._config && !this._dataLoaded && !this._loading) {
      this._tryInitialize();
    }
    if (this._dataLoaded && !this._refreshInterval) {
      this._startAutoRefresh();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopAutoRefresh();
    this._destroyChart();
    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = undefined;
    }
  }

  // Configuration
  setConfig(config: EnergySchedulerCardConfig): void {
    this._config = {
      title: config?.title ?? 'Energy Scheduler',
      show_chart: config?.show_chart !== false,
      show_schedule: config?.show_schedule !== false,
      chart_height: config?.chart_height ?? 250,
      ...config,
    };

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
      show_schedule: true,
      chart_height: 250,
    };
  }

  getCardSize(): number {
    let size = 1;
    if (this._config?.show_chart) size += 4;
    if (this._config?.show_schedule) size += 6;
    return size;
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);

    if (changedProps.has('hass')) {
      const firstHass = !changedProps.get('hass') && this.hass;
      if (firstHass && this._config && !this._dataLoaded && !this._loading) {
        this._tryInitialize();
      }
      if (this._dataLoaded) {
        this._updateCurrentMode();
      }
    }
  }

  // Initialization
  private _isHassReady(): boolean {
    if (!this.hass) return false;
    if (typeof this.hass.callApi !== 'function') return false;
    if (this.hass.connected === false) return false;
    return true;
  }

  private _tryInitialize(): void {
    if (this._loading || this._dataLoaded) {
      return;
    }

    if (this._initRetryTimer) {
      clearTimeout(this._initRetryTimer);
      this._initRetryTimer = undefined;
    }

    if (!this._isHassReady()) {
      this._initAttempts++;
      log(`_tryInitialize: Hass not ready, attempt ${this._initAttempts}/${this._maxInitAttempts}`);

      if (this._initAttempts < this._maxInitAttempts) {
        const delay = Math.min(100 * Math.pow(1.5, this._initAttempts), 2000);
        this._initRetryTimer = setTimeout(() => {
          this._initRetryTimer = undefined;
          this._tryInitialize();
        }, delay);
        return;
      }
    }

    log('_tryInitialize: Starting initialization');
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
      log('Data loaded successfully');
      this._startAutoRefresh();

      if (this._config?.show_chart) {
        await this.updateComplete;
        this._setupChart();
      }
    } catch (error) {
      logError('Failed to load data', error);
      this._error = error instanceof Error ? error.message : 'Failed to load data';
      setTimeout(() => {
        this._loading = false;
        this._initAttempts = 0;
        if (this.hass && this._config) {
          this._tryInitialize();
        }
      }, 5000);
    } finally {
      this._loading = false;
    }
  }

  private async _loadData(): Promise<void> {
    if (!this.hass) throw new Error('Home Assistant not available');

    const [configResult, dataResult] = await Promise.all([
      this.hass.callApi<IntegrationConfig>('GET', 'hacs_energy_scheduler/config'),
      this.hass.callApi<ScheduleData>('GET', 'hacs_energy_scheduler/data'),
    ]);

    this._integrationConfig = configResult;
    this._data = dataResult;
    this._schedule = (dataResult?.schedule as Record<string, Record<string, ScheduleEntry>>) || {};
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

  private async _refreshData(): Promise<void> {
    if (!this.hass || !this._dataLoaded) return;

    try {
      const data = await this.hass.callApi<ScheduleData>('GET', 'hacs_energy_scheduler/data');
      this._data = data;
      this._schedule = (data?.schedule as Record<string, Record<string, ScheduleEntry>>) || {};
      this._updateChart();
    } catch (error) {
      logError('Refresh failed', error);
    }
  }

  // Date/Time formatters
  private _formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private _formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  private _formatDateTime(date: string, hour: number): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(date);
    return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ${this._formatHour(hour)}`;
  }

  private _formatShortDate(date: string): string {
    const d = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  }

  // Data helpers
  private _getAvailableHours(): HourData[] {
    const now = new Date();
    const currentHour = now.getHours();
    const today = this._formatDate(now);

    const buyPrices: PricePoint[] = this._data?.buy_prices || [];
    const sellPrices: PricePoint[] = this._data?.sell_prices || [];

    const allHours: HourData[] = [];
    const seenKeys = new Set<string>();

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
        sellPrice: sellPrices.find(s => s.date === p.date && s.hour === p.hour)?.value,
      });
    });

    allHours.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour - b.hour;
    });

    return allHours;
  }

  // Chart
  private _setupChart(): void {
    const canvas = this.shadowRoot?.getElementById('priceChart') as HTMLCanvasElement;
    const chartLoading = this.shadowRoot?.getElementById('chartLoading');
    if (!canvas) return;

    if (this._chartInstance) {
      (this._chartInstance as Chart).destroy();
      this._chartInstance = undefined;
    }

    try {
      if (chartLoading) chartLoading.style.display = 'none';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const textColor = getComputedStyle(this).getPropertyValue('--primary-text-color') || '#333';
      const gridColor = getComputedStyle(this).getPropertyValue('--divider-color') || '#e0e0e0';
      const secondaryBg = getComputedStyle(this).getPropertyValue('--secondary-background-color') || '#f5f5f5';

      // Create gradients for beautiful fill effect
      const buyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 250);
      buyGradient.addColorStop(0, 'rgba(33, 150, 243, 0.3)');
      buyGradient.addColorStop(0.5, 'rgba(33, 150, 243, 0.1)');
      buyGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');

      const sellGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 250);
      sellGradient.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
      sellGradient.addColorStop(0.5, 'rgba(76, 175, 80, 0.1)');
      sellGradient.addColorStop(1, 'rgba(76, 175, 80, 0)');

      this._chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Buy',
              data: [],
              borderColor: '#2196F3',
              backgroundColor: buyGradient,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#2196F3',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Sell',
              data: [],
              borderColor: '#4CAF50',
              backgroundColor: sellGradient,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#4CAF50',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          hover: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                color: textColor,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 11, weight: 500 },
                padding: 16,
                boxWidth: 8,
                boxHeight: 8,
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: secondaryBg,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: gridColor,
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              displayColors: true,
              boxWidth: 8,
              boxHeight: 8,
              boxPadding: 4,
              usePointStyle: true,
              titleFont: { size: 12, weight: 600 },
              bodyFont: { size: 11 },
              callbacks: {
                title: (context: Array<{ dataIndex: number; label: string }>) => {
                  const idx = context[0].dataIndex;
                  const hours = this._chartHoursData;
                  if (hours[idx]) {
                    return this._formatDateTime(hours[idx].date, hours[idx].hour);
                  }
                  return context[0].label;
                },
                // @ts-expect-error Chart.js callback types are overly strict
                label: (context: { parsed: { y: number }; dataset: { label: string; borderColor: string } }) => {
                  const value = context.parsed.y.toFixed(4);
                  return ` ${context.dataset.label}: ${value}`;
                },
              },
            },
          },
          scales: {
            x: {
              display: true,
              grid: {
                color: gridColor,
                drawTicks: false,
              },
              border: { display: false },
              ticks: {
                color: textColor,
                maxRotation: 0,
                minRotation: 0,
                font: { size: 9 },
                padding: 8,
                maxTicksLimit: 12,
              },
            },
            y: {
              display: true,
              grid: {
                color: gridColor,
                drawTicks: false,
              },
              border: { display: false },
              ticks: {
                color: textColor,
                // @ts-expect-error Chart.js callback types are overly strict
                callback: (value: number) => value.toFixed(2),
                font: { size: 10 },
                padding: 8,
              },
            },
          },
          onClick: (_event: unknown, elements: Array<{ index: number }>) => {
            if (elements.length > 0) {
              const idx = elements[0].index;
              const hours = this._chartHoursData;
              if (hours[idx]) {
                this._openModal(hours[idx].date, hours[idx].hour);
              }
            }
          },
        },
      });

      this._updateChart();

      if (!this._resizeObserver && canvas.parentElement) {
        this._resizeObserver = new ResizeObserver(() => {
          if (this._chartInstance && canvas.offsetParent !== null) {
            (this._chartInstance as { resize: () => void }).resize();
          }
        });
        this._resizeObserver.observe(canvas.parentElement);
      }
    } catch (error) {
      logError('Failed to initialize Chart.js:', error);
      if (chartLoading) {
        chartLoading.textContent = 'Failed to load chart';
      }
    }
  }

  private _updateChart(): void {
    if (!this._data || !this._chartInstance) return;

    const hours = this._getAvailableHours();
    this._chartHoursData = hours;

    const now = new Date();
    const today = this._formatDate(now);
    const tomorrow = this._formatDate(new Date(now.getTime() + 86400000));

    const labels = hours.map(h => {
      if (h.date === today) return this._formatHour(h.hour);
      if (h.date === tomorrow) return 'T+' + this._formatHour(h.hour);
      return this._formatShortDate(h.date).substring(0, 3) + ' ' + this._formatHour(h.hour);
    });

    const chart = this._chartInstance;

    chart.data.labels = labels;
    chart.data.datasets[0].data = hours.map(h => h.buyPrice ?? null);
    chart.data.datasets[1].data = hours.map(h => h.sellPrice ?? null);

    // Show points only for scheduled hours
    const scheduledRadius = hours.map(h => {
      const schedule = this._schedule[h.date]?.[h.hour.toString()];
      return schedule ? 5 : 0;
    });

    // Use legend colors for points (blue for Buy, green for Sell)
    const buyPointColors = hours.map(h => {
      const schedule = this._schedule[h.date]?.[h.hour.toString()];
      return schedule ? '#2196F3' : 'transparent';
    });

    const sellPointColors = hours.map(h => {
      const schedule = this._schedule[h.date]?.[h.hour.toString()];
      return schedule ? '#4CAF50' : 'transparent';
    });

    // Set point styles for scheduled hours visualization
    const ds0 = chart.data.datasets[0] as { pointRadius?: number[]; pointBackgroundColor?: string[] };
    const ds1 = chart.data.datasets[1] as { pointRadius?: number[]; pointBackgroundColor?: string[] };
    ds0.pointRadius = scheduledRadius;
    ds1.pointRadius = scheduledRadius;
    ds0.pointBackgroundColor = buyPointColors;
    ds1.pointBackgroundColor = sellPointColors;

    chart.update('none');
  }

  private _destroyChart(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = undefined;
    }
  }

  // Actions
  private async _saveSchedule(
    date: string,
    hour: number,
    action: string,
    socLimit: number | null,
    socLimitType: string | null,
    fullHour: boolean,
    minutes: number | null,
    evCharging: boolean
  ): Promise<void> {
    try {
      await this.hass?.callApi('POST', 'hacs_energy_scheduler/schedule', {
        date,
        hour,
        action,
        soc_limit: socLimit,
        soc_limit_type: socLimitType,
        full_hour: fullHour,
        minutes,
        ev_charging: evCharging,
      });
      await this._refreshData();
      this._showNotification('Schedule saved');
    } catch (error) {
      logError('Failed to save schedule:', error);
      this._showNotification('Failed to save', 'error');
    }
  }

  private async _clearSchedule(date: string, hour: number): Promise<void> {
    try {
      await this.hass?.callApi('DELETE', `hacs_energy_scheduler/schedule?date=${date}&hour=${hour}`);
      await this._refreshData();
      this._showNotification('Schedule cleared');
    } catch (error) {
      logError('Failed to clear schedule:', error);
      this._showNotification('Failed to clear', 'error');
    }
  }

  private async _handleUnlock(): Promise<void> {
    if (!this._modalDate || this._modalHour === undefined) return;

    try {
      const response = await this.hass?.callApi<{ success: boolean }>(
        'POST',
        'hacs_energy_scheduler/manual',
        {
          date: this._modalDate,
          hour: this._modalHour,
          manual: false,
        }
      );

      if (response?.success) {
        this._showNotification('Schedule unlocked');
        await this._refreshData();
        this._closeModal();
      } else {
        this._showNotification('Failed to unlock', 'error');
      }
    } catch (error) {
      logError('Unlock error:', error);
      this._showNotification('Failed to unlock', 'error');
    }
  }

  private async _runOptimization(): Promise<void> {
    if (!this.hass || this._optimizing) return;

    this._optimizing = true;

    try {
      await this.hass.callService('hacs_energy_scheduler', 'run_optimization', {
        hours_ahead: 24,
      });
      this._showNotification('Optimization complete!');
      await this._refreshData();
    } catch (error) {
      logError('Optimization failed:', error);
      this._showNotification('Optimization failed', 'error');
    } finally {
      this._optimizing = false;
    }
  }

  private async _clearAllSchedules(): Promise<void> {
    if (!this.hass || this._clearing) return;

    // Confirm before clearing
    if (!confirm('Clear all scheduled tasks?')) return;

    this._clearing = true;

    try {
      // Clear today and tomorrow
      const now = new Date();
      const today = this._formatDate(now);
      const tomorrow = this._formatDate(new Date(now.getTime() + 86400000));

      await this.hass.callService('hacs_energy_scheduler', 'clear_schedule', {
        date: today,
      });
      await this.hass.callService('hacs_energy_scheduler', 'clear_schedule', {
        date: tomorrow,
      });

      this._showNotification('All schedules cleared');
      await this._refreshData();
    } catch (error) {
      logError('Clear all failed:', error);
      this._showNotification('Failed to clear', 'error');
    } finally {
      this._clearing = false;
    }
  }

  private _updateCurrentMode(): void {
    const modeEntity = this._integrationConfig?.inverter_mode_entity;
    if (modeEntity && this.hass) {
      const state = this.hass.states[modeEntity];
      const modeValue = this.shadowRoot?.getElementById('currentModeValue');
      if (state && modeValue) {
        modeValue.textContent = state.state;
      }
    }
  }

  private _showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification = this.shadowRoot?.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }

  // Modal
  private _openModal(date: string, hour: number): void {
    this._modalDate = date;
    this._modalHour = hour;
    this._modalOpen = true;

    // Wait for render then setup modal
    this.updateComplete.then(() => {
      this._setupModalValues();
    });
  }

  private _setupModalValues(): void {
    if (!this._modalDate || this._modalHour === undefined) return;

    const schedule = this._schedule[this._modalDate]?.[this._modalHour.toString()];
    const hours = this._getAvailableHours();
    const hourData = hours.find(h => h.date === this._modalDate && h.hour === this._modalHour);

    // Update title
    const modalTitle = this.shadowRoot?.getElementById('modalTitle');
    if (modalTitle) {
      modalTitle.textContent = this._formatDateTime(this._modalDate, this._modalHour);
    }

    // Update prices
    const buyPrice = this.shadowRoot?.getElementById('modalBuyPrice');
    const sellPrice = this.shadowRoot?.getElementById('modalSellPrice');
    if (buyPrice) buyPrice.textContent = hourData?.buyPrice?.toFixed(4) ?? 'N/A';
    if (sellPrice) sellPrice.textContent = hourData?.sellPrice?.toFixed(4) ?? 'N/A';

    // Update action select
    const actionSelect = this.shadowRoot?.getElementById('actionSelect') as HTMLSelectElement;
    const modes: string[] = this._data?.inverter_modes || [];
    const defaultMode: string = this._data?.default_mode || '';

    if (actionSelect) {
      actionSelect.innerHTML = '<option value="">-- Select --</option>';
      modes.forEach(mode => {
        const selected = schedule?.action === mode ? 'selected' : '';
        const isDefault = mode === defaultMode ? ' *' : '';
        actionSelect.innerHTML += `<option value="${mode}" ${selected}>${mode}${isDefault}</option>`;
      });
    }

    // Update form values
    if (schedule) {
      this._setFormValue('socLimitType', schedule.soc_limit_type || 'max');
      this._setFormValue('socLimit', schedule.soc_limit?.toString() || '100');
      this._setFormText('socLimitValue', `${schedule.soc_limit || 100}%`);
      this._setFormChecked('fullHour', schedule.full_hour || false);
      this._setFormValue('minutes', schedule.minutes?.toString() || '30');
      this._setFormText('minutesValue', `${schedule.minutes || 30} min`);
      this._setFormChecked('evCharging', schedule.ev_charging || false);
      this._setDisplay('modalClear', 'block');
      this._setDisplay('modalUnlock', schedule.manual ? 'block' : 'none');
    } else {
      this._setFormValue('socLimitType', 'max');
      this._setFormValue('socLimit', '100');
      this._setFormText('socLimitValue', '100%');
      this._setFormChecked('fullHour', true);
      this._setFormValue('minutes', '30');
      this._setFormText('minutesValue', '30 min');
      this._setFormChecked('evCharging', false);
      this._setDisplay('modalClear', 'none');
      this._setDisplay('modalUnlock', 'none');
    }

    this._toggleParameterFields(schedule?.action || '');
  }

  private _setFormValue(id: string, value: string): void {
    const el = this.shadowRoot?.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (el) el.value = value;
  }

  private _setFormText(id: string, text: string): void {
    const el = this.shadowRoot?.getElementById(id);
    if (el) el.textContent = text;
  }

  private _setFormChecked(id: string, checked: boolean): void {
    const el = this.shadowRoot?.getElementById(id) as HTMLInputElement;
    if (el) el.checked = checked;
  }

  private _setDisplay(id: string, display: string): void {
    const el = this.shadowRoot?.getElementById(id) as HTMLElement;
    if (el) el.style.display = display;
  }

  private _toggleParameterFields(action: string): void {
    const defaultMode: string = this._data?.default_mode || '';
    const isNonDefault = action && action !== defaultMode && action !== '';
    const evStopCondition = this._integrationConfig?.ev_stop_condition;
    const hasEvStopCondition = evStopCondition &&
      ((Array.isArray(evStopCondition) && evStopCondition.length > 0) ||
       (typeof evStopCondition === 'string' && evStopCondition.length > 0));
    const hasSocSensor = !!this._integrationConfig?.soc_sensor;

    this._setDisplay('optionsSection', isNonDefault ? 'block' : 'none');
    this._setDisplay('evChargingGroup', hasEvStopCondition ? 'flex' : 'none');

    const evChargingChecked = (this.shadowRoot?.getElementById('evCharging') as HTMLInputElement)?.checked;
    const showSocSection = hasSocSensor && !evChargingChecked;

    this._setDisplay('socDivider', hasEvStopCondition && showSocSection ? 'block' : 'none');
    this._setDisplay('socSection', showSocSection ? 'block' : 'none');
    this._setDisplay('durationDivider', 'block');
    this._setDisplay('fullHourGroup', 'flex');

    const fullHourChecked = (this.shadowRoot?.getElementById('fullHour') as HTMLInputElement)?.checked;
    this._setDisplay('minutesGroup', !fullHourChecked ? 'block' : 'none');
  }

  private _closeModal(): void {
    this._modalOpen = false;
    this._modalDate = undefined;
    this._modalHour = undefined;
  }

  private async _handleSave(): Promise<void> {
    const action = (this.shadowRoot?.getElementById('actionSelect') as HTMLSelectElement)?.value;

    if (!action || !this._modalDate || this._modalHour === undefined) {
      this._showNotification('Select action', 'error');
      return;
    }

    const defaultMode: string = this._data?.default_mode || '';
    let socLimit: number | null = null;
    let socLimitType: string | null = null;
    let fullHour = false;
    let minutes: number | null = null;
    let evCharging = false;

    if (action !== defaultMode) {
      const evStopCondition = this._integrationConfig?.ev_stop_condition;
      const hasEvStopCondition = evStopCondition &&
        ((Array.isArray(evStopCondition) && evStopCondition.length > 0) ||
         (typeof evStopCondition === 'string' && evStopCondition.length > 0));

      if (hasEvStopCondition) {
        evCharging = (this.shadowRoot?.getElementById('evCharging') as HTMLInputElement)?.checked || false;
      }

      if (!evCharging && this._integrationConfig?.soc_sensor) {
        socLimit = parseInt((this.shadowRoot?.getElementById('socLimit') as HTMLInputElement)?.value || '100');
        socLimitType = (this.shadowRoot?.getElementById('socLimitType') as HTMLSelectElement)?.value || 'max';
      }

      fullHour = (this.shadowRoot?.getElementById('fullHour') as HTMLInputElement)?.checked || false;
      if (!fullHour) {
        minutes = parseInt((this.shadowRoot?.getElementById('minutes') as HTMLInputElement)?.value || '30');
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

  private async _handleClear(): Promise<void> {
    if (!this._modalDate || this._modalHour === undefined) return;
    await this._clearSchedule(this._modalDate, this._modalHour);
    this._closeModal();
  }

  // Render
  protected render() {
    if (!this._config) {
      return html`<ha-card>No configuration</ha-card>`;
    }

    return html`
      <ha-card>
        <div class="card-content">
          ${this._renderHeader()}
          ${this._loading && !this._dataLoaded ? this._renderLoading() : nothing}
          ${this._error ? this._renderError() : nothing}
          ${this._dataLoaded ? this._renderContent() : nothing}
        </div>
        ${this._renderModal()}
        <div class="notification" id="notification"></div>
      </ha-card>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="card-header">
        <h2>⚡ ${this._config?.title || 'Energy Scheduler'}</h2>
      </div>
    `;
  }

  private _renderLoading() {
    return html`
      <div class="loading-placeholder">
        <div class="loading-spinner"></div>
        <span>Loading schedule...</span>
      </div>
    `;
  }

  private _renderError() {
    return html`
      <div class="error-placeholder">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${this._error}</div>
        <button class="retry-btn" @click=${() => {
          this._loading = false;
          this._dataLoaded = false;
          this._error = undefined;
          this._initialize();
        }}>Retry</button>
      </div>
    `;
  }

  private _renderContent() {
    return html`
      ${this._config?.show_chart ? this._renderChart() : nothing}
      ${this._config?.show_schedule ? this._renderSchedule() : nothing}
    `;
  }

  private _renderChart() {
    const height = this._config?.chart_height ?? 250;
    return html`
      <div class="chart-section">
        <div class="chart-container" style="--chart-height: ${height}px">
          <div class="chart-loading" id="chartLoading">Loading chart...</div>
          <canvas id="priceChart" style="display: none;"></canvas>
        </div>
      </div>
    `;
  }

  private _renderSchedule() {
    const hours = this._getAvailableHours();
    const now = new Date();
    const today = this._formatDate(now);
    const tomorrow = this._formatDate(new Date(now.getTime() + 86400000));

    let currentDate: string | null = null;

    return html`
      <div class="schedule-section">
        <div class="schedule-toolbar">
          <div class="current-mode">
            <span class="label">Mode:</span>
            <span class="value" id="currentModeValue">--</span>
          </div>
          <div class="toolbar-actions">
            <button
              class="action-btn"
              @click=${this._clearAllSchedules}
              ?disabled=${this._clearing || this._optimizing}
            >
              ${this._clearing ? 'Clearing...' : 'Clear'}
            </button>
            <button
              class="action-btn primary"
              @click=${this._runOptimization}
              ?disabled=${this._optimizing || this._clearing}
            >
              ${this._optimizing ? 'Running...' : 'Optimize'}
            </button>
          </div>
        </div>
        <div class="schedule-grid">
          ${hours.length === 0
            ? html`<div class="empty-state">No price data available</div>`
            : hours.map(h => {
                let daySeparator: TemplateResult | typeof nothing = nothing;
                if (h.date !== currentDate) {
                  currentDate = h.date;
                  const isToday = h.date === today;
                  const isTomorrow = h.date === tomorrow;
                  let dayLabel = this._formatShortDate(h.date);
                  if (isToday) dayLabel = 'Today';
                  if (isTomorrow) dayLabel = 'Tomorrow';
                  daySeparator = html`<div class="day-separator">${dayLabel}</div>`;
                }

                const schedule = this._schedule[h.date]?.[h.hour.toString()];
                const isScheduled = !!schedule;
                const isManual = schedule?.manual === true;
                const evIndicator = schedule?.ev_charging ? '🚗 ' : '';
                const lockIndicator = isManual ? html`<span class="lock-indicator">🔒</span>` : nothing;

                return html`
                  ${daySeparator}
                  <div
                    class="hour-slot ${isScheduled ? 'scheduled' : ''} ${isManual ? 'manual' : ''}"
                    @click=${() => this._openModal(h.date, h.hour)}
                  >
                    ${lockIndicator}
                    <div class="time">${this._formatHour(h.hour)}</div>
                    <div class="prices">
                      ${h.buyPrice !== undefined ? html`<span class="buy">${h.buyPrice.toFixed(2)}</span>` : nothing}
                      ${h.sellPrice !== undefined ? html`<span class="sell">${h.sellPrice.toFixed(2)}</span>` : nothing}
                    </div>
                    ${isScheduled ? html`<div class="action">${evIndicator}${schedule.action}</div>` : nothing}
                  </div>
                `;
              })}
        </div>
      </div>
    `;
  }

  private _renderModal() {
    if (!this._modalOpen) return nothing;

    return html`
      <div class="modal-overlay ${this._modalOpen ? 'open' : ''}" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) this._closeModal();
      }}>
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">Schedule</h3>
            <button class="modal-close" @click=${this._closeModal}>&times;</button>
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
            <select id="actionSelect" @change=${(e: Event) => this._toggleParameterFields((e.target as HTMLSelectElement).value)}>
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
                <input type="checkbox" id="evCharging" @change=${() => this._toggleParameterFields((this.shadowRoot?.getElementById('actionSelect') as HTMLSelectElement)?.value || '')}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="form-divider" id="socDivider" style="display: none;"></div>

            <div id="socSection" style="display: none;">
              <div class="form-group" id="socLimitGroup">
                <label for="socLimitType">SOC Condition</label>
                <select id="socLimitType" @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  const defaultValue = value === 'max' ? '100' : '30';
                  this._setFormValue('socLimit', defaultValue);
                  this._setFormText('socLimitValue', `${defaultValue}%`);
                }}>
                  <option value="max">Charge to SOC ≥</option>
                  <option value="min">Discharge to SOC ≤</option>
                </select>
              </div>
              <div class="range-group" id="socLimitValueGroup">
                <div class="range-header">
                  <span class="range-label">Target SOC</span>
                  <span class="range-value" id="socLimitValue">100%</span>
                </div>
                <input type="range" class="range-input" id="socLimit" min="0" max="100" value="100"
                  @input=${(e: Event) => this._setFormText('socLimitValue', `${(e.target as HTMLInputElement).value}%`)}>
              </div>
            </div>

            <div class="form-divider" id="durationDivider" style="display: none;"></div>

            <div class="toggle-row" id="fullHourGroup" style="display: none;">
              <div>
                <div class="toggle-label">⏱️ Full Hour</div>
                <div class="toggle-hint">Run for entire hour</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="fullHour" @change=${(e: Event) => {
                  this._setDisplay('minutesGroup', (e.target as HTMLInputElement).checked ? 'none' : 'block');
                }}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="range-group" id="minutesGroup" style="display: none;">
              <div class="range-header">
                <span class="range-label">Duration</span>
                <span class="range-value" id="minutesValue">30 min</span>
              </div>
              <input type="range" class="range-input" id="minutes" min="1" max="60" value="30"
                @input=${(e: Event) => this._setFormText('minutesValue', `${(e.target as HTMLInputElement).value} min`)}>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click=${this._closeModal}>Cancel</button>
            <button class="btn btn-warning" id="modalUnlock" style="display: none;" @click=${this._handleUnlock} title="Remove lock - allows optimization to overwrite">🔓 Unlock</button>
            <button class="btn btn-danger" id="modalClear" style="display: none;" @click=${this._handleClear}>Clear</button>
            <button class="btn btn-primary" @click=${this._handleSave}>Save</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-scheduler-card': EnergySchedulerCard;
  }
}
