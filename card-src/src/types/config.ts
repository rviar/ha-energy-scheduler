/**
 * Card and integration configuration types
 */

export interface EnergySchedulerCardConfig {
  type: string;
  title?: string;
  show_chart?: boolean;
  show_status_bar?: boolean;
  show_ev_tab?: 'auto' | 'always' | 'never';
  chart_height?: number;
  default_tab?: 'schedule' | 'ev' | 'stats';
  price_decimals?: number;
  currency?: string;
}

export interface IntegrationConfig {
  price_buy_sensor: string;
  price_sell_sensor: string;
  inverter_mode_entity: string;
  inverter_export_surplus_switch?: string;
  inverter_pv_input_switch?: string;
  default_mode: string;
  currency?: string;
  soc_sensor?: string;
  ev_stop_condition?: string | string[];
  // Mode mappings
  mode_charge_battery?: string;
  mode_charge_ev?: string;
  mode_charge_ev_and_battery?: string;
  mode_sell?: string;
  mode_sell_solar_only?: string;
  mode_grid_only?: string;
  mode_self_consume?: string;
  min_sell_price?: number;
  consumption_sensor?: string;
  optimize_interval?: string;
  // EV config
  ev_enabled?: boolean;
  ev_connected_sensor?: string;
  ev_soc_sensor?: string;
  ev_max_charge_amps?: number;
  ev_voltage?: number;
}
