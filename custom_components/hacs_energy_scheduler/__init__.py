"""HACS Energy Scheduler integration for Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from aiohttp import web

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.loader import async_get_integration

from .const import (
    ATTR_ACTION,
    ATTR_DATE,
    ATTR_EV_CHARGING,
    ATTR_FULL_HOUR,
    ATTR_HOUR,
    ATTR_MINUTES,
    ATTR_SOC_LIMIT,
    ATTR_SOC_LIMIT_TYPE,
    CONF_CONSUMPTION_SENSOR,
    CONF_CURRENCY,
    CONF_EV_CONNECTED_SENSOR,
    CONF_EV_ENABLED,
    CONF_EV_MAX_CHARGE_AMPS,
    CONF_EV_MIN_CHARGE_AMPS,
    CONF_EV_SOC_SENSOR,
    CONF_EV_VOLTAGE,
    CONF_MIN_SELL_PRICE,
    CONF_MODE_CHARGE_BATTERY,
    CONF_MODE_CHARGE_EV,
    CONF_MODE_CHARGE_EV_AND_BATTERY,
    CONF_MODE_GRID_ONLY,
    CONF_OPTIMIZE_INTERVAL,
    CONF_MODE_SELF_CONSUME,
    CONF_MODE_SELL,
    CONF_MODE_SELL_SOLAR_ONLY,
    DEFAULT_CURRENCY,
    DEFAULT_EV_MIN_CHARGE_AMPS,
    DEFAULT_MIN_SELL_PRICE,
    DOMAIN,
    OPTIMIZE_INTERVAL_EVERY_6H,
    OPTIMIZE_INTERVAL_MANUAL,
    SERVICE_APPLY_MODE,
    SERVICE_CLEAR_SCHEDULE,
    SERVICE_EV_CHARGE_NOW,
    SERVICE_EV_CHARGE_STOP,
    SERVICE_RUN_OPTIMIZATION,
    SERVICE_SET_SCHEDULE,
)
from .coordinator import EnergySchedulerCoordinator
from .storage_manager import ScheduleStorageManager

_LOGGER = logging.getLogger(__name__)

# URL path for serving static files
STATIC_URL_PATH = f"/api/{DOMAIN}/static"

PLATFORMS: list[Platform] = [Platform.BINARY_SENSOR, Platform.SENSOR]

SET_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.string,
        vol.Required(ATTR_HOUR): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
        vol.Required(ATTR_ACTION): cv.string,
        vol.Optional(ATTR_SOC_LIMIT): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional(ATTR_SOC_LIMIT_TYPE): vol.In(["auto", "max", "min"]),
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
        vol.Optional("hours_ahead", default=36): vol.All(
            vol.Coerce(int), vol.Range(min=12, max=48)
        ),
    }
)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the HACS Energy Scheduler component."""
    hass.data.setdefault(DOMAIN, {})
    _async_register_ws_version(hass)
    return True


def _normalize_runtime_config(config: dict[str, Any]) -> dict[str, Any]:
    """Normalize runtime optimization settings into interval-only mode."""
    normalized = dict(config)
    interval = normalized.get(CONF_OPTIMIZE_INTERVAL, OPTIMIZE_INTERVAL_MANUAL)
    if interval == "every_6h":
        interval = OPTIMIZE_INTERVAL_EVERY_6H

    normalized[CONF_OPTIMIZE_INTERVAL] = interval
    return normalized


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HACS Energy Scheduler from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Initialize storage manager
    storage = ScheduleStorageManager(hass)

    # Get config from entry
    config = _normalize_runtime_config({**entry.data, **entry.options})

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


async def _async_register_card(hass: HomeAssistant) -> None:
    """Register the Lovelace card with a cache-busting version query string.

    Prefers Lovelace's resources collection (storage mode) so the URL is
    queried fresh over WebSocket on each dashboard load and never gets
    embedded in cached HTML. Falls back to ``frontend.add_extra_js_url`` when
    Lovelace is in YAML mode and we cannot programmatically manage resources.
    """
    www_path = Path(__file__).parent / "www"

    _LOGGER.debug("Card static path: %s, exists: %s", www_path, www_path.exists())

    hass.http.register_view(CardStaticView(www_path))

    integration = await async_get_integration(hass, DOMAIN)
    version = integration.version or "0"
    card_url = f"{STATIC_URL_PATH}/energy-scheduler-card.js?v={version}"

    registered_as_resource = await _async_register_lovelace_resource(hass, card_url)
    if not registered_as_resource:
        frontend.add_extra_js_url(hass, card_url)
        _LOGGER.debug(
            "Registered Energy Scheduler card via extra_js_url fallback: %s",
            card_url,
        )
    else:
        _LOGGER.debug("Registered Energy Scheduler card via Lovelace resource: %s", card_url)


