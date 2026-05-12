import type {
  HomeAssistant,
  IntegrationConfig,
  ScheduleData,
  ConsumptionProfile,
} from '@/types';
import { getToday, getTomorrow } from './helpers';

const API_BASE = 'hacs_energy_scheduler';
// Must match EVENT_SCHEDULE_UPDATED in const.py
export const EVENT_SCHEDULE_UPDATED = `${API_BASE}_updated`;

export async function fetchConfig(hass: HomeAssistant): Promise<IntegrationConfig> {
  return hass.callApi<IntegrationConfig>('GET', `${API_BASE}/config`);
}

export async function fetchData(hass: HomeAssistant): Promise<ScheduleData> {
  return hass.callApi<ScheduleData>('GET', `${API_BASE}/data`);
}

export async function fetchConsumptionProfile(
  hass: HomeAssistant
): Promise<ConsumptionProfile> {
  return hass.callApi<ConsumptionProfile>('GET', `${API_BASE}/consumption_profile`);
}

export async function saveSchedule(
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
  await hass.callApi('POST', `${API_BASE}/schedule`, {
    date,
    hour,
    action,
    ...options,
  });
}

export async function clearSchedule(
  hass: HomeAssistant,
  date: string,
  hour?: number
): Promise<void> {
  let url = `${API_BASE}/schedule?date=${date}`;
  if (hour !== undefined) url += `&hour=${hour}`;
  await hass.callApi('DELETE', url);
}

export async function setManualFlag(
  hass: HomeAssistant,
  date: string,
  hour: number,
  manual: boolean
): Promise<void> {
  await hass.callApi('POST', `${API_BASE}/manual`, { date, hour, manual });
}

export async function setPaused(
  hass: HomeAssistant,
  paused: boolean
): Promise<void> {
  await hass.callApi('POST', `${API_BASE}/pause`, { paused });
}

export async function setOptimizeInterval(
  hass: HomeAssistant,
  interval: string
): Promise<void> {
  await hass.callApi('POST', `${API_BASE}/optimize_interval`, { interval });
}

export async function runOptimization(
  hass: HomeAssistant,
  hoursAhead: number = 36
): Promise<void> {
  await hass.callService(API_BASE, 'run_optimization', {
    hours_ahead: hoursAhead,
  });
}

export async function clearAllSchedules(hass: HomeAssistant): Promise<void> {
  const tz = hass.config?.time_zone;
  await hass.callService(API_BASE, 'clear_schedule', { date: getToday(tz) });
  await hass.callService(API_BASE, 'clear_schedule', { date: getTomorrow(tz) });
}

export async function evChargeNow(hass: HomeAssistant): Promise<void> {
  await hass.callService(API_BASE, 'ev_charge_now', {});
}

export async function evChargeStop(hass: HomeAssistant): Promise<void> {
  await hass.callService(API_BASE, 'ev_charge_stop', {});
}

