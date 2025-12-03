"""HACS Energy Scheduler integration for Home Assistant."""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from aiohttp import web

from homeassistant.components import frontend
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    ATTR_ACTION,
    ATTR_DATE,
    ATTR_EV_CHARGING,
    ATTR_FULL_HOUR,
    ATTR_HOUR,
    ATTR_MINUTES,
    ATTR_SOC_LIMIT,
    ATTR_SOC_LIMIT_TYPE,
    DOMAIN,
    SERVICE_APPLY_MODE,
    SERVICE_CLEAR_SCHEDULE,
    SERVICE_RUN_OPTIMIZATION,
    SERVICE_SET_SCHEDULE,
)
from .coordinator import EnergySchedulerCoordinator
from .storage_manager import ScheduleStorageManager

_LOGGER = logging.getLogger(__name__)

# URL path for serving static files
STATIC_URL_PATH = f"/api/{DOMAIN}/static"

PLATFORMS: list[Platform] = []

SET_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.string,
        vol.Required(ATTR_HOUR): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
        vol.Required(ATTR_ACTION): cv.string,
        vol.Optional(ATTR_SOC_LIMIT): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional(ATTR_SOC_LIMIT_TYPE, default="max"): vol.In(["max", "min"]),
        vol.Optional(ATTR_FULL_HOUR, default=False): cv.boolean,
        vol.Optional(ATTR_MINUTES): vol.All(vol.Coerce(int), vol.Range(min=1, max=60)),
        vol.Optional(ATTR_EV_CHARGING, default=False): cv.boolean,
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

