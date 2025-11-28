import type { HomeAssistant, IntegrationConfig, ScheduleData } from '@/types';

/**
 * API utilities for communicating with the integration
 */

const API_BASE = 'hacs_energy_scheduler';

export async function fetchConfig(hass: HomeAssistant): Promise<IntegrationConfig> {
  return hass.callApi<IntegrationConfig>('GET', `${API_BASE}/config`);
}

export async function fetchData(hass: HomeAssistant): Promise<ScheduleData> {
  return hass.callApi<ScheduleData>('GET', `${API_BASE}/data`);
}

export async function setSchedule(
  hass: HomeAssistant,
  date: string,
  hour: number,
  action: string,
  options?: {
    soc_limit?: number;
    soc_limit_type?: string;
    full_hour?: boolean;
    minutes?: number;
    ev_charging?: boolean;
  }
): Promise<void> {
  await hass.callService(API_BASE, 'set_schedule', {
    date,
    hour,
    action,
    ...options,
  });
}

export async function clearSchedule(
  hass: HomeAssistant,
  date: string,
  hour: number
): Promise<void> {
  await hass.callService(API_BASE, 'clear_schedule', { date, hour });
}

export async function clearDaySchedule(
  hass: HomeAssistant,
  date: string
): Promise<void> {
  await hass.callService(API_BASE, 'clear_day_schedule', { date });
}

export async function runOptimization(
  hass: HomeAssistant,
  hoursAhead: number = 24
): Promise<void> {
  await hass.callService(API_BASE, 'run_optimization', {
    hours_ahead: hoursAhead,
  });
}

export async function setMode(
  hass: HomeAssistant,
  mode: string
): Promise<void> {
  await hass.callService(API_BASE, 'set_mode', { mode });
}
