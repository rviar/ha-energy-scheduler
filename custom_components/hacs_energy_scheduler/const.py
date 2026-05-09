"""Constants for HACS Energy Scheduler integration."""
from typing import Final

DOMAIN: Final = "hacs_energy_scheduler"
NAME: Final = "HACS Energy Scheduler"

# Configuration keys
CONF_PRICE_BUY_SENSOR: Final = "price_buy_sensor"
CONF_PRICE_SELL_SENSOR: Final = "price_sell_sensor"
CONF_INVERTER_MODE_ENTITY: Final = "inverter_mode_entity"
CONF_INVERTER_EXPORT_SURPLUS_SWITCH: Final = "inverter_export_surplus_switch"
CONF_INVERTER_PV_INPUT_SWITCH: Final = "inverter_pv_input_switch"
CONF_DEFAULT_MODE: Final = "default_mode"
CONF_CURRENCY: Final = "currency"
CONF_SOC_SENSOR: Final = "soc_sensor"
# EV/Stop condition configuration (uses HA native conditions)
CONF_EV_STOP_CONDITION: Final = "ev_stop_condition"

# Optimizer configuration - Battery
CONF_BATTERY_SOC_SENSOR: Final = "battery_soc_sensor"
CONF_BATTERY_CAPACITY: Final = "battery_capacity"
CONF_BATTERY_MIN_SOC: Final = "battery_min_soc"
CONF_BATTERY_MAX_CHARGE_POWER: Final = "battery_max_charge_power"
CONF_BATTERY_MAX_DISCHARGE_POWER: Final = "battery_max_discharge_power"
CONF_BATTERY_COST: Final = "battery_cost"
CONF_BATTERY_CYCLES: Final = "battery_cycles"

# Optimizer configuration - PV and consumption
CONF_PV_FORECAST_SENSOR: Final = "pv_forecast_sensor"
CONF_PV_FORECAST_TOMORROW_SENSOR: Final = "pv_forecast_tomorrow_sensor"
CONF_AVG_CONSUMPTION: Final = "avg_consumption"
CONF_MAX_GRID_POWER: Final = "max_grid_power"

# Optimizer configuration - EV (optional)
CONF_EV_ENABLED: Final = "ev_enabled"
CONF_EV_SOC_SENSOR: Final = "ev_soc_sensor"
CONF_EV_BATTERY_CAPACITY: Final = "ev_battery_capacity"
CONF_EV_MAX_CHARGE_POWER: Final = "ev_max_charge_power"
CONF_EV_TARGET_SOC: Final = "ev_target_soc"
CONF_EV_READY_BY: Final = "ev_ready_by"
CONF_EV_CONNECTED_SENSOR: Final = "ev_connected_sensor"

# Optimizer configuration - Inverter modes mapping
CONF_MODE_CHARGE_BATTERY: Final = "mode_charge_battery"
CONF_MODE_CHARGE_EV: Final = "mode_charge_ev"
CONF_MODE_CHARGE_EV_AND_BATTERY: Final = "mode_charge_ev_and_battery"
CONF_MODE_SELL: Final = "mode_sell"
CONF_MODE_SELL_SOLAR_ONLY: Final = "mode_sell_solar_only"
CONF_MODE_GRID_ONLY: Final = "mode_grid_only"
CONF_MODE_SELF_CONSUME: Final = "mode_self_consume"

# Optimizer configuration - Automation
CONF_MIN_SELL_PRICE: Final = "min_sell_price"
CONF_CONSUMPTION_SENSOR: Final = "consumption_sensor"
CONF_PRIORITY_HOME_LOW_THRESHOLD: Final = "priority_home_low_threshold"
CONF_PRIORITY_HOME_HIGH_THRESHOLD: Final = "priority_home_high_threshold"
CONF_PRIORITY_EV_HIGH_THRESHOLD: Final = "priority_ev_high_threshold"
CONF_MIN_DISCHARGE_ENERGY: Final = "min_discharge_energy"

# Optimizer configuration - PV confidence
CONF_PV_CONFIDENCE_FACTOR: Final = "pv_confidence_factor"
CONF_PV_PRODUCTION_SENSOR: Final = "pv_production_sensor"
CONF_PV_DYNAMIC_CORRECTION_ENABLED: Final = "pv_dynamic_correction_enabled"

# Dynamic PV confidence tuning
PV_DYNAMIC_FACTOR_MIN: Final = 0.3
PV_DYNAMIC_FACTOR_MAX: Final = 1.5
PV_DYNAMIC_THRESHOLD_KWH: Final = 2.0

# EV charger consumption sensor (for separating EV from home consumption profile)
CONF_EV_CHARGER_CONSUMPTION_SENSOR: Final = "ev_charger_consumption_sensor"

CONF_OPTIMIZE_INTERVAL: Final = "optimize_interval"