RUN_OPTIMIZATION_SCHEMA = vol.Schema(
    {
        vol.Optional("hours_ahead", default=24): vol.All(
            vol.Coerce(int), vol.Range(min=12, max=48)
        ),
    }
)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the HACS Energy Scheduler component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HACS Energy Scheduler from a config entry."""
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

    # Register Lovelace card
    await _async_register_card(hass)

    # Register services
    await _async_register_services(hass, coordinator)

    # Register API views
    await _async_register_api(hass, coordinator)

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Listen for options updates
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    _LOGGER.info("HACS Energy Scheduler integration set up successfully")
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


    return unload_ok


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


def _get_file_hash(file_path: Path) -> str:
    """Calculate MD5 hash of a file for cache busting."""
    if not file_path.exists():
        return "unknown"
    md5 = hashlib.md5()
    md5.update(file_path.read_bytes())
    return md5.hexdigest()[:8]  # First 8 chars is enough


async def _async_register_card(hass: HomeAssistant) -> None:
    """Register the Lovelace card."""
    # Path to www folder inside custom_components
    www_path = Path(__file__).parent / "www"
    card_file = www_path / "energy-scheduler-card.js"

    _LOGGER.debug("Card static path: %s, exists: %s", www_path, www_path.exists())

    # Use file hash in filename for aggressive cache busting
    # This defeats even the most aggressive Service Worker caching
    file_hash = _get_file_hash(card_file)

    # Register static file view to serve card JS
    hass.http.register_view(CardStaticView(www_path, file_hash))

    # Hash in filename ensures unique URL on every file change
    card_url = f"{STATIC_URL_PATH}/energy-scheduler-card-{file_hash}.js"
    frontend.add_extra_js_url(hass, card_url)

    _LOGGER.debug("Registered Energy Scheduler card with hash: %s", file_hash)


class CardStaticView(HomeAssistantView):
    """View to serve static card files."""

    url = f"{STATIC_URL_PATH}/{{filename}}"
    name = f"api:{DOMAIN}:static"
    requires_auth = False  # Card JS must load without auth

    def __init__(self, www_path: Path, file_hash: str) -> None:
        """Initialize the static view."""
        self._www_path = www_path
        self._file_hash = file_hash

    async def get(self, request: web.Request, filename: str) -> web.Response:
        """Handle GET request for static files."""
        _LOGGER.debug("Card JS requested: %s", filename)

        # Accept hashed filename (energy-scheduler-card-{hash}.js)
        # and map it to actual file (energy-scheduler-card.js)
        actual_filename = filename
        if filename == f"energy-scheduler-card-{self._file_hash}.js":
            actual_filename = "energy-scheduler-card.js"

        # Security: only allow specific files
        allowed_files = {"energy-scheduler-card.js"}
        if actual_filename not in allowed_files:
            _LOGGER.warning("Blocked request for non-allowed file: %s", filename)
            return web.Response(status=404)

        file_path = self._www_path / actual_filename
        if not file_path.exists():
            _LOGGER.error("Static file not found: %s", file_path)
            return web.Response(status=404)

        try:
            # Use executor to avoid blocking the event loop
            def read_file():
                return file_path.read_text(encoding="utf-8")

            hass = request.app["hass"]
            content = await hass.async_add_executor_job(read_file)
            _LOGGER.debug("Card JS served successfully, size: %d bytes", len(content))
            return web.Response(
                text=content,
                content_type="application/javascript",
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                },
            )
        except Exception as err:
            _LOGGER.error("Error reading static file %s: %s", filename, err)
            return web.Response(status=500)


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
        soc_limit_type = call.data.get(ATTR_SOC_LIMIT_TYPE, "max")
        full_hour = call.data.get(ATTR_FULL_HOUR, False)
        minutes = call.data.get(ATTR_MINUTES)
        ev_charging = call.data.get(ATTR_EV_CHARGING, False)

        await coordinator.async_set_schedule(
            date, hour, action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging
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

    async def handle_run_optimization(call: ServiceCall) -> None:
        """Handle the run_optimization service call."""
        hours_ahead = call.data.get("hours_ahead", 24)
        result = await coordinator.async_run_optimization(hours_ahead=hours_ahead)
        _LOGGER.info(
            "Optimization completed: %d charge, %d discharge, %d solar hours",
            len(result.charge_hours),
            len(result.discharge_hours),
            len(result.solar_hours),
        )

    hass.services.async_register(
        DOMAIN, SERVICE_SET_SCHEDULE, handle_set_schedule, schema=SET_SCHEDULE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_SCHEDULE, handle_clear_schedule, schema=CLEAR_SCHEDULE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_APPLY_MODE, handle_apply_mode, schema=APPLY_MODE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_RUN_OPTIMIZATION, handle_run_optimization, schema=RUN_OPTIMIZATION_SCHEMA
    )

    _LOGGER.debug("Registered Energy Scheduler services")


async def _async_register_api(
    hass: HomeAssistant, coordinator: EnergySchedulerCoordinator
) -> None:
    """Register API endpoints for the panel."""

    class EnergySchedulerDataView(HomeAssistantView):
        """API view for getting scheduler data."""

        url = "/api/hacs_energy_scheduler/data"
        name = "api:hacs_energy_scheduler:data"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request."""
            data = await coordinator._async_fetch_data()
            return self.json(data)

    class EnergySchedulerScheduleView(HomeAssistantView):
        """API view for managing schedules."""

        url = "/api/hacs_energy_scheduler/schedule"
        name = "api:hacs_energy_scheduler:schedule"
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
                soc_limit_type = data.get("soc_limit_type", "max")
                full_hour = data.get("full_hour", False)
                minutes = data.get("minutes")
                ev_charging = data.get("ev_charging", False)
                # Manual flag - default True for API calls (user changes)
                # Can be explicitly set to False for programmatic changes
                manual = data.get("manual", True)

                if not all([date, hour, action]):
                    return self.json({"error": "Missing required fields"}, status_code=400)

                await coordinator.async_set_schedule(
                    date, hour, action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging, manual
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

        url = "/api/hacs_energy_scheduler/apply_mode"
        name = "api:hacs_energy_scheduler:apply_mode"
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

        url = "/api/hacs_energy_scheduler/config"
        name = "api:hacs_energy_scheduler:config"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request for config."""
            return self.json({
                "price_buy_sensor": coordinator.price_buy_sensor,
                "price_sell_sensor": coordinator.price_sell_sensor,
                "inverter_mode_entity": coordinator.inverter_mode_entity,
                "default_mode": coordinator.default_mode,
                "soc_sensor": coordinator.soc_sensor,
                "ev_stop_condition": coordinator.ev_stop_condition,
            })

    class EnergySchedulerManualFlagView(HomeAssistantView):
        """API view for managing manual flag on schedule entries."""

        url = "/api/hacs_energy_scheduler/manual"
        name = "api:hacs_energy_scheduler:manual"
        requires_auth = True

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to set/clear manual flag."""
            try:
                data = await request.json()
                date = data.get("date")
                hour = str(data.get("hour"))
                manual = data.get("manual", False)

                if not all([date, hour]):
                    return self.json({"error": "Missing required fields"}, status_code=400)

                await coordinator.storage.async_set_manual_flag(date, hour, manual)
                await coordinator.async_request_refresh()
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error setting manual flag: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    hass.http.register_view(EnergySchedulerDataView())
    hass.http.register_view(EnergySchedulerScheduleView())
    hass.http.register_view(EnergySchedulerApplyModeView())
    hass.http.register_view(EnergySchedulerConfigView())
    hass.http.register_view(EnergySchedulerManualFlagView())

    _LOGGER.debug("Registered Energy Scheduler API views")