async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> bool:
    """Create or update the Lovelace resource entry for the card.

    Returns True when the resource was successfully created/updated via the
    storage-backed collection, False when Lovelace is in YAML mode or the
    collection is not available (fallback path will be used instead).
    """
    lovelace_data = hass.data.get("lovelace")
    if lovelace_data is None:
        _LOGGER.debug("Lovelace data not available — falling back to extra_js_url")
        return False

    resources = getattr(lovelace_data, "resources", None)
    if resources is None:
        _LOGGER.debug("Lovelace resources collection not available — fallback")
        return False

    # Storage-backed collections expose async_create_item / async_update_item.
    if not hasattr(resources, "async_create_item") or not hasattr(
        resources, "async_update_item"
    ):
        _LOGGER.debug("Lovelace is in YAML mode — fallback to extra_js_url")
        return False

    try:
        if hasattr(resources, "async_load"):
            await resources.async_load()
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("resources.async_load failed (%s) — fallback", err)
        return False

    existing = None
    try:
        for item in resources.async_items():
            if "energy-scheduler-card.js" in item.get("url", ""):
                existing = item
                break
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("resources.async_items failed (%s) — fallback", err)
        return False

    try:
        if existing is not None:
            if existing.get("url") != url:
                await resources.async_update_item(
                    existing["id"], {"res_type": "module", "url": url}
                )
                _LOGGER.info(
                    "Updated Lovelace resource for Energy Scheduler card: %s", url
                )
        else:
            await resources.async_create_item({"res_type": "module", "url": url})
            _LOGGER.info(
                "Created Lovelace resource for Energy Scheduler card: %s", url
            )
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "Failed to register Lovelace resource (%s) — falling back to extra_js_url",
            err,
        )
        return False

    return True


@callback
def _async_register_ws_version(hass: HomeAssistant) -> None:
    """Register a WebSocket command that reports the current integration version.

    The card calls this on connect and compares with its bundled CARD_VERSION.
    On mismatch the card shows a reload notification to the user so that stale
    cached bundles can be refreshed on any platform (including mobile apps).
    """

    @callback
    def _ws_version(hass_: HomeAssistant, connection, msg) -> None:
        async def _send() -> None:
            integration = await async_get_integration(hass_, DOMAIN)
            connection.send_result(msg["id"], {"version": integration.version or "0"})

        hass_.async_create_task(_send())

    websocket_api.async_register_command(
        hass,
        f"{DOMAIN}/version",
        _ws_version,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): f"{DOMAIN}/version"}
        ),
    )


class CardStaticView(HomeAssistantView):
    """View to serve static card files."""

    url = f"{STATIC_URL_PATH}/{{filename}}"
    name = f"api:{DOMAIN}:static"
    requires_auth = False  # Card JS must load without auth

    def __init__(self, www_path: Path) -> None:
        """Initialize the static view."""
        self._www_path = www_path

    async def get(self, request: web.Request, filename: str) -> web.Response:
        """Handle GET request for static files."""
        _LOGGER.debug("Card JS requested: %s", filename)

        # Security: only allow specific files
        allowed_files = {"energy-scheduler-card.js"}
        if filename not in allowed_files:
            _LOGGER.warning("Blocked request for non-allowed file: %s", filename)
            return web.Response(status=404)

        file_path = self._www_path / filename
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
        soc_limit_type = call.data.get(ATTR_SOC_LIMIT_TYPE)  # None = auto-detect
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
        hours_ahead = call.data.get("hours_ahead", 36)
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

    # EV charge manual services
    async def handle_ev_charge_now(call: ServiceCall) -> None:
        """Handle ev_charge_now service call."""
        if coordinator._ev_charge_controller:
            await coordinator._ev_charge_controller.async_manual_start()

    async def handle_ev_charge_stop(call: ServiceCall) -> None:
        """Handle ev_charge_stop service call."""
        if coordinator._ev_charge_controller:
            await coordinator._ev_charge_controller.async_manual_stop()

    hass.services.async_register(DOMAIN, SERVICE_EV_CHARGE_NOW, handle_ev_charge_now)
    hass.services.async_register(DOMAIN, SERVICE_EV_CHARGE_STOP, handle_ev_charge_stop)

    _LOGGER.debug("Registered Energy Scheduler services")


