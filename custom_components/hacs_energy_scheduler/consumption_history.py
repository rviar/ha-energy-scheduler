"""Consumption history profiling for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

# 7 days x 24 hours profile
DAYS_IN_WEEK = 7
HOURS_IN_DAY = 24


class ConsumptionProfileManager:
    """Manages hourly consumption profiles from HA recorder statistics.

    When an EV charger sensor is provided, EV consumption is subtracted
    from the total to produce a home-only profile for the optimizer.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        consumption_sensor: str | None,
        fallback_avg: float,
        ev_charger_sensor: str | None = None,
    ) -> None:
        """Initialize the consumption profile manager.

        Args:
            hass: Home Assistant instance
            consumption_sensor: Entity ID for consumption sensor (kWh cumulative)
            fallback_avg: Fallback average consumption in kW
            ev_charger_sensor: Entity ID for EV charger sensor (kWh or kW)
        """
        self.hass = hass
        self._sensor = consumption_sensor
        self._fallback_avg = fallback_avg
        self._ev_sensor = ev_charger_sensor
        # Profile: {weekday(0-6): {hour(0-23): avg_kwh}}
        self._profile: dict[int, dict[int, float]] = {}
        self._ev_profile: dict[int, dict[int, float]] = {}
        self._last_update: datetime | None = None

    @property
    def has_profile(self) -> bool:
        """Return True if a consumption profile has been built."""
        return len(self._profile) > 0

    async def async_update_profile(self, days_back: int = 60) -> None:
        """Query HA statistics and build the consumption profile.

        Queries the recorder for the last N days of hourly statistics
        and computes average consumption per (weekday, hour).
        If an EV sensor is configured, its consumption is subtracted.
        """
        if not self._sensor:
            _LOGGER.debug("No consumption sensor configured, using fallback")
            return

        try:
            from homeassistant.components.recorder.statistics import (
                statistics_during_period,
            )
        except ImportError:
            _LOGGER.warning("Recorder component not available for consumption history")
            return

        now = dt_util.now()
        start_time = now - timedelta(days=days_back)

        # Query total consumption sensor
        total_profile = await self._query_cumulative_sensor(
            statistics_during_period, start_time, now, self._sensor,
        )
        if total_profile is None:
            return

        # Query EV charger sensor if configured
        ev_profile: dict[int, dict[int, list[float]]] = {}
        if self._ev_sensor:
            ev_profile = await self._query_ev_sensor(
                statistics_during_period, start_time, now,
            ) or {}

        # Build averaged profiles
        self._profile = self._average_profile(total_profile)

        if ev_profile:
            self._ev_profile = self._average_profile(ev_profile)
            # Subtract EV from total to get home-only
            ev_subtracted = 0
            for weekday, hours in self._ev_profile.items():
                if weekday not in self._profile:
                    continue
                for hour, ev_avg in hours.items():
                    if hour in self._profile[weekday]:
                        original = self._profile[weekday][hour]
                        self._profile[weekday][hour] = max(0.0, original - ev_avg)
                        if ev_avg > 0.01:
                            ev_subtracted += 1

            _LOGGER.info(
                "EV consumption subtracted from profile: %d hour-slots adjusted, "
                "EV sensor: %s",
                ev_subtracted, self._ev_sensor,
            )
        else:
            self._ev_profile = {}

        self._last_update = now

        total_entries = sum(
            len(vals) for hours in total_profile.values()
            for vals in hours.values()
        )
        _LOGGER.info(
            "Consumption profile updated: %d data points over %d days, "
            "%d weekday-hour buckets populated",
            total_entries, days_back, sum(len(h) for h in self._profile.values()),
        )

    async def _query_cumulative_sensor(
        self, statistics_during_period, start_time, end_time, sensor_id: str,
    ) -> dict[int, dict[int, list[float]]] | None:
        """Query a cumulative (total_increasing) sensor and return hourly deltas."""
        try:
            stats = await self.hass.async_add_executor_job(
                statistics_during_period,
                self.hass,
                start_time,
                end_time,
                {sensor_id},
                "hour",
                None,
                {"sum"},
            )
        except Exception as err:
            _LOGGER.error("Error querying statistics for %s: %s", sensor_id, err)
            return None

        sensor_stats = stats.get(sensor_id, [])
        if not sensor_stats:
            _LOGGER.warning(
                "No statistics found for sensor %s", sensor_id,
            )
            return None

        now = dt_util.now()
        hourly: dict[int, dict[int, list[float]]] = {}

        for i in range(1, len(sensor_stats)):
            prev_sum = sensor_stats[i - 1].get("sum")
            curr_sum = sensor_stats[i].get("sum")
            if prev_sum is None or curr_sum is None:
                continue

            delta_kwh = curr_sum - prev_sum
            if delta_kwh < 0:
                continue

            start = sensor_stats[i].get("start")
            if isinstance(start, (int, float)):
                entry_dt = datetime.fromtimestamp(start, tz=now.tzinfo)
            elif isinstance(start, datetime):
                entry_dt = start
            else:
                continue

            weekday = entry_dt.weekday()
            hour = entry_dt.hour
            hourly.setdefault(weekday, {}).setdefault(hour, []).append(delta_kwh)

        return hourly

    async def _query_ev_sensor(
        self, statistics_during_period, start_time, end_time,
    ) -> dict[int, dict[int, list[float]]] | None:
        """Query EV charger sensor. Supports both energy (sum) and power (mean) sensors."""
        now = dt_util.now()

        # Try cumulative energy sensor first (total_increasing)
        try:
            stats = await self.hass.async_add_executor_job(
                statistics_during_period,
                self.hass,
                start_time,
                end_time,
                {self._ev_sensor},
                "hour",
                None,
                {"sum", "mean"},
            )
        except Exception as err:
            _LOGGER.error("Error querying EV statistics for %s: %s", self._ev_sensor, err)
            return None

        sensor_stats = stats.get(self._ev_sensor, [])
        if not sensor_stats:
            _LOGGER.warning("No statistics found for EV sensor %s", self._ev_sensor)
            return None

        # Detect sensor type: check if 'sum' data is available
        has_sum = any(s.get("sum") is not None for s in sensor_stats)
        has_mean = any(s.get("mean") is not None for s in sensor_stats)

        if has_sum:
            # Energy sensor (kWh cumulative) - use deltas
            _LOGGER.debug("EV sensor %s detected as energy sensor (sum)", self._ev_sensor)
            hourly: dict[int, dict[int, list[float]]] = {}
            for i in range(1, len(sensor_stats)):
                prev_sum = sensor_stats[i - 1].get("sum")
                curr_sum = sensor_stats[i].get("sum")
                if prev_sum is None or curr_sum is None:
                    continue
                delta = curr_sum - prev_sum
                if delta < 0:
                    continue

                start = sensor_stats[i].get("start")
                if isinstance(start, (int, float)):
                    entry_dt = datetime.fromtimestamp(start, tz=now.tzinfo)
                elif isinstance(start, datetime):
                    entry_dt = start
                else:
                    continue

                weekday = entry_dt.weekday()
                hour = entry_dt.hour
                hourly.setdefault(weekday, {}).setdefault(hour, []).append(delta)
            return hourly

        if has_mean:
            # Power sensor (kW) - mean ≈ kWh per hour
            _LOGGER.debug("EV sensor %s detected as power sensor (mean)", self._ev_sensor)
            hourly = {}
            for entry in sensor_stats:
                mean_kw = entry.get("mean")
                if mean_kw is None or mean_kw < 0:
                    continue

                start = entry.get("start")
                if isinstance(start, (int, float)):
                    entry_dt = datetime.fromtimestamp(start, tz=now.tzinfo)
                elif isinstance(start, datetime):
                    entry_dt = start
                else:
                    continue

                weekday = entry_dt.weekday()
                hour = entry_dt.hour
                hourly.setdefault(weekday, {}).setdefault(hour, []).append(mean_kw)
            return hourly

        _LOGGER.warning("EV sensor %s has no sum or mean statistics", self._ev_sensor)
        return None

    @staticmethod
    def _average_profile(
        raw: dict[int, dict[int, list[float]]],
    ) -> dict[int, dict[int, float]]:
        """Average raw collected values into a profile."""
        profile: dict[int, dict[int, float]] = {}
        for weekday, hours in raw.items():
            profile[weekday] = {}
            for hour, values in hours.items():
                if values:
                    profile[weekday][hour] = sum(values) / len(values)
        return profile

    def get_consumption_for_hour(self, dt: datetime) -> float:
        """Return expected home consumption (kWh) for the given datetime.

        Falls back to self._fallback_avg if no profile data for this slot.
        """
        if not self._profile:
            return self._fallback_avg

        weekday = dt.weekday()
        hour = dt.hour
        return self._profile.get(weekday, {}).get(hour, self._fallback_avg)

    def get_ev_consumption_for_hour(self, dt: datetime) -> float:
        """Return expected EV consumption (kWh) for the given datetime."""
        if not self._ev_profile:
            return 0.0

        weekday = dt.weekday()
        hour = dt.hour
        return self._ev_profile.get(weekday, {}).get(hour, 0.0)

    def get_consumption_for_range(self, start: datetime, hours: int) -> float:
        """Sum expected consumption (kWh) over a range of hours."""
        total = 0.0
        for i in range(hours):
            check_time = start + timedelta(hours=i)
            total += self.get_consumption_for_hour(check_time)
        return total

    def get_profile_data(self) -> dict[str, Any]:
        """Return the profile data for API/frontend consumption."""
        day_names = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        profile_data: dict[str, dict[str, float]] = {}
        for weekday, hours in self._profile.items():
            day_name = day_names[weekday] if weekday < 7 else str(weekday)
            profile_data[day_name] = {
                str(h): round(v, 3) for h, v in sorted(hours.items())
            }

        ev_profile_data: dict[str, dict[str, float]] = {}
        for weekday, hours in self._ev_profile.items():
            day_name = day_names[weekday] if weekday < 7 else str(weekday)
            ev_profile_data[day_name] = {
                str(h): round(v, 3) for h, v in sorted(hours.items())
            }

        avg_daily = None
        if self._profile:
            day_totals = [
                sum(hours.values()) for hours in self._profile.values() if hours
            ]
            if day_totals:
                avg_daily = round(sum(day_totals) / len(day_totals), 3)

        return {
            "profile": profile_data,
            "ev_profile": ev_profile_data,
            "fallback_avg": self._fallback_avg,
            "has_profile": self.has_profile,
            "has_ev_sensor": bool(self._ev_sensor),
            "avg_daily": avg_daily,
            "updated": self._last_update.isoformat() if self._last_update else None,
        }

    def should_update(self) -> bool:
        """Check if profile needs refresh (once per day)."""
        if self._last_update is None:
            return True
        return (dt_util.now() - self._last_update).total_seconds() > 86400
