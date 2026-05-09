import type { ScheduleEntry, IntegrationConfig, ActionType, HourData, PricePoint } from '@/types';

const ACTION_CHARGE_PLACEHOLDER = 'CHARGE';
const ACTION_PV_CHARGE_PLACEHOLDER = 'PV_CHARGE';
const ACTION_SELF_CONSUME_FIRST_PLACEHOLDER = 'SELF_CONSUME_FIRST';
const ACTION_SELF_CONSUME_ONLY_PLACEHOLDER = 'SELF_CONSUME_ONLY';
const ACTION_PAID_IMPORT_PLACEHOLDER = 'PAID_IMPORT';

// --- Action type resolution ---

export function resolveActionType(
  entry: ScheduleEntry,
  config: IntegrationConfig
): ActionType {
  const action = entry.action;

  if (action === ACTION_CHARGE_PLACEHOLDER || action === config.mode_charge_battery) {
    if (entry.ev_charging) return 'charge_ev';
    return 'charge';
  }
  if (action === config.mode_charge_ev) return 'charge_ev';
  if (action === config.mode_charge_ev_and_battery) return 'charge_ev';
  if (action === config.mode_sell) return 'discharge';
  if (action === config.mode_sell_solar_only) return 'solar';
  if (action === ACTION_PV_CHARGE_PLACEHOLDER) return 'pv_charge';
  if (action === ACTION_SELF_CONSUME_FIRST_PLACEHOLDER) return 'self_consume';
  if (action === ACTION_SELF_CONSUME_ONLY_PLACEHOLDER) return 'self_consume';
  if (action === ACTION_PAID_IMPORT_PLACEHOLDER) return 'paid_import';
  if (action === config.mode_self_consume) return 'self_consume';
  if (action === config.mode_grid_only) return 'idle';
  if (action === config.default_mode || !action) return 'idle';

  return 'other';
}

// --- Colors ---

const ACTION_COLORS: Record<ActionType, string> = {
  charge: '#4CAF50',
  charge_ev: '#2196F3',
  discharge: '#FF5722',
  solar: '#FF9800',
  pv_charge: '#8BC34A',
  self_consume: '#FFC107',
  paid_import: '#00BCD4',
  idle: '#9E9E9E',
  other: '#607D8B',
};

const ACTION_COLORS_ALPHA: Record<ActionType, string> = {
  charge: 'rgba(76, 175, 80, 0.15)',
  charge_ev: 'rgba(33, 150, 243, 0.15)',
  discharge: 'rgba(255, 87, 34, 0.15)',
  solar: 'rgba(255, 152, 0, 0.15)',
  pv_charge: 'rgba(139, 195, 74, 0.15)',
  self_consume: 'rgba(255, 193, 7, 0.15)',
  paid_import: 'rgba(0, 188, 212, 0.15)',
  idle: 'rgba(158, 158, 158, 0.08)',
  other: 'rgba(96, 125, 139, 0.1)',
};

export function getActionColor(type: ActionType): string {
  return ACTION_COLORS[type];
}

export function getActionBgColor(type: ActionType): string {
  return ACTION_COLORS_ALPHA[type];
}

// --- Icons ---

const ACTION_ICONS: Record<ActionType, string> = {
  charge: 'mdi:battery-charging',
  charge_ev: 'mdi:car-electric',
  discharge: 'mdi:battery-arrow-down',
  solar: 'mdi:solar-power',
  pv_charge: 'mdi:solar-panel',
  self_consume: 'mdi:home-battery',
  paid_import: 'mdi:cash-plus',
  idle: '',
  other: 'mdi:help-circle-outline',
};

export function getActionIcon(type: ActionType): string {
  return ACTION_ICONS[type];
}

// --- Labels ---

const ACTION_LABELS: Record<ActionType, string> = {
  charge: 'Charge',
  charge_ev: 'Charge + EV',
  discharge: 'Discharge',
  solar: 'Solar Only',
  pv_charge: 'PV Charge',
  self_consume: 'Self-Consume',
  paid_import: 'Paid Import',
  idle: 'Idle',
  other: 'Other',
};

