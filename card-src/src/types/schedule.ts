/**
 * Schedule, price, and optimization types
 */

export interface PricePoint {
  date: string;
  hour: number;
  value: number;
}

export interface ScheduleEntry {
  action: string;
  soc_limit?: number;
  soc_limit_type?: string;
  full_hour?: boolean;
  minutes?: number;
  manual?: boolean;
  ev_charging?: boolean;
  ev_charge_reason?: string;
  export_surplus?: boolean;
  pv_input?: boolean;
}

export interface LastOptimization {
  timestamp: string | null;
  charge_hours: number;
  discharge_hours: number;
  solar_hours: number;
  self_consume_hours: number;
  estimated_profit: number;
  cycle_cost: number;
  warnings: string[];
}

export interface PvDynamicData {
  factor: number;
  active: boolean;
  reason: string;
  actual_today_kwh: number | null;
  baseline_elapsed_kwh: number | null;
  baseline_today_kwh: number | null;
  solcast_confidence: number | null;
}

export interface ScheduleData {
  schedule: Record<string, Record<string, ScheduleEntry>>;
  buy_prices: PricePoint[];
  sell_prices: PricePoint[];
  pv_forecast?: Array<{ date: string; hour: number; kwh: number }>;
  inverter_modes: string[];
  default_mode: string;
  current_action?: string;
  paused?: boolean;
  last_optimization?: LastOptimization;
  pv_dynamic?: PvDynamicData;
}

export interface HourData {
  date: string;
  hour: number;
  buyPrice?: number;
  sellPrice?: number;
  pvForecast?: number;
}

export interface ConsumptionProfile {
  has_profile: boolean;
  profile?: Record<string, Record<string, number>>;
  ev_profile?: Record<string, Record<string, number>>;
  has_ev_sensor?: boolean;
  fallback_avg?: number;
  avg_daily?: number;
  updated?: string;
}

export type ActionType =
  | 'charge'
  | 'charge_ev'
  | 'discharge'
  | 'solar'
  | 'pv_charge'
  | 'self_consume'
  | 'paid_import'
  | 'idle'
  | 'other';
