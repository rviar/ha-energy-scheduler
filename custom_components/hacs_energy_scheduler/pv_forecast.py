"""PV Forecast parser for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)


class PVForecastParser:
    """Parser for PV forecast data from Solcast or Forecast.Solar sensors."""

    def __init__(self, hass: HomeAssistant, sensor_entity_id: str | None) -> None:
        """Initialize the PV forecast parser."""
        self.hass = hass
        self.sensor_entity_id = sensor_entity_id

    def get_hourly_forecast(self, hours_ahead: int = 48) -> list[dict[str, Any]]:
        """Get hourly PV forecast for the specified number of hours.

        Returns:
            List of dicts with keys: hour (int), date (str), kwh (float)
        """
        if not self.sensor_entity_id:
            _LOGGER.debug("No PV forecast sensor configured, returning zeros")
            return self._generate_zero_forecast(hours_ahead)

        state = self.hass.states.get(self.sensor_entity_id)
        if state is None:
            _LOGGER.warning("PV forecast sensor %s not found", self.sensor_entity_id)
            return self._generate_zero_forecast(hours_ahead)

        # Try different attribute formats
        forecast_data = self._parse_forecast_attributes(state.attributes)

        if not forecast_data:
            # Fallback: use state value as daily total and distribute evenly
            try:
                daily_total = float(state.state)
                forecast_data = self._distribute_daily_forecast(daily_total, hours_ahead)
            except (ValueError, TypeError):
                _LOGGER.warning(
                    "Could not parse PV forecast from sensor %s",
                    self.sensor_entity_id
                )
                return self._generate_zero_forecast(hours_ahead)

        return forecast_data

    def _parse_forecast_attributes(
        self, attributes: dict[str, Any]
    ) -> list[dict[str, Any]] | None:
        """Parse forecast from sensor attributes.

        Supports multiple formats:
        - Solcast: 'forecasts' attribute with period_start and pv_estimate
        - Forecast.Solar: 'forecast' attribute with hourly data
        - Generic: 'data' or 'hourly' attributes
        """
        local_tz = dt_util.get_default_time_zone()
        now = dt_util.now()

        # Try Solcast format
        if "forecasts" in attributes:
            return self._parse_solcast_format(attributes["forecasts"], local_tz, now)

        # Try Forecast.Solar format (watt hours per period)
        if "forecast" in attributes:
            return self._parse_forecast_solar_format(attributes["forecast"], local_tz, now)

        # Try detailedHourly format (Solcast integration)
        if "detailedHourly" in attributes:
            return self._parse_detailed_hourly_format(
                attributes["detailedHourly"], local_tz, now
            )

        # Try generic data format
        if "data" in attributes:
            return self._parse_generic_data_format(attributes["data"], local_tz, now)

        # Try hourly format
        if "hourly" in attributes:
            return self._parse_hourly_format(attributes["hourly"], local_tz, now)

        return None

    def _parse_solcast_format(
        self, forecasts: list[dict], local_tz: Any, now: datetime
    ) -> list[dict[str, Any]]:
        """Parse Solcast forecast format."""
        result = []

        for entry in forecasts:
            try:
                # Solcast uses period_start and pv_estimate (in kW)
                period_start = entry.get("period_start")
                if isinstance(period_start, str):
                    start_time = datetime.fromisoformat(
                        period_start.replace("Z", "+00:00")
                    )
                else:
                    start_time = period_start

                start_local = start_time.astimezone(local_tz)

                # Skip past hours
                if start_local < now - timedelta(hours=1):
                    continue

                # pv_estimate is in kW, convert to kWh for 30-min period
                pv_estimate = entry.get("pv_estimate", 0) or 0
                # Solcast uses 30-min periods, so kWh = kW * 0.5
                kwh = float(pv_estimate) * 0.5

                result.append({
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "datetime": start_local,
                })
            except (KeyError, ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing Solcast entry: %s", err)
                continue

        # Aggregate 30-min periods into hourly
        return self._aggregate_to_hourly(result)

    def _parse_forecast_solar_format(
        self, forecast: dict, local_tz: Any, now: datetime
    ) -> list[dict[str, Any]]:
        """Parse Forecast.Solar format (dict with datetime keys)."""
        result = []

        for timestamp_str, wh_value in forecast.items():
            try:
                # Forecast.Solar uses ISO format timestamps as keys
                timestamp = datetime.fromisoformat(timestamp_str)
                local_time = timestamp.astimezone(local_tz)

                # Skip past hours
                if local_time < now - timedelta(hours=1):
                    continue

                # Value is in Wh, convert to kWh
                kwh = float(wh_value) / 1000.0

                result.append({
                    "hour": local_time.hour,
                    "date": local_time.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "datetime": local_time,
                })
            except (ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing Forecast.Solar entry: %s", err)
                continue

        return self._aggregate_to_hourly(result)

    def _parse_detailed_hourly_format(
        self, hourly_data: list[dict], local_tz: Any, now: datetime
    ) -> list[dict[str, Any]]:
        """Parse Solcast detailedHourly format."""
        result = []

        for entry in hourly_data:
            try:
                period_start = entry.get("period_start")
                if isinstance(period_start, str):
                    start_time = datetime.fromisoformat(
                        period_start.replace("Z", "+00:00")
                    )
                else:
                    start_time = period_start

                start_local = start_time.astimezone(local_tz)

                if start_local < now - timedelta(hours=1):
                    continue

                # pv_estimate is in kW for the hour
                kwh = float(entry.get("pv_estimate", 0) or 0)

                result.append({
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "datetime": start_local,
                })
            except (KeyError, ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing detailedHourly entry: %s", err)
                continue

        return result

    def _parse_generic_data_format(
        self, data: list[dict], local_tz: Any, now: datetime
    ) -> list[dict[str, Any]]:
        """Parse generic data format with start/end/value."""
        result = []

        for entry in data:
            try:
                start_str = entry.get("start", entry.get("time", ""))
                if not start_str:
                    continue

                start_time = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
                start_local = start_time.astimezone(local_tz)

                if start_local < now - timedelta(hours=1):
                    continue

                # Try different value keys
                value = entry.get("value", entry.get("power", entry.get("energy", 0)))
                kwh = float(value) if value else 0

                result.append({
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "datetime": start_local,
                })
            except (ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing generic data entry: %s", err)
                continue

        return self._aggregate_to_hourly(result)

    def _parse_hourly_format(
        self, hourly: list | dict, local_tz: Any, now: datetime
    ) -> list[dict[str, Any]]:
        """Parse simple hourly format."""
        result = []
        current_date = now.date()

        if isinstance(hourly, list):
            # List of values, assume starting from hour 0
            for hour, value in enumerate(hourly):
                forecast_time = datetime.combine(
                    current_date,
                    datetime.min.time().replace(hour=hour)
                ).replace(tzinfo=local_tz)

                if forecast_time < now - timedelta(hours=1):
                    continue

                result.append({
                    "hour": hour,
                    "date": forecast_time.strftime("%Y-%m-%d"),
                    "kwh": float(value) if value else 0,
                    "datetime": forecast_time,
                })
        elif isinstance(hourly, dict):
            # Dict with hour keys
            for hour_str, value in hourly.items():
                try:
                    hour = int(hour_str)
                    forecast_time = datetime.combine(
                        current_date,
                        datetime.min.time().replace(hour=hour)
                    ).replace(tzinfo=local_tz)

                    if forecast_time < now - timedelta(hours=1):
                        continue

                    result.append({
                        "hour": hour,
                        "date": forecast_time.strftime("%Y-%m-%d"),
                        "kwh": float(value) if value else 0,
                        "datetime": forecast_time,
                    })
                except (ValueError, TypeError):
                    continue

        return result

    def _aggregate_to_hourly(
        self, data: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Aggregate sub-hourly data to hourly totals."""
        hourly_totals: dict[str, dict[str, Any]] = {}

        for entry in data:
            key = f"{entry['date']}_{entry['hour']}"
            if key not in hourly_totals:
                hourly_totals[key] = {
                    "hour": entry["hour"],
                    "date": entry["date"],
                    "kwh": 0.0,
                }
            hourly_totals[key]["kwh"] += entry["kwh"]

        # Sort by datetime
        result = sorted(
            hourly_totals.values(),
            key=lambda x: (x["date"], x["hour"])
        )

        return result

    def _distribute_daily_forecast(
        self, daily_total: float, hours_ahead: int
    ) -> list[dict[str, Any]]:
        """Distribute daily total across daylight hours (6:00-18:00).

        Uses a bell curve distribution peaking at noon.
        """
        result = []
        now = dt_util.now()
        local_tz = dt_util.get_default_time_zone()

        # Simple solar curve weights for hours 6-18
        solar_weights = {
            6: 0.02, 7: 0.05, 8: 0.08, 9: 0.11, 10: 0.13, 11: 0.14,
            12: 0.14, 13: 0.13, 14: 0.11, 15: 0.08, 16: 0.05, 17: 0.02,
            18: 0.01,
        }

        for offset in range(hours_ahead):
            forecast_time = now + timedelta(hours=offset)
            hour = forecast_time.hour

            # Get weight for this hour (0 for night hours)
            weight = solar_weights.get(hour, 0.0)
            kwh = daily_total * weight

            result.append({
                "hour": hour,
                "date": forecast_time.strftime("%Y-%m-%d"),
                "kwh": kwh,
            })

        return result

    def _generate_zero_forecast(self, hours_ahead: int) -> list[dict[str, Any]]:
        """Generate a zero forecast for the specified hours."""
        result = []
        now = dt_util.now()

        for offset in range(hours_ahead):
            forecast_time = now + timedelta(hours=offset)
            result.append({
                "hour": forecast_time.hour,
                "date": forecast_time.strftime("%Y-%m-%d"),
                "kwh": 0.0,
            })

        return result

    def get_forecast_sum(self, hours_ahead: int = 24) -> float:
        """Get total PV forecast for the specified hours."""
        forecast = self.get_hourly_forecast(hours_ahead)
        return sum(entry["kwh"] for entry in forecast)

    def get_forecast_for_range(
        self, start_hour: int, end_hour: int, date: str | None = None
    ) -> float:
        """Get total PV forecast for a specific hour range on a date."""
        forecast = self.get_hourly_forecast(48)

        if date is None:
            date = dt_util.now().strftime("%Y-%m-%d")

        total = 0.0
        for entry in forecast:
            if entry["date"] == date and start_hour <= entry["hour"] < end_hour:
                total += entry["kwh"]

        return total