# Optimize interval options
OPTIMIZE_INTERVAL_MANUAL: Final = "manual"
OPTIMIZE_INTERVAL_HOURLY: Final = "hourly"
OPTIMIZE_INTERVAL_EVERY_6H: Final = "6h"
OPTIMIZE_INTERVAL_DAILY: Final = "daily"
OPTIMIZE_INTERVAL_REACTIVE: Final = "reactive"

# Default values for optimizer
DEFAULT_BATTERY_MIN_SOC: Final = 20
DEFAULT_AVG_CONSUMPTION: Final = 0.6
DEFAULT_MAX_GRID_POWER: Final = 15.0
DEFAULT_EV_TARGET_SOC: Final = 80
DEFAULT_MIN_SELL_PRICE: Final = 0.01
DEFAULT_PRIORITY_HOME_LOW: Final = 30
DEFAULT_PRIORITY_HOME_HIGH: Final = 80
DEFAULT_PRIORITY_EV_HIGH: Final = 50
DEFAULT_MIN_DISCHARGE_ENERGY: Final = 0.5
DEFAULT_PV_CONFIDENCE_FACTOR: Final = 100
DEFAULT_PV_DYNAMIC_CORRECTION_ENABLED: Final = True

# Default sensor entities
DEFAULT_PRICE_BUY_SENSOR: Final = "sensor.energy_price_buy"
DEFAULT_PRICE_SELL_SENSOR: Final = "sensor.energy_price_sell"
DEFAULT_INVERTER_MODE_ENTITY: Final = "input_select.inverter_mode"
DEFAULT_CURRENCY: Final = "€"

# Storage
STORAGE_KEY: Final = f"{DOMAIN}_schedule"
STORAGE_VERSION: Final = 1

# Panel
PANEL_URL: Final = f"/hacs_energy_scheduler/panel.js"
PANEL_TITLE: Final = "Energy Scheduler"
PANEL_ICON: Final = "mdi:calendar-clock"
PANEL_NAME: Final = "energy-scheduler-panel"

# Services
SERVICE_SET_SCHEDULE: Final = "set_schedule"
SERVICE_CLEAR_SCHEDULE: Final = "clear_schedule"
SERVICE_APPLY_MODE: Final = "apply_mode"
SERVICE_RUN_OPTIMIZATION: Final = "run_optimization"
SERVICE_EV_CHARGE_NOW: Final = "ev_charge_now"
SERVICE_EV_CHARGE_STOP: Final = "ev_charge_stop"

# EV charge control entities (optional — direct control)
CONF_EV_CHARGE_ENTITY: Final = "ev_charge_entity"
CONF_EV_AMPS_ENTITY: Final = "ev_amps_entity"
CONF_EV_MAX_CHARGE_AMPS: Final = "ev_max_charge_amps"
CONF_EV_VOLTAGE: Final = "ev_voltage"
DEFAULT_EV_MAX_CHARGE_AMPS: Final = 16
DEFAULT_EV_VOLTAGE: Final = 230

# EV charge current limits
CONF_EV_MIN_CHARGE_AMPS: Final = "ev_min_charge_amps"
DEFAULT_EV_MIN_CHARGE_AMPS: Final = 6

# Breaker protection
CONF_BREAKER_POWER_LIMIT: Final = "breaker_power_limit"
CONF_LOAD_POWER_SENSOR: Final = "load_power_sensor"
DEFAULT_BREAKER_POWER_LIMIT: Final = 0.0  # 0 = disabled

# EV charge reasons
EV_REASON_NONE: Final = "none"
EV_REASON_CHEAP_HOUR: Final = "cheap_hour"
EV_REASON_NEGATIVE_PRICE: Final = "negative_price"
EV_REASON_PV_EXCESS: Final = "pv_excess"
EV_REASON_MANUAL: Final = "manual"

# Special action for dynamic charge mode
ACTION_CHARGE: Final = "CHARGE"
ACTION_PV_CHARGE: Final = "PV_CHARGE"
ACTION_SELF_CONSUME_FIRST: Final = "SELF_CONSUME_FIRST"
ACTION_SELF_CONSUME_ONLY: Final = "SELF_CONSUME_ONLY"
ACTION_PAID_IMPORT: Final = "PAID_IMPORT"

# Attributes
ATTR_DATE: Final = "date"
ATTR_HOUR: Final = "hour"
ATTR_ACTION: Final = "action"
ATTR_SOC_LIMIT: Final = "soc_limit"
ATTR_SOC_LIMIT_TYPE: Final = "soc_limit_type"  # "auto", "max" (charge), or "min" (discharge)
ATTR_FULL_HOUR: Final = "full_hour"
ATTR_MINUTES: Final = "minutes"
ATTR_EV_CHARGING: Final = "ev_charging"
ATTR_EV_CHARGE_REASON: Final = "ev_charge_reason"
ATTR_EXPORT_SURPLUS: Final = "export_surplus"

# Events
EVENT_SCHEDULE_UPDATED: Final = f"{DOMAIN}_updated"

# Schedule execution
SCHEDULER_INTERVAL: Final = 60  # Check every minute
