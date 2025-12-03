"""Data coordinator for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from homeassistant.helpers import condition

from .const import (
    CONF_AUTO_OPTIMIZE,
    CONF_DEFAULT_MODE,
    CONF_EV_STOP_CONDITION,
    CONF_INVERTER_MODE_ENTITY,
    CONF_OPTIMIZE_INTERVAL,
    CONF_PRICE_BUY_SENSOR,
    CONF_PRICE_SELL_SENSOR,
    CONF_SOC_SENSOR,
    DOMAIN,
    OPTIMIZE_INTERVAL_DAILY,
    OPTIMIZE_INTERVAL_EVERY_6H,
    OPTIMIZE_INTERVAL_HOURLY,
    SCHEDULER_INTERVAL,
)
from .optimizer import EnergyOptimizer, OptimizationResult
from .storage_manager import ScheduleStorageManager

_LOGGER = logging.getLogger(__name__)


class EnergySchedulerCoordinator(DataUpdateCoordinator):
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

        # Initialize optimizer
        self._optimizer = EnergyOptimizer(
            hass,
            config,
            self._get_price_data_for_optimizer,
        )

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
    def default_mode(self) -> str:
        """Return the default mode."""
        return self._config.get(CONF_DEFAULT_MODE, "")

    @property
    def soc_sensor(self) -> str | None:
        """Return the SOC sensor entity ID."""
        return self._config.get(CONF_SOC_SENSOR)

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
        """Return if auto-optimization is enabled."""
        return self._config.get(CONF_AUTO_OPTIMIZE, False)

    @property
    def optimize_interval(self) -> str:
        """Return the optimization interval."""
        return self._config.get(CONF_OPTIMIZE_INTERVAL, "manual")

    def _is_ev_stop_condition_configured(self) -> bool:
        """Check if EV stop condition is properly configured."""
        cond = self.ev_stop_condition
        return cond is not None and len(cond) > 0

    async def async_setup(self) -> None:
        """Set up the coordinator."""
        await self._storage.async_load()
        await self._storage.async_cleanup_old_dates()

        # Start the scheduler
        self._unsub_interval = async_track_time_interval(
            self.hass,
            self._async_check_schedule,
            timedelta(seconds=SCHEDULER_INTERVAL),
        )

        # Start auto-optimization if enabled
        await self._async_setup_auto_optimization()

    async def async_shutdown(self) -> None:
        """Shut down the coordinator."""
        if self._unsub_interval:
            self._unsub_interval()
        if self._unsub_optimize_interval:
            self._unsub_optimize_interval()

    async def _async_setup_auto_optimization(self) -> None:
        """Set up automatic optimization based on interval setting."""
        if self._unsub_optimize_interval:
            self._unsub_optimize_interval()
            self._unsub_optimize_interval = None

        if not self.auto_optimize:
            _LOGGER.debug("Auto-optimization disabled")
            return

        interval = self.optimize_interval
        if interval == OPTIMIZE_INTERVAL_HOURLY:
            delta = timedelta(hours=1)
        elif interval == OPTIMIZE_INTERVAL_EVERY_6H:
            delta = timedelta(hours=6)
        elif interval == OPTIMIZE_INTERVAL_DAILY:
            delta = timedelta(hours=24)
        else:
            _LOGGER.debug("Manual optimization mode, no auto-schedule")
            return

        self._unsub_optimize_interval = async_track_time_interval(
            self.hass,
            self._async_run_scheduled_optimization,
            delta,
        )
        _LOGGER.info("Auto-optimization enabled with interval: %s", interval)

    async def _async_run_scheduled_optimization(self, now: datetime) -> None:
        """Run scheduled optimization."""
        _LOGGER.info("Running scheduled optimization at %s", now)
        await self.async_run_optimization(hours_ahead=24)

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

        inverter_modes = self._get_inverter_modes()
        schedule = self._storage.get_schedule()

        _LOGGER.debug("_async_fetch_data: schedule=%s, storage_id=%s", schedule, id(self._storage))

        return {
            "buy_prices": buy_data,
            "sell_prices": sell_data,
            "inverter_modes": inverter_modes,
            "default_mode": self.default_mode,
            "schedule": schedule,
            "current_action": self._current_action,
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

    async def _async_check_schedule(self, now: datetime) -> None:
        """Check and apply scheduled actions."""
        local_now = dt_util.as_local(now)
        current_date = local_now.strftime("%Y-%m-%d")
        current_hour = str(local_now.hour)
        current_minute = local_now.minute
        date_key = current_date  # Used for locked_soc_types key

        # Clean up stale SOC direction locks (from previous hours/days)
        if hasattr(self, "_locked_soc_types"):
            current_key = f"{current_date}_{current_hour}"
            stale_keys = [k for k in self._locked_soc_types if k != current_key]
            for k in stale_keys:
                del self._locked_soc_types[k]

        # Sync current action with actual inverter state (handles external changes)
        actual_mode = self._get_current_inverter_mode()
        if actual_mode and self._current_action != actual_mode:
            _LOGGER.debug(
                "Inverter mode changed externally: %s -> %s",
                self._current_action, actual_mode
            )
            self._current_action = actual_mode

        # Get the schedule for this hour
        hour_schedule = self._storage.get_hour_schedule(current_date, current_hour)

        if hour_schedule:
            action = hour_schedule.get("action")
            soc_limit = hour_schedule.get("soc_limit")
            full_hour = hour_schedule.get("full_hour", False)
            minutes = hour_schedule.get("minutes")
            ev_charging = hour_schedule.get("ev_charging", False)

            if not action:
                return

            should_apply = True
            should_revert = False

            # Check EV stop condition if specified
            if ev_charging and self._is_ev_stop_condition_configured():
                stop_condition_met, reason = await self._async_check_ev_stop_condition()
                if stop_condition_met:
                    should_apply = False
                    should_revert = self._current_action == action
                    if should_revert:
                        _LOGGER.info(
                            "EV stop condition met (%s), reverting to default mode",
                            reason
                        )

            # Check SOC limit if specified (only if not EV charging mode)
            if soc_limit is not None and self.soc_sensor and not ev_charging:
                current_soc = self._get_current_soc()
                soc_limit_type = hour_schedule.get("soc_limit_type")

                if current_soc is not None:
                    # Auto-detect direction if not specified or set to "auto"
                    # Direction is locked on first detection to prevent ping-pong
                    if soc_limit_type is None or soc_limit_type == "auto":
                        # Check if we already locked direction for this schedule entry
                        schedule_key = f"{date_key}_{current_hour}"
                        locked_type = getattr(self, "_locked_soc_types", {}).get(schedule_key)

                        if locked_type:
                            # Use previously locked direction
                            soc_limit_type = locked_type
                        else:
                            # First time - detect and lock direction
                            # Use hysteresis: 2% buffer to avoid oscillation
                            hysteresis = 2
                            if current_soc < soc_limit - hysteresis:
                                soc_limit_type = "max"  # Need to charge up to target
                            elif current_soc > soc_limit + hysteresis:
                                soc_limit_type = "min"  # Need to discharge down to target
                            else:
                                # Within hysteresis band - already close to target
                                should_apply = False
                                should_revert = self._current_action == action
                                if should_revert:
                                    _LOGGER.info(
                                        "SOC already at target (%s%% ≈ %s%%), reverting to default mode",
                                        current_soc, soc_limit
                                    )
                                soc_limit_type = "max"  # Fallback, won't be used

                            # Lock the detected direction for this hour
                            if not hasattr(self, "_locked_soc_types"):
                                self._locked_soc_types = {}
                            self._locked_soc_types[schedule_key] = soc_limit_type
                            _LOGGER.debug(
                                "Auto-detected SOC direction for %s: %s (current=%s%%, target=%s%%)",
                                schedule_key, soc_limit_type, current_soc, soc_limit
                            )

                    # "max" = charging mode: stop when SOC >= limit
                    # "min" = discharging mode: stop when SOC <= limit
                    limit_reached = False
                    if soc_limit_type == "min" and current_soc <= soc_limit:
                        limit_reached = True
                    elif soc_limit_type == "max" and current_soc >= soc_limit:
                        limit_reached = True

                    if limit_reached:
                        should_apply = False
                        should_revert = self._current_action == action
                        direction = "discharge" if soc_limit_type == "min" else "charge"
                        comparison = "<=" if soc_limit_type == "min" else ">="
                        if should_revert:
                            _LOGGER.info(
                                "SOC %s limit reached (%s%% %s %s%%), reverting to default mode",
                                direction, current_soc, comparison, soc_limit
                            )
                        else:
                            # Target already reached before action started - skip
                            _LOGGER.debug(
                                "SOC %s target already reached (%s%% %s %s%%), skipping action",
                                direction, current_soc, comparison, soc_limit
                            )
                        # Clear lock when target reached
                        schedule_key = f"{date_key}_{current_hour}"
                        if hasattr(self, "_locked_soc_types"):
                            self._locked_soc_types.pop(schedule_key, None)

            # Check minutes limit (> instead of >= to include the target minute)
            if minutes is not None and not full_hour:
                if current_minute > minutes:
                    should_apply = False
                    should_revert = self._current_action == action
                    if should_revert:
                        _LOGGER.info(
                            "Minutes limit exceeded (%s > %s), reverting to default mode",
                            current_minute, minutes
                        )

            if should_apply:
                if self._current_action != action:
                    await self._async_apply_mode(action)
            elif should_revert and self._current_action != self.default_mode:
                await self._async_apply_default_mode()

        else:
            # No schedule for this hour - revert to default if we're not already there
            if self._current_action and self._current_action != self.default_mode:
                await self._async_apply_default_mode()

    def _get_current_inverter_mode(self) -> str | None:
        """Get current inverter mode from entity."""
        state = self.hass.states.get(self.inverter_mode_entity)
        if state is None:
            return None
        return state.state

    def _get_current_soc(self) -> int | None:
        """Get current SOC value from sensor."""
        if not self.soc_sensor:
            return None

        state = self.hass.states.get(self.soc_sensor)
        if state is None:
            return None

        try:
            return int(float(state.state))
        except (ValueError, TypeError):
            return None

    async def _async_check_ev_stop_condition(self) -> tuple[bool, str]:
        """Check if EV stop condition is met using HA condition evaluation.

        Returns:
            Tuple of (condition_met, reason_string)
        """
        if not self._is_ev_stop_condition_configured():
            return False, ""

        conditions = self.ev_stop_condition
        if not conditions:
            return False, ""

        try:
            # ConditionSelector returns a list of conditions
            # We need to check if ALL conditions are met (implicit AND)
            for cond_config in conditions:
                cond_func = await condition.async_from_config(self.hass, cond_config)
                if cond_func(self.hass):
                    # Condition is met - build reason string
                    cond_type = cond_config.get("condition", "unknown")
                    entity_id = cond_config.get("entity_id", "")
                    if isinstance(entity_id, list):
                        entity_id = entity_id[0] if entity_id else ""
                    reason = f"{cond_type} condition met"
                    if entity_id:
                        state = self.hass.states.get(entity_id)
                        if state:
                            reason = f"{cond_type}: {entity_id} = {state.state}"
                    return True, reason

            return False, ""

        except Exception as err:
            _LOGGER.error("Error evaluating EV stop condition: %s", err)
            return False, ""

    async def _async_apply_mode(self, mode: str) -> None:
        """Apply the specified inverter mode."""
        try:
            await self.hass.services.async_call(
                "input_select",
                "select_option",
                {
                    "entity_id": self.inverter_mode_entity,
                    "option": mode,
                },
            )
            self._current_action = mode
            self._action_start_time = dt_util.utcnow()
            _LOGGER.info("Applied inverter mode: %s", mode)
        except Exception as err:
            _LOGGER.error("Failed to apply mode %s: %s", mode, err)

    async def _async_apply_default_mode(self) -> None:
        """Apply the default mode."""
        if self.default_mode:
            await self._async_apply_mode(self.default_mode)
            _LOGGER.info("Reverted to default mode: %s", self.default_mode)

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
        manual: bool = False,
    ) -> None:
        """Set a schedule entry."""
        await self._storage.async_set_hour_schedule(
            date, hour, action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging, manual
        )
        await self.async_request_refresh()

    async def async_clear_schedule(self, date: str, hour: str | None = None) -> None:
        """Clear schedule entries."""
        if hour:
            await self._storage.async_clear_hour_schedule(date, hour)
        else:
            await self._storage.async_clear_date_schedule(date)
        await self.async_request_refresh()

    async def async_apply_mode_now(self, mode: str) -> None:
        """Manually apply a mode immediately."""
        await self._async_apply_mode(mode)

    async def async_run_optimization(
        self, hours_ahead: int = 24, apply_schedule: bool = True
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

        if result.emergency_charge:
            _LOGGER.warning("Emergency charge: %s", result.emergency_reason)

        if result.ev_urgent_charge:
            _LOGGER.warning("EV urgent charge: %s", result.ev_urgent_reason)

        # Apply schedule if requested
        if apply_schedule:
            await self._async_apply_optimization_result(result)

        await self.async_request_refresh()

        return result

    async def _async_apply_optimization_result(
        self, result: OptimizationResult
    ) -> None:
        """Apply optimization result to the schedule.

        Uses ACTION_CHARGE for charge hours to enable dynamic mode selection.
        """
        # Clear future schedule first, but preserve manual entries
        now = dt_util.now()
        current_date = now.strftime("%Y-%m-%d")
        tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")

        # Get manual hours before clearing (to skip them during optimization)
        manual_hours_today = self._storage.get_manual_hours(current_date)
        manual_hours_tomorrow = self._storage.get_manual_hours(tomorrow)

        _LOGGER.debug("Manual hours to preserve - today: %s, tomorrow: %s",
                     manual_hours_today, manual_hours_tomorrow)

        # Clear both today and tomorrow schedules, preserving manual entries
        await self._storage.async_clear_date_schedule(current_date, preserve_manual=True)
        await self._storage.async_clear_date_schedule(tomorrow, preserve_manual=True)

        # Apply charge hours with actual charge mode
        # Select the appropriate charge mode based on current state
        charge_mode = self._optimizer.select_charge_mode()

        for hour_data in result.charge_hours:
            date = hour_data.get("date")
            hour = str(hour_data.get("hour"))

            # Skip if this hour has a manual entry
            manual_hours = manual_hours_today if date == current_date else manual_hours_tomorrow
            if hour in manual_hours:
                _LOGGER.debug("Skipping charge hour %s %s:00 - manual entry exists", date, hour)
                continue

            # Determine if this is EV charging
            ev_charging = self._optimizer.ev_enabled and self._optimizer._is_ev_connected()

            await self._storage.async_set_hour_schedule(
                date=date,
                hour=hour,
                action=charge_mode,  # Use actual mode instead of placeholder
                soc_limit=100 if not ev_charging else None,
                soc_limit_type="max",
                full_hour=True,
                minutes=None,
                ev_charging=ev_charging,
                manual=False,  # Auto-generated
            )

        # Apply discharge hours with sell mode
        sell_mode = self._optimizer.mode_sell
        if sell_mode:
            for hour_data in result.discharge_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))

                # Skip if this hour has a manual entry
                manual_hours = manual_hours_today if date == current_date else manual_hours_tomorrow
                if hour in manual_hours:
                    _LOGGER.debug("Skipping discharge hour %s %s:00 - manual entry exists", date, hour)
                    continue

                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=sell_mode,
                    soc_limit=self._optimizer.battery_min_soc,
                    soc_limit_type="min",
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,  # Auto-generated
                )

        # Apply solar-only hours
        solar_mode = self._optimizer.mode_sell_solar_only
        if solar_mode:
            for hour_data in result.solar_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))

                # Skip if this hour has a manual entry
                manual_hours = manual_hours_today if date == current_date else manual_hours_tomorrow
                if hour in manual_hours:
                    _LOGGER.debug("Skipping solar hour %s %s:00 - manual entry exists", date, hour)
                    continue

                # Skip if already scheduled as charge or discharge
                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue

                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=solar_mode,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,  # Auto-generated
                )

        _LOGGER.info(
            "Applied optimization schedule: %d charge, %d discharge, %d solar hours",
            len(result.charge_hours),
            len(result.discharge_hours),
            len(result.solar_hours),
        )
