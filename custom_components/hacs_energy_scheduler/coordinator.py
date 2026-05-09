"""Data coordinator for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    CONF_AVG_CONSUMPTION,
    CONF_BATTERY_SOC_SENSOR,
    CONF_BREAKER_POWER_LIMIT,
    CONF_CONSUMPTION_SENSOR,
    CONF_DEFAULT_MODE,
    CONF_EV_CHARGER_CONSUMPTION_SENSOR,
    CONF_EV_CONNECTED_SENSOR,
    CONF_EV_ENABLED,
    CONF_EV_SOC_SENSOR,
    CONF_EV_STOP_CONDITION,
    CONF_INVERTER_EXPORT_SURPLUS_SWITCH,
    CONF_INVERTER_PV_INPUT_SWITCH,
    CONF_INVERTER_MODE_ENTITY,
    CONF_LOAD_POWER_SENSOR,
    CONF_OPTIMIZE_INTERVAL,
    CONF_PRICE_BUY_SENSOR,
    CONF_PRICE_SELL_SENSOR,
    CONF_PV_DYNAMIC_CORRECTION_ENABLED,
    CONF_PV_FORECAST_SENSOR,
    CONF_PV_FORECAST_TOMORROW_SENSOR,
    CONF_PV_PRODUCTION_SENSOR,
    DEFAULT_PV_DYNAMIC_CORRECTION_ENABLED,
    DEFAULT_AVG_CONSUMPTION,
    DEFAULT_BREAKER_POWER_LIMIT,
    DOMAIN,
    EVENT_SCHEDULE_UPDATED,
    OPTIMIZE_INTERVAL_AUTO,
    OPTIMIZE_INTERVAL_MANUAL,
    SCHEDULER_INTERVAL,
)
from .consumption_history import ConsumptionProfileManager
from .ev_charge_controller import EVChargeController
from .optimizer import EnergyOptimizer, OptimizationResult
from .pv_dynamic import compute_today_factor
from .schedule_executor import ScheduleExecutorMixin
from .storage_manager import ScheduleStorageManager

_LOGGER = logging.getLogger(__name__)


class EnergySchedulerCoordinator(ScheduleExecutorMixin, DataUpdateCoordinator):
    """Coordinator for Energy Scheduler data."""

    def __init__(
        self,
        hass: HomeAssistant,
        config: dict[str, Any],
        storage: ScheduleStorageManager,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=1),
        )
        self._config = config
        self._storage = storage
        self._current_action: str | None = None
        self._action_start_time: datetime | None = None
        self._unsub_interval: Any = None
        self._unsub_optimize_interval: Any = None
        self._last_optimization: datetime | None = None
        self._last_optimization_result: OptimizationResult | None = None

        # Reactive trigger listeners
        self._unsub_ev_listener: Any = None
        self._unsub_price_listener: Any = None
        self._unsub_pv_listener: Any = None
        self._unsub_battery_soc_listener: Any = None
        self._unsub_ev_soc_listener: Any = None
        self._unsub_reactive_fallback: Any = None
        self._last_pv_forecast_sum: float | None = None
        self._last_battery_soc: float | None = None
        self._last_ev_soc: float | None = None
        self._reactive_debounce_time: datetime | None = None
        self._startup_optimization_done: bool = False
        self._paused: bool = False

        # Breaker protection state
        self._ev_paused_by_breaker: bool = False
        self._last_throttle_amps: int | None = None
        self._unsub_load_listener: Any = None

        # Dynamic PV confidence state — refreshed before each optimization
        self._pv_dynamic_data: dict[str, Any] = {
            "factor": 1.0,
            "active": False,
            "reason": "not_computed",
            "actual_today_kwh": None,
            "baseline_elapsed_kwh": None,
            "baseline_today_kwh": None,
            "solcast_confidence": None,
        }

        # Initialize consumption profile
        self._consumption_profile = ConsumptionProfileManager(
            hass,
            config.get(CONF_CONSUMPTION_SENSOR),
            config.get(CONF_AVG_CONSUMPTION, DEFAULT_AVG_CONSUMPTION),
            ev_charger_sensor=config.get(CONF_EV_CHARGER_CONSUMPTION_SENSOR),
        )

        # Initialize optimizer with consumption profile and dynamic-PV snapshot reader
        self._optimizer = EnergyOptimizer(
            hass,
            config,
            self._get_price_data_for_optimizer,
            self._consumption_profile,
            pv_dynamic_callback=lambda: self._pv_dynamic_data,
        )

        # Initialize EV charge controller (if EV enabled)
        if config.get(CONF_EV_ENABLED, False):
            self._ev_charge_controller = EVChargeController(hass, config)
        else:
            self._ev_charge_controller = None

    @property
    def storage(self) -> ScheduleStorageManager:
        """Return the storage manager."""
        return self._storage

    @property
    def config(self) -> dict[str, Any]:
        """Return the configuration."""
        return self._config

    @property
    def price_buy_sensor(self) -> str:
        """Return the buy price sensor entity ID."""
        return self._config.get(CONF_PRICE_BUY_SENSOR, "sensor.energy_price_buy")

    @property
    def price_sell_sensor(self) -> str:
        """Return the sell price sensor entity ID."""
        return self._config.get(CONF_PRICE_SELL_SENSOR, "sensor.energy_price_sell")

    @property
    def inverter_mode_entity(self) -> str:
        """Return the inverter mode entity ID."""
        return self._config.get(CONF_INVERTER_MODE_ENTITY, "input_select.inverter_mode")

    @property
    def inverter_export_surplus_switch(self) -> str | None:
        """Return optional switch/input_boolean that toggles inverter grid export."""
        return self._config.get(CONF_INVERTER_EXPORT_SURPLUS_SWITCH)

    @property
    def inverter_pv_input_switch(self) -> str | None:
        """Return optional switch/input_boolean that disables PV input.

        When toggled OFF, the inverter ignores PV (curtails to 0). Used to
        force pure grid sourcing during negative-price hours so we get paid
        for grid imports instead of silently consuming free PV.
        """
        return self._config.get(CONF_INVERTER_PV_INPUT_SWITCH)

    def get_sell_price_at(self, date: str, hour: int | str) -> float | None:
        """Return sell price for the given slot, or None if missing."""
        try:
            hour_int = int(hour)
        except (TypeError, ValueError):
            return None
        try:
            data = self._get_price_data_for_optimizer()
        except Exception:  # noqa: BLE001
            return None
        for entry in data.get("sell_prices", []):
            if entry.get("date") == date and entry.get("hour") == hour_int:
                value = entry.get("value")
                return float(value) if value is not None else None
        return None

    @property
    def default_mode(self) -> str:
        """Return the default mode."""
        return self._config.get(CONF_DEFAULT_MODE, "")

    @property
    def soc_sensor(self) -> str | None:
        """Return the SOC sensor entity ID."""
        return self._config.get(CONF_BATTERY_SOC_SENSOR)

    @property
    def ev_stop_condition(self) -> list[dict] | None:
        """Return the EV stop condition configuration."""
        return self._config.get(CONF_EV_STOP_CONDITION)

    @property
    def optimizer(self) -> EnergyOptimizer:
        """Return the optimizer instance."""
        return self._optimizer

    @property
    def last_optimization_result(self) -> OptimizationResult | None:
        """Return the last optimization result."""
        return self._last_optimization_result

    @property
    def auto_optimize(self) -> bool:
        """Return if automatic optimization is enabled by interval mode."""
        return self.optimize_interval != OPTIMIZE_INTERVAL_MANUAL

    @property
    def optimize_interval(self) -> str:
        """Return the optimization interval (AUTO or MANUAL)."""
        raw = self._config.get(CONF_OPTIMIZE_INTERVAL, OPTIMIZE_INTERVAL_AUTO)
        if raw not in (OPTIMIZE_INTERVAL_AUTO, OPTIMIZE_INTERVAL_MANUAL):
            return OPTIMIZE_INTERVAL_AUTO
        return raw

    @property
    def paused(self) -> bool:
        """Return if scheduler is paused."""
        return self._paused

    @property
    def breaker_power_limit(self) -> float:
        """Return breaker power limit in kW (0 = disabled)."""
        return self._config.get(CONF_BREAKER_POWER_LIMIT, DEFAULT_BREAKER_POWER_LIMIT)

    @property
    def load_power_sensor(self) -> str | None:
        """Return the load power sensor entity ID."""
        return self._config.get(CONF_LOAD_POWER_SENSOR)

    @property
    def pv_production_sensor(self) -> str | None:
        """Return the PV production (today-energy) sensor entity ID."""
        return self._config.get(CONF_PV_PRODUCTION_SENSOR)

    @property
    def pv_dynamic_correction_enabled(self) -> bool:
        """Return whether dynamic intra-day PV correction is enabled."""
        return self._config.get(
            CONF_PV_DYNAMIC_CORRECTION_ENABLED,
            DEFAULT_PV_DYNAMIC_CORRECTION_ENABLED,
        )

    @property
    def pv_dynamic_data(self) -> dict[str, Any]:
        """Return the current dynamic PV correction snapshot."""
        return dict(self._pv_dynamic_data)

    async def async_refresh_pv_dynamic(self) -> None:
        """Recompute today's dynamic PV correction factor.

        Runs in the coordinator (async context, recorder access). Result is
        cached on self._pv_dynamic_data and read by the optimizer via a sync
        property. Safe to call multiple times — last call wins.
        """
        if not self.pv_dynamic_correction_enabled or not self.pv_production_sensor:
            self._pv_dynamic_data = {
                "factor": 1.0,
                "active": False,
                "reason": "disabled" if not self.pv_dynamic_correction_enabled else "no_sensor",
                "actual_today_kwh": None,
                "baseline_elapsed_kwh": None,
                "baseline_today_kwh": None,
                "solcast_confidence": None,
            }
            return
        self._pv_dynamic_data = await compute_today_factor(
            self.hass,
            self._optimizer._pv_parser,
            self.pv_production_sensor,
            self.inverter_pv_input_switch,
        )
        _LOGGER.debug(
            "PV dynamic factor: %.2f (active=%s, reason=%s, actual=%s, baseline=%s)",
            self._pv_dynamic_data.get("factor", 1.0),
            self._pv_dynamic_data.get("active"),
            self._pv_dynamic_data.get("reason"),
            self._pv_dynamic_data.get("actual_today_kwh"),
            self._pv_dynamic_data.get("baseline_elapsed_kwh"),
        )

    async def async_set_paused(self, paused: bool) -> None:
        """Set the paused state."""
        self._paused = paused
        await self._storage.async_set_paused(paused)
        if paused:
            if self._ev_charge_controller:
                await self._ev_charge_controller.async_stop_charge()
                self._ev_paused_by_breaker = False
                self._last_throttle_amps = None
            if self._current_action and self._current_action != self._get_idle_mode():
                await self._async_apply_idle_mode()
        _LOGGER.info("Scheduler %s", "paused" if paused else "resumed")
        await self.async_request_refresh()

    async def async_set_optimize_interval(self, interval: str) -> None:
        """Change optimization interval at runtime. Accepts AUTO or MANUAL."""
        if interval not in (OPTIMIZE_INTERVAL_AUTO, OPTIMIZE_INTERVAL_MANUAL):
            interval = OPTIMIZE_INTERVAL_AUTO
        self._config[CONF_OPTIMIZE_INTERVAL] = interval
        await self._storage.async_set_optimize_interval(interval)

        # Tear down all auto-related subscriptions, then re-setup based on
        # the new mode. Single source of truth for what runs in each mode.
        if self._unsub_optimize_interval:
            self._unsub_optimize_interval()
            self._unsub_optimize_interval = None
        self._cancel_reactive_listeners()
        await self._async_setup_auto_optimization()
        _LOGGER.info("Optimization interval changed to: %s", interval)

    def _cancel_reactive_listeners(self) -> None:
        """Cancel all reactive trigger listeners."""
        for attr in ("_unsub_ev_listener", "_unsub_price_listener",
                     "_unsub_pv_listener", "_unsub_battery_soc_listener",
                     "_unsub_ev_soc_listener", "_unsub_reactive_fallback"):
            unsub = getattr(self, attr, None)
            if unsub:
                unsub()
                setattr(self, attr, None)

    def _get_last_optimization_data(self) -> dict[str, Any] | None:
        """Get last optimization result as dict for API response."""
        if not self._last_optimization_result:
            return None
        result = self._last_optimization_result
        return {
            "timestamp": self._last_optimization.isoformat() if self._last_optimization else None,
            "charge_hours": len(result.charge_hours),
            "discharge_hours": len(result.discharge_hours),
            "solar_hours": len(result.solar_hours),
            "self_consume_first_hours": len(result.self_consume_first_hours),
            "self_consume_only_hours": len(result.self_consume_only_hours),
            "estimated_profit": result.estimated_profit,
            "net_plan_profit": result.net_plan_profit,
            "gross_discharge_margin": result.gross_discharge_margin,
            "cycle_cost": result.cycle_cost,
            "warnings": result.warnings,
        }

    async def async_setup(self) -> None:
        """Set up the coordinator."""
        await self._storage.async_load()
        await self._storage.async_cleanup_old_dates()
        self._paused = self._storage.get_paused()
        stored_interval = self._storage.get_optimize_interval()
        if stored_interval:
            self._config[CONF_OPTIMIZE_INTERVAL] = stored_interval
        else:
            await self._storage.async_set_optimize_interval(self.optimize_interval)

        # Load consumption profile from HA statistics
        await self._consumption_profile.async_update_profile()

        # Initial dynamic PV factor refresh so attributes/API are populated
        # before the first scheduled optimization runs.
        await self.async_refresh_pv_dynamic()

        # Start the scheduler
        self._unsub_interval = async_track_time_interval(
            self.hass,
            self._async_check_schedule,
            timedelta(seconds=SCHEDULER_INTERVAL),
        )

        # Start auto-optimization if enabled
        await self._async_setup_auto_optimization()

        # Run initial optimization once HA is fully started (sensors ready)
        if self.optimize_interval == OPTIMIZE_INTERVAL_MANUAL:
            self._startup_optimization_done = True
        else:
            async def _run_initial_optimization(_now=None, attempt: int = 1) -> None:
                max_attempts = 5
                buy_state = self.hass.states.get(self.price_buy_sensor)
                buy_count = len(buy_state.attributes.get("data", [])) if buy_state else 0
                pv_sum = self._optimizer._pv_parser.get_forecast_sum(24)
                soc_sensor = self._config.get(CONF_BATTERY_SOC_SENSOR)
                soc_value = self._get_numeric_state(soc_sensor) if soc_sensor else None
                pv_configured = bool(self._config.get(CONF_PV_FORECAST_SENSOR))
                is_daytime = 5 <= dt_util.now().hour <= 20

                missing = []
                if buy_count == 0:
                    missing.append("prices")
                if pv_configured and is_daytime and pv_sum <= 0:
                    missing.append("PV forecast")
                if soc_sensor and soc_value is None:
                    missing.append(f"battery SOC ({soc_sensor})")

                if missing and attempt < max_attempts:
                    _LOGGER.info(
                        "Sensor data not ready yet (%s) (attempt %d/%d), retrying in 30s",
                        ", ".join(missing), attempt, max_attempts,
                    )
                    next_attempt = attempt + 1
                    async_call_later(
                        self.hass, 30, _make_retry_callback(next_attempt),
                    )
                    return
                if missing:
                    _LOGGER.warning("Sensor data still incomplete after %d attempts (%s), running anyway", max_attempts, ", ".join(missing))

                _LOGGER.info(
                    "Running initial optimization on startup (attempt %d): "
                    "prices=%d, PV=%.1fkWh, SOC=%s%%",
                    attempt, buy_count, pv_sum,
                    f"{soc_value:.0f}" if soc_value is not None else "N/A",
                )
                try:
                    await self.async_run_optimization()
                except Exception as err:
                    _LOGGER.warning("Initial optimization failed: %s", err)
                finally:
                    self._startup_optimization_done = True
                    _LOGGER.info("Startup optimization complete, reactive triggers enabled")

            def _make_retry_callback(next_attempt: int):
                """Capture next_attempt by value to avoid late-binding in closure."""
                async def _retry(_now) -> None:
                    await _run_initial_optimization(_now, next_attempt)
                return _retry

            if self.hass.is_running:
                async_call_later(self.hass, 15, _run_initial_optimization)
            else:
                async def _on_ha_started(event: Event) -> None:
                    async_call_later(self.hass, 15, _run_initial_optimization)

                self.hass.bus.async_listen_once(
                    EVENT_HOMEASSISTANT_STARTED, _on_ha_started
                )

        # Reactive listeners + 1h fallback timer are set up by
        # _async_setup_auto_optimization() above when mode is AUTO.

        # Set up breaker protection listener (event-driven)
        await self._async_setup_breaker_listener()

    async def _async_setup_breaker_listener(self) -> None:
        """Set up state change listener on load sensor for fast breaker protection."""
        if self._unsub_load_listener:
            self._unsub_load_listener()
            self._unsub_load_listener = None

        sensor = self.load_power_sensor
        if not sensor or self.breaker_power_limit <= 0:
            return

        async def _on_load_change(event: Event) -> None:
            """React to load sensor changes immediately."""
            await self._async_check_breaker_protection()

        self._unsub_load_listener = async_track_state_change_event(
            self.hass, [sensor], _on_load_change
        )
        _LOGGER.info(
            "Breaker protection: listening to %s (limit %.1f kW)",
            sensor, self.breaker_power_limit,
        )

    async def async_shutdown(self) -> None:
        """Shut down the coordinator."""
        for unsub in [
            self._unsub_interval, self._unsub_optimize_interval,
            self._unsub_ev_listener, self._unsub_price_listener,
            self._unsub_pv_listener, self._unsub_battery_soc_listener,
            self._unsub_ev_soc_listener, self._unsub_reactive_fallback,
            self._unsub_load_listener,
        ]:
            if unsub:
                try:
                    unsub()
                except ValueError:
                    pass

    async def _async_setup_auto_optimization(self) -> None:
        """Set up automatic optimization for the current mode.

        AUTO mode: reactive event listeners (price/PV/SOC/EV) + 1h fallback
        timer. Reactive listeners catch meaningful state changes within
        seconds; the fallback guarantees the schedule is never staler than
        an hour even if no event fires.

        MANUAL mode: nothing scheduled. Caller triggers via the
        run_optimization service.
        """
        if self._unsub_optimize_interval:
            self._unsub_optimize_interval()
            self._unsub_optimize_interval = None

        if not self.auto_optimize:
            _LOGGER.debug("Manual optimization mode, no auto-schedule")
            return

        await self._async_setup_reactive_triggers()
        self._unsub_optimize_interval = async_track_time_interval(
            self.hass,
            self._async_run_scheduled_optimization,
            timedelta(hours=1),
        )
        _LOGGER.info(
            "Auto-optimization enabled (reactive triggers + 1h fallback)"
        )

    async def _async_setup_reactive_triggers(self) -> None:
        """Set up event-driven optimization triggers (R4)."""
        # EV connect/disconnect
        ev_sensor = self._config.get(CONF_EV_CONNECTED_SENSOR)
        if ev_sensor:
            self._unsub_ev_listener = async_track_state_change_event(
                self.hass, [ev_sensor], self._async_handle_ev_state_change,
            )

        # Price updates
        self._unsub_price_listener = async_track_state_change_event(
            self.hass,
            [self.price_buy_sensor, self.price_sell_sensor],
            self._async_handle_price_change,
        )

        # PV forecast changes
        pv_sensors = [
            sensor_id for sensor_id in (
                self._config.get(CONF_PV_FORECAST_SENSOR),
                self._config.get(CONF_PV_FORECAST_TOMORROW_SENSOR),
            )
            if sensor_id
        ]
        if pv_sensors:
            self._unsub_pv_listener = async_track_state_change_event(
                self.hass, pv_sensors, self._async_handle_pv_change,
            )

        battery_soc_sensor = self._config.get(CONF_BATTERY_SOC_SENSOR)
        if battery_soc_sensor:
            self._unsub_battery_soc_listener = async_track_state_change_event(
                self.hass, [battery_soc_sensor], self._async_handle_battery_soc_change,
            )
            self._last_battery_soc = self._get_numeric_state(battery_soc_sensor)

        ev_soc_sensor = self._config.get(CONF_EV_SOC_SENSOR)
        if self._config.get(CONF_EV_ENABLED, False) and ev_soc_sensor:
            self._unsub_ev_soc_listener = async_track_state_change_event(
                self.hass, [ev_soc_sensor], self._async_handle_ev_soc_change,
            )
            self._last_ev_soc = self._get_numeric_state(ev_soc_sensor)

        self._last_pv_forecast_sum = self._optimizer._pv_parser.get_forecast_sum(36)
        _LOGGER.info(
            "Reactive optimization triggers configured: prices, pv=%d, ev=%s, battery_soc=%s, ev_soc=%s",
            len(pv_sensors),
            bool(ev_sensor),
            bool(battery_soc_sensor),
            bool(ev_soc_sensor and self._config.get(CONF_EV_ENABLED, False)),
        )

    async def _async_handle_ev_state_change(self, event: Event) -> None:
        """Handle EV connect/disconnect state change."""
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state and new_state and old_state.state != new_state.state:
            _LOGGER.info("EV state changed: %s -> %s, triggering re-optimization",
                         old_state.state, new_state.state)
            await self._async_debounced_optimize()

    async def _async_handle_price_change(self, event: Event) -> None:
        """Handle price data update."""
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        if old_state and new_state:
            old_data = old_state.attributes.get("data", [])
            new_data = new_state.attributes.get("data", [])
            if old_data != new_data:
                _LOGGER.info("Price data updated, triggering re-optimization")
                await self._async_debounced_optimize()

    async def _async_handle_pv_change(self, event: Event) -> None:
        """Handle PV forecast change (>10% threshold)."""
        new_state = event.data.get("new_state")
        if not new_state:
            return
        current_sum = self._optimizer._pv_parser.get_forecast_sum(36)
        if self._last_pv_forecast_sum is not None:
            change_pct = abs(current_sum - self._last_pv_forecast_sum) / max(self._last_pv_forecast_sum, 0.1)
            if change_pct > 0.1:
                _LOGGER.info("PV forecast changed %.0f%%, triggering re-optimization", change_pct * 100)
                self._last_pv_forecast_sum = current_sum
                await self._async_debounced_optimize()
        else:
            self._last_pv_forecast_sum = current_sum

    async def _async_handle_battery_soc_change(self, event: Event) -> None:
        """Handle battery SOC changes that materially affect discharge planning."""
        new_state = event.data.get("new_state")
        if not new_state:
            return
        current_soc = self._safe_parse_float(new_state.state)
        if current_soc is None:
            return
        if self._last_battery_soc is None:
            self._last_battery_soc = current_soc
            return
        if abs(current_soc - self._last_battery_soc) >= 5.0:
            _LOGGER.info(
                "Battery SOC changed %.1f%% -> %.1f%%, triggering re-optimization",
                self._last_battery_soc,
                current_soc,
            )
            self._last_battery_soc = current_soc
            await self._async_debounced_optimize()

    async def _async_handle_ev_soc_change(self, event: Event) -> None:
        """Handle EV SOC changes that materially affect charging demand."""
        new_state = event.data.get("new_state")
        if not new_state:
            return
        current_soc = self._safe_parse_float(new_state.state)
        if current_soc is None:
            return
        if self._last_ev_soc is None:
            self._last_ev_soc = current_soc
            return
        if abs(current_soc - self._last_ev_soc) >= 5.0:
            _LOGGER.info(
                "EV SOC changed %.1f%% -> %.1f%%, triggering re-optimization",
                self._last_ev_soc,
                current_soc,
            )
            self._last_ev_soc = current_soc
            await self._async_debounced_optimize()

    async def _async_debounced_optimize(self, cooldown_seconds: int = 60) -> None:
        """Run optimization with debounce protection."""
        if not self._startup_optimization_done:
            _LOGGER.debug("Reactive trigger ignored — startup optimization not yet complete")
            return
        now = dt_util.utcnow()
        if self._reactive_debounce_time and (now - self._reactive_debounce_time).total_seconds() < cooldown_seconds:
            _LOGGER.debug("Optimization debounced (within %ds cooldown)", cooldown_seconds)
            return
        self._reactive_debounce_time = now
        await self.async_run_optimization(hours_ahead=36)

    async def _async_run_scheduled_optimization(self, now: datetime) -> None:
        """Run scheduled optimization."""
        # Refresh consumption profile if stale
        if self._consumption_profile.should_update():
            await self._consumption_profile.async_update_profile()
        _LOGGER.info("Running scheduled optimization at %s", now)
        await self.async_run_optimization(hours_ahead=36)

    def _get_price_data_for_optimizer(self) -> dict[str, Any]:
        """Get price data for the optimizer."""
        buy_data = self._get_sensor_price_data(self.price_buy_sensor)
        sell_data = self._get_sensor_price_data(self.price_sell_sensor)
        return {
            "buy_prices": buy_data,
            "sell_prices": sell_data,
        }

    async def _async_fetch_data(self) -> dict[str, Any]:
        """Fetch price data from sensors."""
        buy_data = self._get_sensor_price_data(self.price_buy_sensor)
        sell_data = self._get_sensor_price_data(self.price_sell_sensor)
        pv_forecast = self._optimizer._pv_parser.get_hourly_forecast(48)

        inverter_modes = self._get_inverter_modes()
        schedule = self._storage.get_schedule()
        schedule_dates = len(schedule)
        schedule_hours = sum(len(hours) for hours in schedule.values())
        _LOGGER.debug(
            "_async_fetch_data: schedule loaded (%d dates, %d hours)",
            schedule_dates,
            schedule_hours,
        )

        return {
            "buy_prices": buy_data,
            "sell_prices": sell_data,
            "pv_forecast": pv_forecast,
            "inverter_modes": inverter_modes,
            "default_mode": self.default_mode,
            "schedule": schedule,
            "current_action": self._current_action,
            "paused": self._paused,
            "last_optimization": self._get_last_optimization_data(),
            "pv_dynamic": self._pv_dynamic_data,
        }

    def _get_sensor_price_data(self, entity_id: str) -> list[dict[str, Any]]:
        """Get price data from a sensor's data attribute."""
        state = self.hass.states.get(entity_id)
        if state is None:
            _LOGGER.warning("Sensor %s not found", entity_id)
            return []

        data = state.attributes.get("data", [])
        if not data:
            _LOGGER.debug("No data attribute found for sensor %s", entity_id)
            return []

        # Convert UTC times to local timezone
        local_tz = dt_util.get_default_time_zone()
        converted_data = []

        for entry in data:
            try:
                start_utc = datetime.fromisoformat(entry["start"].replace("Z", "+00:00"))
                end_utc = datetime.fromisoformat(entry["end"].replace("Z", "+00:00"))

                start_local = start_utc.astimezone(local_tz)
                end_local = end_utc.astimezone(local_tz)

                converted_data.append({
                    "start": start_local.isoformat(),
                    "end": end_local.isoformat(),
                    "value": entry["value"],
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                })
            except (KeyError, ValueError) as err:
                _LOGGER.warning("Error parsing price data entry: %s", err)
                continue

        return converted_data

    def _get_numeric_state(self, entity_id: str | None) -> float | None:
        """Return a parsed numeric state value for the given entity."""
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None:
            return None
        return self._safe_parse_float(state.state)

    def _safe_parse_float(self, value: Any) -> float | None:
        """Parse float values from HA states, ignoring unavailable values."""
        if value in (None, "", "unknown", "unavailable"):
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _get_inverter_modes(self) -> list[str]:
        """Get available inverter modes from input_select."""
        state = self.hass.states.get(self.inverter_mode_entity)
        if state is None:
            _LOGGER.warning("Inverter mode entity %s not found", self.inverter_mode_entity)
            return []

        options = state.attributes.get("options", [])
        return options

    async def _async_update_data(self) -> dict[str, Any]:
        """Update data via coordinator."""
        return await self._async_fetch_data()

    async def async_set_schedule(
        self,
        date: str,
        hour: str,
        action: str,
        soc_limit: int | None = None,
        soc_limit_type: str | None = None,
        full_hour: bool = False,
        minutes: int | None = None,
        ev_charging: bool = False,
        ev_charge_reason: str | None = None,
        manual: bool = False,
    ) -> None:
        """Set a schedule entry."""
        await self._storage.async_set_hour_schedule(
            date, hour, action, soc_limit, soc_limit_type, full_hour, minutes,
            ev_charging, ev_charge_reason, manual,
        )
        await self.async_request_refresh()
        self.hass.bus.async_fire(EVENT_SCHEDULE_UPDATED)

    async def async_clear_schedule(self, date: str, hour: str | None = None) -> None:
        """Clear schedule entries."""
        if hour:
            await self._storage.async_clear_hour_schedule(date, hour)
        else:
            await self._storage.async_clear_date_schedule(date)
        await self.async_request_refresh()
        self.hass.bus.async_fire(EVENT_SCHEDULE_UPDATED)

    async def async_apply_mode_now(self, mode: str) -> None:
        """Manually apply a mode immediately."""
        await self._async_apply_mode(mode)

    async def async_run_optimization(
        self, hours_ahead: int = 36, apply_schedule: bool = True
    ) -> OptimizationResult:
        """Run the energy optimization algorithm.

        Args:
            hours_ahead: Planning horizon in hours (12-48)
            apply_schedule: Whether to apply the optimization result to schedule

        Returns:
            OptimizationResult with schedule recommendations
        """
        hours_ahead = max(12, min(48, hours_ahead))

        _LOGGER.info("Running optimization for %d hours ahead", hours_ahead)

        # Refresh dynamic PV factor (async, recorder access) before optimizing.
        await self.async_refresh_pv_dynamic()

        # Run optimization in executor to avoid blocking
        result = await self.hass.async_add_executor_job(
            self._optimizer.optimize, hours_ahead
        )

        self._last_optimization = dt_util.now()
        self._last_optimization_result = result

        _LOGGER.info(
            "Optimization result: %d charge hours, %d discharge hours, %d solar hours",
            len(result.charge_hours),
            len(result.discharge_hours),
            len(result.solar_hours),
        )

        if result.warnings:
            for warning in result.warnings:
                _LOGGER.warning("Optimization warning: %s", warning)

        if result.ev_urgent_charge:
            _LOGGER.warning("EV urgent charge: %s", result.ev_urgent_reason)

        # Apply schedule if requested
        if apply_schedule:
            await self._async_apply_optimization_result(result)
            await self.async_request_refresh()
            self.hass.bus.async_fire(EVENT_SCHEDULE_UPDATED)

        return result
