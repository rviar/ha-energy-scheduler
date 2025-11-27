"""Config flow for HACS Energy Scheduler integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_AUTO_OPTIMIZE,
    CONF_AVG_CONSUMPTION,
    CONF_BATTERY_CAPACITY,
    CONF_BATTERY_COST,
    CONF_BATTERY_CYCLES,
    CONF_BATTERY_MAX_CHARGE_POWER,
    CONF_BATTERY_MAX_DISCHARGE_POWER,
    CONF_BATTERY_MIN_SOC,
    CONF_BATTERY_SOC_SENSOR,
    CONF_DEFAULT_MODE,
    CONF_EV_BATTERY_CAPACITY,
    CONF_EV_CONNECTED_SENSOR,
    CONF_EV_ENABLED,
    CONF_EV_MAX_CHARGE_POWER,
    CONF_EV_READY_BY,
    CONF_EV_SOC_SENSOR,
    CONF_EV_STOP_CONDITION,
    CONF_EV_TARGET_SOC,
    CONF_INVERTER_MODE_ENTITY,
    CONF_MAX_GRID_POWER,
    CONF_MODE_CHARGE_BATTERY,
    CONF_MODE_CHARGE_EV,
    CONF_MODE_CHARGE_EV_AND_BATTERY,
    CONF_MODE_GRID_ONLY,
    CONF_MODE_SELL,
    CONF_MODE_SELL_SOLAR_ONLY,
    CONF_OPTIMIZE_INTERVAL,
    CONF_PRICE_BUY_SENSOR,
    CONF_PRICE_SELL_SENSOR,
    CONF_PV_FORECAST_SENSOR,
    CONF_SOC_SENSOR,
    DEFAULT_AVG_CONSUMPTION,
    DEFAULT_BATTERY_MIN_SOC,
    DEFAULT_EV_TARGET_SOC,
    DEFAULT_INVERTER_MODE_ENTITY,
    DEFAULT_MAX_GRID_POWER,
    DEFAULT_PRICE_BUY_SENSOR,
    DEFAULT_PRICE_SELL_SENSOR,
    DOMAIN,
    NAME,
    OPTIMIZE_INTERVAL_DAILY,
    OPTIMIZE_INTERVAL_EVERY_6H,
    OPTIMIZE_INTERVAL_HOURLY,
    OPTIMIZE_INTERVAL_MANUAL,
)

_LOGGER = logging.getLogger(__name__)


def _get_input_select_entities(hass: HomeAssistant) -> list[str]:
    """Get all input_select entities."""
    return [
        entity_id
        for entity_id in hass.states.async_entity_ids("input_select")
    ]


def _get_sensor_entities(hass: HomeAssistant) -> list[str]:
    """Get all sensor entities."""
    return [
        entity_id
        for entity_id in hass.states.async_entity_ids("sensor")
    ]


def _get_input_select_options(hass: HomeAssistant, entity_id: str) -> list[str]:
    """Get options from an input_select entity."""
    state = hass.states.get(entity_id)
    if state is None:
        return []
    return state.attributes.get("options", [])


class EnergySchedulerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HACS Energy Scheduler."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._data: dict[str, Any] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Validate the inverter mode entity exists
            inverter_entity = user_input.get(CONF_INVERTER_MODE_ENTITY)
            if inverter_entity:
                state = self.hass.states.get(inverter_entity)
                if state is None:
                    errors[CONF_INVERTER_MODE_ENTITY] = "entity_not_found"

            # Validate price sensors exist
            for sensor_key in [CONF_PRICE_BUY_SENSOR, CONF_PRICE_SELL_SENSOR]:
                sensor_id = user_input.get(sensor_key)
                if sensor_id:
                    state = self.hass.states.get(sensor_id)
                    if state is None:
                        errors[sensor_key] = "entity_not_found"

            if not errors:
                self._data = user_input
                return await self.async_step_default_mode()

        # Get available entities
        input_selects = _get_input_select_entities(self.hass)
        sensors = _get_sensor_entities(self.hass)

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_PRICE_BUY_SENSOR,
                    default=DEFAULT_PRICE_BUY_SENSOR,
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Required(
                    CONF_PRICE_SELL_SENSOR,
                    default=DEFAULT_PRICE_SELL_SENSOR,
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Required(
                    CONF_INVERTER_MODE_ENTITY,
                    default=DEFAULT_INVERTER_MODE_ENTITY,
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="input_select")
                ),
                vol.Optional(CONF_SOC_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_EV_STOP_CONDITION): selector.ConditionSelector(),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "name": NAME,
            },
        )

    async def async_step_default_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the default mode selection step."""
        errors: dict[str, str] = {}

        inverter_entity = self._data.get(CONF_INVERTER_MODE_ENTITY)
        options = _get_input_select_options(self.hass, inverter_entity)

        if user_input is not None:
            default_mode = user_input.get(CONF_DEFAULT_MODE)
            if default_mode and default_mode not in options:
                errors[CONF_DEFAULT_MODE] = "invalid_mode"
            else:
                self._data[CONF_DEFAULT_MODE] = default_mode

                # Check for existing entry
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=NAME,
                    data=self._data,
                )

        if not options:
            return self.async_abort(reason="no_inverter_modes")

        data_schema = vol.Schema(
            {
                vol.Required(CONF_DEFAULT_MODE): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=options,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="default_mode",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "inverter_entity": inverter_entity,
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> EnergySchedulerOptionsFlow:
        """Get the options flow for this handler."""
        return EnergySchedulerOptionsFlow(config_entry)


class EnergySchedulerOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for HACS Energy Scheduler."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry
        # Start with existing options to preserve them across menu steps
        self._options: dict[str, Any] = dict(config_entry.options)

    def _get_current_config(self) -> dict[str, Any]:
        """Get current configuration merged with options."""
        return {**self._config_entry.data, **self._options}

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Initial step - show menu."""
        return self.async_show_menu(
            step_id="init",
            menu_options=[
                "basic",
                "battery",
                "forecast",
                "ev",
                "modes",
                "automation",
            ],
        )

    async def async_step_basic(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle basic settings (original options)."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            # Validate entities
            for entity_key in [CONF_INVERTER_MODE_ENTITY, CONF_PRICE_BUY_SENSOR, CONF_PRICE_SELL_SENSOR]:
                entity_id = user_input.get(entity_key)
                if entity_id:
                    state = self.hass.states.get(entity_id)
                    if state is None:
                        errors[entity_key] = "entity_not_found"

            if not errors:
                self._options.update(user_input)
                return self.async_create_entry(title="", data=self._options)

        inverter_entity = current_config.get(CONF_INVERTER_MODE_ENTITY, DEFAULT_INVERTER_MODE_ENTITY)
        options = _get_input_select_options(self.hass, inverter_entity)

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_PRICE_BUY_SENSOR,
                    default=current_config.get(CONF_PRICE_BUY_SENSOR, DEFAULT_PRICE_BUY_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Required(
                    CONF_PRICE_SELL_SENSOR,
                    default=current_config.get(CONF_PRICE_SELL_SENSOR, DEFAULT_PRICE_SELL_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Required(
                    CONF_INVERTER_MODE_ENTITY,
                    default=inverter_entity,
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="input_select")
                ),
                vol.Optional(
                    CONF_SOC_SENSOR,
                    description={"suggested_value": current_config.get(CONF_SOC_SENSOR)},
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_EV_STOP_CONDITION,
                    description={"suggested_value": current_config.get(CONF_EV_STOP_CONDITION)},
                ): selector.ConditionSelector(),
                vol.Required(
                    CONF_DEFAULT_MODE,
                    default=current_config.get(CONF_DEFAULT_MODE, ""),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=options if options else [""],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="basic",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_battery(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle battery optimizer settings."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            # Validate battery SOC sensor
            soc_sensor = user_input.get(CONF_BATTERY_SOC_SENSOR)
            if soc_sensor:
                state = self.hass.states.get(soc_sensor)
                if state is None:
                    errors[CONF_BATTERY_SOC_SENSOR] = "entity_not_found"

            if not errors:
                self._options.update(user_input)
                return self.async_create_entry(title="", data=self._options)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_BATTERY_SOC_SENSOR,
                    description={"suggested_value": current_config.get(CONF_BATTERY_SOC_SENSOR)},
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_BATTERY_CAPACITY,
                    default=current_config.get(CONF_BATTERY_CAPACITY, 0.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=100,
                        step=0.1,
                        unit_of_measurement="kWh",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_BATTERY_MIN_SOC,
                    default=current_config.get(CONF_BATTERY_MIN_SOC, DEFAULT_BATTERY_MIN_SOC),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=100,
                        step=1,
                        unit_of_measurement="%",
                        mode=selector.NumberSelectorMode.SLIDER,
                    )
                ),
                vol.Optional(
                    CONF_BATTERY_MAX_CHARGE_POWER,
                    default=current_config.get(CONF_BATTERY_MAX_CHARGE_POWER, 0.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=50,
                        step=0.1,
                        unit_of_measurement="kW",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_BATTERY_MAX_DISCHARGE_POWER,
                    default=current_config.get(CONF_BATTERY_MAX_DISCHARGE_POWER, 0.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=50,
                        step=0.1,
                        unit_of_measurement="kW",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_BATTERY_COST,
                    default=current_config.get(CONF_BATTERY_COST, 0.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=50000,
                        step=100,
                        unit_of_measurement="€",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_BATTERY_CYCLES,
                    default=current_config.get(CONF_BATTERY_CYCLES, 6000),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=100,
                        max=20000,
                        step=100,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="battery",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_forecast(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle PV forecast and consumption settings."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            # Validate PV forecast sensor
            pv_sensor = user_input.get(CONF_PV_FORECAST_SENSOR)
            if pv_sensor:
                state = self.hass.states.get(pv_sensor)
                if state is None:
                    errors[CONF_PV_FORECAST_SENSOR] = "entity_not_found"

            if not errors:
                self._options.update(user_input)
                return self.async_create_entry(title="", data=self._options)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PV_FORECAST_SENSOR,
                    description={"suggested_value": current_config.get(CONF_PV_FORECAST_SENSOR)},
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_AVG_CONSUMPTION,
                    default=current_config.get(CONF_AVG_CONSUMPTION, DEFAULT_AVG_CONSUMPTION),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=10,
                        step=0.1,
                        unit_of_measurement="kW",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_MAX_GRID_POWER,
                    default=current_config.get(CONF_MAX_GRID_POWER, DEFAULT_MAX_GRID_POWER),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=1,
                        max=50,
                        step=0.5,
                        unit_of_measurement="kW",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="forecast",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_ev(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle EV settings (optional)."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            ev_enabled = user_input.get(CONF_EV_ENABLED, False)

            # Validate EV sensors only if EV is enabled
            if ev_enabled:
                for sensor_key in [CONF_EV_SOC_SENSOR, CONF_EV_CONNECTED_SENSOR]:
                    sensor_id = user_input.get(sensor_key)
                    if sensor_id:
                        state = self.hass.states.get(sensor_id)
                        if state is None:
                            errors[sensor_key] = "entity_not_found"

            if not errors:
                self._options.update(user_input)
                return self.async_create_entry(title="", data=self._options)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_EV_ENABLED,
                    default=current_config.get(CONF_EV_ENABLED, False),
                ): selector.BooleanSelector(),
                vol.Optional(
                    CONF_EV_SOC_SENSOR,
                    description={"suggested_value": current_config.get(CONF_EV_SOC_SENSOR)},
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_EV_BATTERY_CAPACITY,
                    default=current_config.get(CONF_EV_BATTERY_CAPACITY, 0.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=200,
                        step=1,
                        unit_of_measurement="kWh",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_EV_MAX_CHARGE_POWER,
                    default=current_config.get(CONF_EV_MAX_CHARGE_POWER, 11.0),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=50,
                        step=0.5,
                        unit_of_measurement="kW",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_EV_TARGET_SOC,
                    default=current_config.get(CONF_EV_TARGET_SOC, DEFAULT_EV_TARGET_SOC),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=100,
                        step=5,
                        unit_of_measurement="%",
                        mode=selector.NumberSelectorMode.SLIDER,
                    )
                ),
                vol.Optional(
                    CONF_EV_CONNECTED_SENSOR,
                    description={"suggested_value": current_config.get(CONF_EV_CONNECTED_SENSOR)},
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain=["binary_sensor", "sensor"])
                ),
                vol.Optional(
                    CONF_EV_READY_BY,
                    description={"suggested_value": current_config.get(CONF_EV_READY_BY)},
                ): selector.TimeSelector(),
            }
        )

        return self.async_show_form(
            step_id="ev",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_modes(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle inverter mode mapping settings."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            self._options.update(user_input)
            return self.async_create_entry(title="", data=self._options)

        # Get available modes from inverter entity
        inverter_entity = current_config.get(CONF_INVERTER_MODE_ENTITY, DEFAULT_INVERTER_MODE_ENTITY)
        available_modes = _get_input_select_options(self.hass, inverter_entity)
        if not available_modes:
            available_modes = [""]

        # Check if EV is enabled to show EV mode options
        ev_enabled = current_config.get(CONF_EV_ENABLED, False)

        schema_dict = {
            vol.Optional(
                CONF_MODE_CHARGE_BATTERY,
                description={"suggested_value": current_config.get(CONF_MODE_CHARGE_BATTERY)},
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
            vol.Optional(
                CONF_MODE_SELL,
                description={"suggested_value": current_config.get(CONF_MODE_SELL)},
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
            vol.Optional(
                CONF_MODE_SELL_SOLAR_ONLY,
                description={"suggested_value": current_config.get(CONF_MODE_SELL_SOLAR_ONLY)},
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
            vol.Optional(
                CONF_MODE_GRID_ONLY,
                description={"suggested_value": current_config.get(CONF_MODE_GRID_ONLY)},
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
        }

        # Add EV mode options only if EV is enabled
        if ev_enabled:
            schema_dict[vol.Optional(
                CONF_MODE_CHARGE_EV,
                description={"suggested_value": current_config.get(CONF_MODE_CHARGE_EV)},
            )] = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            )
            schema_dict[vol.Optional(
                CONF_MODE_CHARGE_EV_AND_BATTERY,
                description={"suggested_value": current_config.get(CONF_MODE_CHARGE_EV_AND_BATTERY)},
            )] = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=available_modes,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            )

        data_schema = vol.Schema(schema_dict)

        return self.async_show_form(
            step_id="modes",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_automation(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle automation settings."""
        errors: dict[str, str] = {}
        current_config = self._get_current_config()

        if user_input is not None:
            self._options.update(user_input)
            return self.async_create_entry(title="", data=self._options)

        interval_options = [
            selector.SelectOptionDict(value=OPTIMIZE_INTERVAL_MANUAL, label="Manual"),
            selector.SelectOptionDict(value=OPTIMIZE_INTERVAL_HOURLY, label="Every hour"),
            selector.SelectOptionDict(value=OPTIMIZE_INTERVAL_EVERY_6H, label="Every 6 hours"),
            selector.SelectOptionDict(value=OPTIMIZE_INTERVAL_DAILY, label="Daily"),
        ]

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_AUTO_OPTIMIZE,
                    default=current_config.get(CONF_AUTO_OPTIMIZE, False),
                ): selector.BooleanSelector(),
                vol.Optional(
                    CONF_OPTIMIZE_INTERVAL,
                    default=current_config.get(CONF_OPTIMIZE_INTERVAL, OPTIMIZE_INTERVAL_MANUAL),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=interval_options,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="automation",
            data_schema=data_schema,
            errors=errors,
        )
