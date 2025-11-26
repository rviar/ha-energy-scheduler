"""Energy Scheduler Pstryk integration for Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    ATTR_ACTION,
    ATTR_DATE,
    ATTR_FULL_HOUR,
    ATTR_HOUR,
    ATTR_MINUTES,
    ATTR_SOC_LIMIT,
    DOMAIN,
    PANEL_ICON,
    PANEL_NAME,
    PANEL_TITLE,
    PANEL_URL,
    SERVICE_APPLY_MODE,
    SERVICE_CLEAR_SCHEDULE,
    SERVICE_SET_SCHEDULE,
)
from .coordinator import EnergySchedulerCoordinator
from .storage_manager import ScheduleStorageManager

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = []

SET_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.string,
        vol.Required(ATTR_HOUR): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
        vol.Required(ATTR_ACTION): cv.string,
        vol.Optional(ATTR_SOC_LIMIT): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional(ATTR_FULL_HOUR, default=False): cv.boolean,
        vol.Optional(ATTR_MINUTES): vol.All(vol.Coerce(int), vol.Range(min=1, max=60)),
    }
)

CLEAR_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.string,
        vol.Optional(ATTR_HOUR): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
    }
)

APPLY_MODE_SCHEMA = vol.Schema(
    {
        vol.Required("mode"): cv.string,
    }
)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Energy Scheduler Pstryk component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Energy Scheduler Pstryk from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Initialize storage manager
    storage = ScheduleStorageManager(hass)

    # Get config from entry
    config = {**entry.data, **entry.options}

    # Initialize coordinator
    coordinator = EnergySchedulerCoordinator(hass, config, storage)
    await coordinator.async_setup()

    # Store coordinator reference
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "storage": storage,
    }

    # Register panel
    await _async_register_panel(hass)

    # Register services
    await _async_register_services(hass, coordinator)

    # Register API views
    await _async_register_api(hass, coordinator)

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Listen for options updates
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    _LOGGER.info("Energy Scheduler Pstryk integration set up successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        # Shutdown coordinator
        data = hass.data[DOMAIN].pop(entry.entry_id)
        coordinator = data["coordinator"]
        await coordinator.async_shutdown()

        # Remove panel if no more entries
        if not hass.data[DOMAIN]:
            frontend.async_remove_panel(hass, DOMAIN)

    return unload_ok


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the frontend panel."""
    # Register the panel
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=DOMAIN,
        config={
            "_panel_custom": {
                "name": PANEL_NAME,
                "embed_iframe": False,
                "trust_external": False,
                "module_url": PANEL_URL,
            }
        },
        require_admin=False,
    )

    # Add static path for panel files
    hass.http.register_static_path(
        "/energy_scheduler_pstryk",
        str(Path(__file__).parent.parent.parent / "www" / "energy_scheduler_pstryk"),
        cache_headers=False,
    )

    _LOGGER.debug("Registered Energy Scheduler panel")


async def _async_register_services(
    hass: HomeAssistant, coordinator: EnergySchedulerCoordinator
) -> None:
    """Register services for the integration."""

    async def handle_set_schedule(call: ServiceCall) -> None:
        """Handle the set_schedule service call."""
        date = call.data[ATTR_DATE]
        hour = str(call.data[ATTR_HOUR])
        action = call.data[ATTR_ACTION]
        soc_limit = call.data.get(ATTR_SOC_LIMIT)
        full_hour = call.data.get(ATTR_FULL_HOUR, False)
        minutes = call.data.get(ATTR_MINUTES)

        await coordinator.async_set_schedule(
            date, hour, action, soc_limit, full_hour, minutes
        )

    async def handle_clear_schedule(call: ServiceCall) -> None:
        """Handle the clear_schedule service call."""
        date = call.data[ATTR_DATE]
        hour = call.data.get(ATTR_HOUR)
        hour_str = str(hour) if hour is not None else None

        await coordinator.async_clear_schedule(date, hour_str)

    async def handle_apply_mode(call: ServiceCall) -> None:
        """Handle the apply_mode service call."""
        mode = call.data["mode"]
        await coordinator.async_apply_mode_now(mode)

    hass.services.async_register(
        DOMAIN, SERVICE_SET_SCHEDULE, handle_set_schedule, schema=SET_SCHEDULE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_SCHEDULE, handle_clear_schedule, schema=CLEAR_SCHEDULE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_APPLY_MODE, handle_apply_mode, schema=APPLY_MODE_SCHEMA
    )

    _LOGGER.debug("Registered Energy Scheduler services")


async def _async_register_api(
    hass: HomeAssistant, coordinator: EnergySchedulerCoordinator
) -> None:
    """Register API endpoints for the panel."""
    from aiohttp import web

    from homeassistant.components.http import HomeAssistantView

    class EnergySchedulerDataView(HomeAssistantView):
        """API view for getting scheduler data."""

        url = "/api/energy_scheduler_pstryk/data"
        name = "api:energy_scheduler_pstryk:data"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request."""
            data = await coordinator._async_fetch_data()
            return self.json(data)

    class EnergySchedulerScheduleView(HomeAssistantView):
        """API view for managing schedules."""

        url = "/api/energy_scheduler_pstryk/schedule"
        name = "api:energy_scheduler_pstryk:schedule"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request for schedule."""
            date = request.query.get("date")
            schedule = coordinator.storage.get_schedule(date)
            return self.json(schedule)

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to set schedule."""
            try:
                data = await request.json()
                date = data.get("date")
                hour = str(data.get("hour"))
                action = data.get("action")
                soc_limit = data.get("soc_limit")
                full_hour = data.get("full_hour", False)
                minutes = data.get("minutes")

                if not all([date, hour, action]):
                    return self.json({"error": "Missing required fields"}, status_code=400)

                await coordinator.async_set_schedule(
                    date, hour, action, soc_limit, full_hour, minutes
                )
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error setting schedule: %s", err)
                return self.json({"error": str(err)}, status_code=500)

        async def delete(self, request: web.Request) -> web.Response:
            """Handle DELETE request to clear schedule."""
            try:
                date = request.query.get("date")
                hour = request.query.get("hour")

                if not date:
                    return self.json({"error": "Date is required"}, status_code=400)

                await coordinator.async_clear_schedule(date, hour)
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error clearing schedule: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    class EnergySchedulerApplyModeView(HomeAssistantView):
        """API view for applying mode immediately."""

        url = "/api/energy_scheduler_pstryk/apply_mode"
        name = "api:energy_scheduler_pstryk:apply_mode"
        requires_auth = True

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to apply mode."""
            try:
                data = await request.json()
                mode = data.get("mode")

                if not mode:
                    return self.json({"error": "Mode is required"}, status_code=400)

                await coordinator.async_apply_mode_now(mode)
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error applying mode: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    class EnergySchedulerConfigView(HomeAssistantView):
        """API view for getting configuration."""

        url = "/api/energy_scheduler_pstryk/config"
        name = "api:energy_scheduler_pstryk:config"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request for config."""
            return self.json({
                "price_buy_sensor": coordinator.price_buy_sensor,
                "price_sell_sensor": coordinator.price_sell_sensor,
                "inverter_mode_entity": coordinator.inverter_mode_entity,
                "default_mode": coordinator.default_mode,
                "soc_sensor": coordinator.soc_sensor,
            })

    hass.http.register_view(EnergySchedulerDataView())
    hass.http.register_view(EnergySchedulerScheduleView())
    hass.http.register_view(EnergySchedulerApplyModeView())
    hass.http.register_view(EnergySchedulerConfigView())

    _LOGGER.debug("Registered Energy Scheduler API views")
