"""Constants for HACS Energy Scheduler integration."""
from typing import Final

DOMAIN: Final = "hacs_energy_scheduler"
NAME: Final = "HACS Energy Scheduler"

# Configuration keys
CONF_PRICE_BUY_SENSOR: Final = "price_buy_sensor"
CONF_PRICE_SELL_SENSOR: Final = "price_sell_sensor"
CONF_INVERTER_MODE_ENTITY: Final = "inverter_mode_entity"
CONF_DEFAULT_MODE: Final = "default_mode"
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

# Optimizer configuration - Automation
CONF_AUTO_OPTIMIZE: Final = "auto_optimize"
CONF_OPTIMIZE_INTERVAL: Final = "optimize_interval"

# Optimize interval options
OPTIMIZE_INTERVAL_MANUAL: Final = "manual"
OPTIMIZE_INTERVAL_HOURLY: Final = "hourly"
OPTIMIZE_INTERVAL_EVERY_6H: Final = "every_6h"
OPTIMIZE_INTERVAL_DAILY: Final = "daily"

# Default values for optimizer
DEFAULT_BATTERY_MIN_SOC: Final = 20
DEFAULT_AVG_CONSUMPTION: Final = 0.6
DEFAULT_MAX_GRID_POWER: Final = 15.0
DEFAULT_EV_TARGET_SOC: Final = 80

# Default sensor entities
DEFAULT_PRICE_BUY_SENSOR: Final = "sensor.energy_price_buy"
DEFAULT_PRICE_SELL_SENSOR: Final = "sensor.energy_price_sell"
DEFAULT_INVERTER_MODE_ENTITY: Final = "input_select.inverter_mode"

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

# Special action for dynamic charge mode
ACTION_CHARGE: Final = "CHARGE"

# Attributes
ATTR_DATE: Final = "date"
ATTR_HOUR: Final = "hour"
ATTR_ACTION: Final = "action"
ATTR_SOC_LIMIT: Final = "soc_limit"
ATTR_SOC_LIMIT_TYPE: Final = "soc_limit_type"  # "auto", "max" (charge), or "min" (discharge)
ATTR_FULL_HOUR: Final = "full_hour"
ATTR_MINUTES: Final = "minutes"
ATTR_EV_CHARGING: Final = "ev_charging"

# Schedule execution
SCHEDULER_INTERVAL: Final = 60  # Check every minute
