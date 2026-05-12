import type { ScheduleEntry, IntegrationConfig, ActionType, HourData, PricePoint } from '@/types';
import { PLACEHOLDER_ACTIONS } from './action-constants';

// --- Action type resolution (presentation category) ---

export function resolveActionType(
  entry: ScheduleEntry,
  config: IntegrationConfig
): ActionType {
  const action = entry.action;

  if (action === PLACEHOLDER_ACTIONS.CHARGE || action === config.mode_charge_battery) {
    if (entry.ev_charging) return 'charge_ev';
    return 'charge';
  }
  if (action === config.mode_charge_ev) return 'charge_ev';
  if (action === config.mode_charge_ev_and_battery) return 'charge_ev';
  if (action === config.mode_sell) return 'discharge';
  if (action === config.mode_sell_solar_only) return 'solar';
  if (action === PLACEHOLDER_ACTIONS.PV_CHARGE) return 'pv_charge';
  if (action === PLACEHOLDER_ACTIONS.SELF_CONSUME_FIRST) return 'self_consume';
  if (action === PLACEHOLDER_ACTIONS.SELF_CONSUME_ONLY) return 'self_consume';
  if (action === PLACEHOLDER_ACTIONS.PAID_IMPORT) return 'paid_import';
  if (action === config.mode_self_consume) return 'self_consume';
  if (action === config.mode_grid_only) return 'idle';
  if (action === config.default_mode || !action) return 'idle';

  return 'other';
}

// --- Arbitrage predicates (economic-flow, see ADR-0002) ---
//
// Distinct from `resolveActionType`: that function answers "what category
// should I render this slot as?", these answer "does this slot exchange
// energy with the grid in a way that belongs in the Buy/Sell list?".
// `charge_ev` is a 'buy' (paid import) but a separate display category from
// `charge`, hence the dedicated predicates instead of folding into
// resolveActionType.

export function isBuyHour(entry: ScheduleEntry, config: IntegrationConfig): boolean {
  const a = entry.action;
  return (
    a === PLACEHOLDER_ACTIONS.CHARGE ||
    a === PLACEHOLDER_ACTIONS.PAID_IMPORT ||
    a === config.mode_charge_battery ||
    a === config.mode_charge_ev ||
    a === config.mode_charge_ev_and_battery
  );
}

export function isSellHour(entry: ScheduleEntry, config: IntegrationConfig): boolean {
  const a = entry.action;
  return a === config.mode_sell || a === config.mode_sell_solar_only;
}

// --- Presentation (color / bg / icon / label per ActionType) ---

interface ActionPresentation {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
}

const ACTION_PRESENTATION: Record<ActionType, ActionPresentation> = {
  charge:       { color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.15)',  icon: 'mdi:battery-charging',    label: 'Charge' },
  charge_ev:    { color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.15)', icon: 'mdi:car-electric',        label: 'Charge + EV' },
  discharge:    { color: '#FF5722', bgColor: 'rgba(255, 87, 34, 0.15)',  icon: 'mdi:battery-arrow-down',  label: 'Discharge' },
  solar:        { color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.15)',  icon: 'mdi:solar-power',         label: 'Solar Only' },
  pv_charge:    { color: '#8BC34A', bgColor: 'rgba(139, 195, 74, 0.15)', icon: 'mdi:solar-panel',         label: 'PV Charge' },
  self_consume: { color: '#FFC107', bgColor: 'rgba(255, 193, 7, 0.15)',  icon: 'mdi:home-battery',        label: 'Self-Consume' },
  paid_import:  { color: '#00BCD4', bgColor: 'rgba(0, 188, 212, 0.15)',  icon: 'mdi:cash-plus',           label: 'Paid Import' },
  // Intentionally lower alpha — idle slots should fade into the grid.
  idle:         { color: '#9E9E9E', bgColor: 'rgba(158, 158, 158, 0.08)', icon: '',                       label: 'Idle' },
  other:        { color: '#607D8B', bgColor: 'rgba(96, 125, 139, 0.1)',  icon: 'mdi:help-circle-outline', label: 'Other' },
};

export function getActionColor(type: ActionType): string {
  return ACTION_PRESENTATION[type].color;
}

export function getActionBgColor(type: ActionType): string {
  return ACTION_PRESENTATION[type].bgColor;
}

export function getActionIcon(type: ActionType): string {
  return ACTION_PRESENTATION[type].icon;
}

export function getActionLabel(type: ActionType): string {
  return ACTION_PRESENTATION[type].label;
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
