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
    CONF_DEFAULT_MODE,
    CONF_EV_STOP_CONDITION,
    CONF_INVERTER_MODE_ENTITY,
    CONF_PRICE_BUY_SENSOR,
    CONF_PRICE_SELL_SENSOR,
    CONF_SOC_SENSOR,
    DOMAIN,
    SCHEDULER_INTERVAL,
)
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

    async def async_shutdown(self) -> None:
        """Shut down the coordinator."""
        if self._unsub_interval:
            self._unsub_interval()

    async def _async_fetch_data(self) -> dict[str, Any]:
        """Fetch price data from sensors."""
        buy_data = self._get_sensor_price_data(self.price_buy_sensor)
        sell_data = self._get_sensor_price_data(self.price_sell_sensor)

        inverter_modes = self._get_inverter_modes()

        return {
            "buy_prices": buy_data,
            "sell_prices": sell_data,
            "inverter_modes": inverter_modes,
            "default_mode": self.default_mode,
            "schedule": self._storage.get_schedule(),
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
                soc_limit_type = hour_schedule.get("soc_limit_type", "max")

                if current_soc is not None:
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
                        if should_revert:
                            direction = "discharge" if soc_limit_type == "min" else "charge"
                            comparison = "<=" if soc_limit_type == "min" else ">="
                            _LOGGER.info(
                                "SOC %s limit reached (%s%% %s %s%%), reverting to default mode",
                                direction, current_soc, comparison, soc_limit
                            )

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

            if should_apply and self._current_action != action:
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
    ) -> None:
        """Set a schedule entry."""
        await self._storage.async_set_hour_schedule(
            date, hour, action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging
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
