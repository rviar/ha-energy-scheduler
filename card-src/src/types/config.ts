/**
 * Card configuration types
 */

export interface EnergySchedulerCardConfig {
  type: string;
  title?: string;
  show_chart?: boolean;
  show_schedule?: boolean;
  chart_height?: number;
}

export interface IntegrationConfig {
  mode: string;
  entities: EntityConfig[];
  ev_charging_enabled?: boolean;
  ev_stop_condition?: string | string[];
  ev_min_soc?: number;
  ev_max_soc?: number;
  soc_sensor?: string;
  inverter_mode_entity?: string;
}

export interface EntityConfig {
  entity_id: string;
  name?: string;
  type?: string;
}

export interface PricePoint {
  date: string;
  hour: number;
  value: number;
}

export interface ScheduleData {
  schedule: Record<string, DaySchedule>;
  prices?: PriceData;
  current_mode?: string;
  optimization_result?: OptimizationResult;
  buy_prices?: PricePoint[];
  sell_prices?: PricePoint[];
  inverter_modes?: string[];
  default_mode?: string;
}

export interface DaySchedule {
  [hour: string]: HourAction;
}

export interface HourAction {
  action: 'charge' | 'discharge' | 'idle' | 'auto';
  soc_limit?: number;
  soc_limit_type?: 'min' | 'max';
  full_hour?: boolean;
  minutes?: number;
  manual?: boolean;
  ev_charging?: boolean;
}

export interface PriceData {
  current?: number;
  today?: HourPrice[];
  tomorrow?: HourPrice[];
  currency?: string;
  unit?: string;
}

export interface HourPrice {
  hour: number;
  price: number;
  start?: string;
  end?: string;
}

export interface OptimizationResult {
  schedule?: Record<string, unknown>;
  savings?: number;
  message?: string;
}
