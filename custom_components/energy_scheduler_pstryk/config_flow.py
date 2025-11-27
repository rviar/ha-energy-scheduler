"""Config flow for Energy Scheduler Pstryk integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_DEFAULT_MODE,
    CONF_EV_STOP_ABOVE,
    CONF_EV_STOP_BELOW,
    CONF_EV_STOP_CONDITION_TYPE,
    CONF_EV_STOP_ENTITY,
    CONF_EV_STOP_STATE,
    CONF_INVERTER_MODE_ENTITY,
    CONF_PRICE_BUY_SENSOR,
    CONF_PRICE_SELL_SENSOR,
    CONF_SOC_SENSOR,
    DEFAULT_INVERTER_MODE_ENTITY,
    DEFAULT_PRICE_BUY_SENSOR,
    DEFAULT_PRICE_SELL_SENSOR,
    DOMAIN,
    NAME,
    STOP_CONDITION_NONE,
    STOP_CONDITION_NUMERIC_ABOVE,
    STOP_CONDITION_NUMERIC_BELOW,
    STOP_CONDITION_STATE,
    STOP_CONDITION_TYPES,
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
    """Handle a config flow for Energy Scheduler Pstryk."""

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
                vol.Optional(
                    CONF_EV_STOP_CONDITION_TYPE,
                    default=STOP_CONDITION_NONE,
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=STOP_CONDITION_NONE, label="None (disabled)"),
                            selector.SelectOptionDict(value=STOP_CONDITION_STATE, label="State equals"),
                            selector.SelectOptionDict(value=STOP_CONDITION_NUMERIC_BELOW, label="Value below threshold"),
                            selector.SelectOptionDict(value=STOP_CONDITION_NUMERIC_ABOVE, label="Value above threshold"),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="ev_stop_condition_type",
                    )
                ),
                vol.Optional(CONF_EV_STOP_ENTITY): selector.EntitySelector(
                    selector.EntitySelectorConfig()
                ),
                vol.Optional(CONF_EV_STOP_STATE): selector.TextSelector(
                    selector.TextSelectorConfig(type=selector.TextSelectorType.TEXT)
                ),
                vol.Optional(CONF_EV_STOP_BELOW): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=-1000000,
                        max=1000000,
                        step=0.1,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(CONF_EV_STOP_ABOVE): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=-1000000,
                        max=1000000,
                        step=0.1,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
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
    """Handle options flow for Energy Scheduler Pstryk."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Validate entities
            for entity_key in [CONF_INVERTER_MODE_ENTITY, CONF_PRICE_BUY_SENSOR, CONF_PRICE_SELL_SENSOR]:
                entity_id = user_input.get(entity_key)
                if entity_id:
                    state = self.hass.states.get(entity_id)
                    if state is None:
                        errors[entity_key] = "entity_not_found"

            if not errors:
                return self.async_create_entry(title="", data=user_input)

        current_config = {**self._config_entry.data, **self._config_entry.options}
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
                    default=current_config.get(CONF_SOC_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_EV_STOP_CONDITION_TYPE,
                    default=current_config.get(CONF_EV_STOP_CONDITION_TYPE, STOP_CONDITION_NONE),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=STOP_CONDITION_NONE, label="None (disabled)"),
                            selector.SelectOptionDict(value=STOP_CONDITION_STATE, label="State equals"),
                            selector.SelectOptionDict(value=STOP_CONDITION_NUMERIC_BELOW, label="Value below threshold"),
                            selector.SelectOptionDict(value=STOP_CONDITION_NUMERIC_ABOVE, label="Value above threshold"),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="ev_stop_condition_type",
                    )
                ),
                vol.Optional(
                    CONF_EV_STOP_ENTITY,
                    default=current_config.get(CONF_EV_STOP_ENTITY),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig()
                ),
                vol.Optional(
                    CONF_EV_STOP_STATE,
                    default=current_config.get(CONF_EV_STOP_STATE),
                ): selector.TextSelector(
                    selector.TextSelectorConfig(type=selector.TextSelectorType.TEXT)
                ),
                vol.Optional(
                    CONF_EV_STOP_BELOW,
                    default=current_config.get(CONF_EV_STOP_BELOW),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=-1000000,
                        max=1000000,
                        step=0.1,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_EV_STOP_ABOVE,
                    default=current_config.get(CONF_EV_STOP_ABOVE),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=-1000000,
                        max=1000000,
                        step=0.1,
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
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
            step_id="init",
            data_schema=data_schema,
            errors=errors,
        )
