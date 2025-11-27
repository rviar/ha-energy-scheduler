"""Constants for Energy Scheduler Pstryk integration."""
from typing import Final

DOMAIN: Final = "energy_scheduler_pstryk"
NAME: Final = "Energy Scheduler Pstryk"
VERSION: Final = "1.0.0"

# Configuration keys
CONF_PRICE_BUY_SENSOR: Final = "price_buy_sensor"
CONF_PRICE_SELL_SENSOR: Final = "price_sell_sensor"
CONF_INVERTER_MODE_ENTITY: Final = "inverter_mode_entity"
CONF_DEFAULT_MODE: Final = "default_mode"
CONF_SOC_SENSOR: Final = "soc_sensor"
# EV/Stop condition configuration
CONF_EV_STOP_CONDITION_TYPE: Final = "ev_stop_condition_type"
CONF_EV_STOP_ENTITY: Final = "ev_stop_entity"
CONF_EV_STOP_STATE: Final = "ev_stop_state"
CONF_EV_STOP_BELOW: Final = "ev_stop_below"
CONF_EV_STOP_ABOVE: Final = "ev_stop_above"

# Stop condition types
STOP_CONDITION_NONE: Final = "none"
STOP_CONDITION_STATE: Final = "state"
STOP_CONDITION_NUMERIC_BELOW: Final = "numeric_below"
STOP_CONDITION_NUMERIC_ABOVE: Final = "numeric_above"

STOP_CONDITION_TYPES: Final = [
    STOP_CONDITION_NONE,
    STOP_CONDITION_STATE,
    STOP_CONDITION_NUMERIC_BELOW,
    STOP_CONDITION_NUMERIC_ABOVE,
]

# Default sensor entities
DEFAULT_PRICE_BUY_SENSOR: Final = "sensor.energy_price_buy"
DEFAULT_PRICE_SELL_SENSOR: Final = "sensor.energy_price_sell"
DEFAULT_INVERTER_MODE_ENTITY: Final = "input_select.inverter_mode"

# Storage
STORAGE_KEY: Final = f"{DOMAIN}_schedule"
STORAGE_VERSION: Final = 1

# Panel
PANEL_URL: Final = f"/energy_scheduler_pstryk/panel.js"
PANEL_TITLE: Final = "Energy Scheduler"
PANEL_ICON: Final = "mdi:calendar-clock"
PANEL_NAME: Final = "energy-scheduler-panel"

# Services
SERVICE_SET_SCHEDULE: Final = "set_schedule"
SERVICE_CLEAR_SCHEDULE: Final = "clear_schedule"
SERVICE_APPLY_MODE: Final = "apply_mode"

# Attributes
ATTR_DATE: Final = "date"
ATTR_HOUR: Final = "hour"
ATTR_ACTION: Final = "action"
ATTR_SOC_LIMIT: Final = "soc_limit"
ATTR_SOC_LIMIT_TYPE: Final = "soc_limit_type"  # "max" (charge) or "min" (discharge)
ATTR_FULL_HOUR: Final = "full_hour"
ATTR_MINUTES: Final = "minutes"
ATTR_EV_CHARGING: Final = "ev_charging"

# Schedule execution
SCHEDULER_INTERVAL: Final = 60  # Check every minute