def _get_coordinator(hass: HomeAssistant) -> EnergySchedulerCoordinator:
    """Get the current coordinator instance dynamically."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if isinstance(entry_data, dict) and "coordinator" in entry_data:
            return entry_data["coordinator"]
    raise ValueError("Energy Scheduler coordinator not found")


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
            coord = _get_coordinator(hass)
            data = await coord._async_fetch_data()
            return self.json(data)

    class EnergySchedulerScheduleView(HomeAssistantView):
        """API view for managing schedules."""

        url = "/api/hacs_energy_scheduler/schedule"
        name = "api:hacs_energy_scheduler:schedule"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request for schedule."""
            coord = _get_coordinator(hass)
            date = request.query.get("date")
            schedule = coord.storage.get_schedule(date)
            return self.json(schedule)

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to set schedule."""
            try:
                coord = _get_coordinator(hass)
                data = await request.json()
                date = data.get("date")
                hour_raw = data.get("hour")
                action = data.get("action")
                soc_limit = data.get("soc_limit")
                soc_limit_type = data.get("soc_limit_type")  # None = auto-detect
                full_hour = data.get("full_hour", False)
                minutes = data.get("minutes")
                ev_charging = data.get("ev_charging", False)
                # Manual flag - default True for API calls (user changes)
                # Can be explicitly set to False for programmatic changes
                manual = data.get("manual", True)

                if date is None or hour_raw is None or action is None:
                    return self.json({"error": "Missing required fields"}, status_code=400)

                hour = str(hour_raw)

                await coord.async_set_schedule(
                    date, hour, action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging, manual
                )
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error setting schedule: %s", err)
                return self.json({"error": str(err)}, status_code=500)

        async def delete(self, request: web.Request) -> web.Response:
            """Handle DELETE request to clear schedule."""
            try:
                coord = _get_coordinator(hass)
                date = request.query.get("date")
                hour = request.query.get("hour")

                if not date:
                    return self.json({"error": "Date is required"}, status_code=400)

                await coord.async_clear_schedule(date, hour)
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
                coord = _get_coordinator(hass)
                data = await request.json()
                mode = data.get("mode")

                if not mode:
                    return self.json({"error": "Mode is required"}, status_code=400)

                await coord.async_apply_mode_now(mode)
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
            coord = _get_coordinator(hass)
            return self.json({
                "price_buy_sensor": coord.price_buy_sensor,
                "price_sell_sensor": coord.price_sell_sensor,
                "inverter_mode_entity": coord.inverter_mode_entity,
                "inverter_export_surplus_switch": coord.inverter_export_surplus_switch,
                "inverter_pv_input_switch": coord.inverter_pv_input_switch,
                "default_mode": coord.default_mode,
                "currency": coord.config.get(CONF_CURRENCY, DEFAULT_CURRENCY),
                "soc_sensor": coord.soc_sensor,
                "ev_stop_condition": coord.ev_stop_condition,
                "mode_self_consume": coord.config.get(CONF_MODE_SELF_CONSUME),
                "mode_charge_battery": coord.config.get(CONF_MODE_CHARGE_BATTERY),
                "mode_charge_ev": coord.config.get(CONF_MODE_CHARGE_EV),
                "mode_charge_ev_and_battery": coord.config.get(CONF_MODE_CHARGE_EV_AND_BATTERY),
                "mode_sell": coord.config.get(CONF_MODE_SELL),
                "mode_sell_solar_only": coord.config.get(CONF_MODE_SELL_SOLAR_ONLY),
                "mode_grid_only": coord.config.get(CONF_MODE_GRID_ONLY),
                "min_sell_price": coord.config.get(CONF_MIN_SELL_PRICE, DEFAULT_MIN_SELL_PRICE),
                "consumption_sensor": coord.config.get(CONF_CONSUMPTION_SENSOR),
                "optimize_interval": coord.optimize_interval,
                # Temporary alias for cached card bundles expecting the legacy key.
                "auto_optimize_interval": coord.optimize_interval,
                "ev_enabled": coord.config.get(CONF_EV_ENABLED, False),
                "ev_connected_sensor": coord.config.get(CONF_EV_CONNECTED_SENSOR),
                "ev_soc_sensor": coord.config.get(CONF_EV_SOC_SENSOR),
                "ev_max_charge_amps": coord.config.get(CONF_EV_MAX_CHARGE_AMPS, 16),
                "ev_min_charge_amps": coord.config.get(CONF_EV_MIN_CHARGE_AMPS, DEFAULT_EV_MIN_CHARGE_AMPS),
                "breaker_power_limit": coord.breaker_power_limit,
                "load_power_sensor": coord.load_power_sensor,
                "ev_voltage": coord.config.get(CONF_EV_VOLTAGE, 230),
            })

    class EnergySchedulerManualFlagView(HomeAssistantView):
        """API view for managing manual flag on schedule entries."""

        url = "/api/hacs_energy_scheduler/manual"
        name = "api:hacs_energy_scheduler:manual"
        requires_auth = True

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to set/clear manual flag."""
            try:
                coord = _get_coordinator(hass)
                data = await request.json()
                date = data.get("date")
                hour = str(data.get("hour"))
                manual = data.get("manual", False)

                if not all([date, hour]):
                    return self.json({"error": "Missing required fields"}, status_code=400)

                await coord.storage.async_set_manual_flag(date, hour, manual)
                await coord.async_request_refresh()
                return self.json({"success": True})
            except Exception as err:
                _LOGGER.error("Error setting manual flag: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    class EnergySchedulerConsumptionProfileView(HomeAssistantView):
        """API view for consumption profile data."""

        url = "/api/hacs_energy_scheduler/consumption_profile"
        name = "api:hacs_energy_scheduler:consumption_profile"
        requires_auth = True

        async def get(self, request: web.Request) -> web.Response:
            """Handle GET request for consumption profile."""
            coord = _get_coordinator(hass)
            profile = coord._consumption_profile
            if profile and profile.has_profile:
                return self.json(profile.get_profile_data())
            return self.json({
                "has_profile": False,
                "fallback_avg": coord.config.get("avg_consumption", 0.6),
            })

    class EnergySchedulerPauseView(HomeAssistantView):
        """API view for pausing/resuming the scheduler."""

        url = "/api/hacs_energy_scheduler/pause"
        name = "api:hacs_energy_scheduler:pause"
        requires_auth = True

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to pause/resume."""
            try:
                coord = _get_coordinator(hass)
                data = await request.json()
                paused = data.get("paused", False)
                await coord.async_set_paused(paused)
                return self.json({"success": True, "paused": paused})
            except Exception as err:
                _LOGGER.error("Error setting pause state: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    class EnergySchedulerOptimizeIntervalView(HomeAssistantView):
        """API view for changing optimization interval at runtime."""

        url = "/api/hacs_energy_scheduler/optimize_interval"
        name = "api:hacs_energy_scheduler:optimize_interval"
        requires_auth = True

        async def post(self, request: web.Request) -> web.Response:
            """Handle POST request to change interval."""
            try:
                coord = _get_coordinator(hass)
                data = await request.json()
                interval = data.get("interval")
                valid_intervals = ["manual", "hourly", "6h", "daily", "reactive"]
                if interval not in valid_intervals:
                    return self.json(
                        {"error": f"Invalid interval. Must be one of: {valid_intervals}"},
                        status_code=400,
                    )
                await coord.async_set_optimize_interval(interval)
                return self.json({"success": True, "interval": interval})
            except Exception as err:
                _LOGGER.error("Error setting optimize interval: %s", err)
                return self.json({"error": str(err)}, status_code=500)

    hass.http.register_view(EnergySchedulerDataView())
    hass.http.register_view(EnergySchedulerScheduleView())
    hass.http.register_view(EnergySchedulerApplyModeView())
    hass.http.register_view(EnergySchedulerConfigView())
    hass.http.register_view(EnergySchedulerManualFlagView())
    hass.http.register_view(EnergySchedulerConsumptionProfileView())
    hass.http.register_view(EnergySchedulerPauseView())
    hass.http.register_view(EnergySchedulerOptimizeIntervalView())

    _LOGGER.debug("Registered Energy Scheduler API views")
