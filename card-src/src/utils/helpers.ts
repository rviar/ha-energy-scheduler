/**
 * Helper utilities
 */

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date string
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Get tomorrow's date string
 */
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}

/**
 * Get current hour (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Format price for display
 */
export function formatPrice(price: number | undefined, currency: string = '₽'): string {
  if (price === undefined || price === null) return '-';
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Get color for action type
 */
export function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    charge: '#4caf50',
    discharge: '#f44336',
    idle: '#9e9e9e',
    auto: '#2196f3',
  };
  return colors[action] || colors.idle;
}

/**
 * Get icon for action type
 */
export function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    charge: '⚡',
    discharge: '🔋',
    idle: '⏸️',
    auto: '🤖',
  };
  return icons[action] || '❓';
}

/**
 * Get display name for action
 */
export function getActionName(action: string): string {
  const names: Record<string, string> = {
    charge: 'Charge',
    discharge: 'Discharge',
    idle: 'Idle',
    auto: 'Auto',
  };
  return names[action] || action;
}

/**
 * Format day name
 */
export function formatDayName(date: string, locale: string = 'en'): string {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (formatDate(d) === formatDate(today)) return 'Today';
  if (formatDate(d) === formatDate(tomorrow)) return 'Tomorrow';

  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