export function getActionLabel(type: ActionType): string {
  return ACTION_LABELS[type];
}

// --- Date/Time formatters ---

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

interface NowParts {
  date: string;
  hour: number;
  weekday: number;
}

function nowInTz(timeZone?: string): NowParts {
  const now = new Date();
  if (!timeZone) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return { date: `${y}-${m}-${d}`, hour: now.getHours(), weekday: now.getDay() };
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  let hourStr = get('hour');
  if (hourStr === '24') hourStr = '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: parseInt(hourStr, 10),
    weekday: WEEKDAY_INDEX[get('weekday')] ?? 0,
  };
}

function weekdayOfDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
}

function dayMonthOfDateString(dateStr: string): { day: number; month: number } {
  const [, m, d] = dateStr.split('-').map(Number);
  return { day: d ?? 1, month: m ?? 1 };
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(timeZone?: string): string {
  return nowInTz(timeZone).date;
}

export function getTomorrow(timeZone?: string): string {
  const [y, m, d] = getToday(timeZone).split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d) + 86400000);
  const ny = next.getUTCFullYear();
  const nm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(next.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function getCurrentDateHour(timeZone?: string): { date: string; hour: number } {
  const { date, hour } = nowInTz(timeZone);
  return { date, hour };
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function formatDateTime(date: string, hour: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { day, month } = dayMonthOfDateString(date);
  return `${days[weekdayOfDateString(date)]} ${day}/${month} ${formatHour(hour)}`;
}

export function formatShortDate(date: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { day, month } = dayMonthOfDateString(date);
  return `${days[weekdayOfDateString(date)]} ${day}/${month}`;
}

export function formatDayLabel(date: string, timeZone?: string): string {
  const today = getToday(timeZone);
  const tomorrow = getTomorrow(timeZone);
  if (date === today) return 'Today';
  if (date === tomorrow) return 'Tomorrow';
  return formatShortDate(date);
}

export function formatPrice(
  price: number | undefined,
  decimals: number = 2,
  currency: string = '€'
): string {
  if (price === undefined || price === null) return '-';
  return `${price.toFixed(decimals)} ${currency}`;
}

export function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return 'Never';
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// --- Price data helpers ---

export function getAvailableHours(
  buyPrices: PricePoint[],
  sellPrices: PricePoint[],
  timeZone?: string
): HourData[] {
  const { date: today, hour: currentHour } = getCurrentDateHour(timeZone);

  const allHours: HourData[] = [];
  const seenKeys = new Set<string>();

  [...buyPrices, ...sellPrices].forEach((p) => {
    const key = `${p.date}-${p.hour}`;
    if (seenKeys.has(key)) return;
    if (p.date === today && p.hour < currentHour) return;
    if (p.date < today) return;

    seenKeys.add(key);
    allHours.push({
      date: p.date,
      hour: p.hour,
      buyPrice: buyPrices.find((b) => b.date === p.date && b.hour === p.hour)?.value,
      sellPrice: sellPrices.find((s) => s.date === p.date && s.hour === p.hour)?.value,
    });
  });

  allHours.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.hour - b.hour;
  });

  return allHours;
}

export function getCurrentPrice(
  buyPrices: PricePoint[],
  timeZone?: string
): number | undefined {
  const { date: today, hour } = getCurrentDateHour(timeZone);
  return buyPrices.find((p) => p.date === today && p.hour === hour)?.value;
}

// --- Weekday helpers ---

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getWeekdayName(index: number): string {
  return WEEKDAYS[index] ?? '';
}

export function getWeekdayShort(index: number): string {
  return WEEKDAYS_SHORT[index] ?? '';
}

export function getTodayWeekday(timeZone?: string): number {
  return nowInTz(timeZone).weekday;
}

// --- Debounce ---

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
}
