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

    def __init__(
        self,
        hass: HomeAssistant,
        sensor_entity_id: str | None,
        tomorrow_sensor_entity_id: str | None = None,
    ) -> None:
        """Initialize the PV forecast parser."""
        self.hass = hass
        self.sensor_entity_id = sensor_entity_id
        self.tomorrow_sensor_entity_id = tomorrow_sensor_entity_id

    def get_hourly_forecast(self, hours_ahead: int = 48) -> list[dict[str, Any]]:
        """Get hourly PV forecast for the specified number of hours.

        Combines today and tomorrow sensors if both are configured.

        Returns:
            List of dicts with keys: hour (int), date (str), kwh (float),
            and optionally kwh_p10, kwh_p90, confidence when the source
            provides probabilistic data (Solcast).
        """
        if not self.sensor_entity_id:
            _LOGGER.debug("No PV forecast sensor configured, returning zeros")
            return self._generate_zero_forecast(hours_ahead)

        # Parse today sensor
        today_data = self._parse_sensor(self.sensor_entity_id, hours_ahead)

        # Parse tomorrow sensor and merge
        if self.tomorrow_sensor_entity_id:
            tomorrow_data = self._parse_sensor(self.tomorrow_sensor_entity_id, hours_ahead)
            if tomorrow_data:
                # Merge: use dict keyed by (date, hour) to avoid duplicates
                merged: dict[str, dict[str, Any]] = {}
                for entry in (today_data or []):
                    key = f"{entry['date']}_{entry['hour']}"
                    merged[key] = entry
                for entry in tomorrow_data:
                    key = f"{entry['date']}_{entry['hour']}"
                    if key not in merged:
                        merged[key] = entry
                today_data = sorted(merged.values(), key=lambda x: (x["date"], x["hour"]))

        return today_data or self._generate_zero_forecast(hours_ahead)

    def get_today_full_forecast(self) -> list[dict[str, Any]]:
        """Get full 24h forecast for today including past hours.

        Used by dynamic-confidence calculation to reconstruct the forecast
        for hours that have already elapsed today. Solcast keeps these
        entries in detailedHourly even after they pass.
        """
        if not self.sensor_entity_id:
            return []
        data = self._parse_sensor(
            self.sensor_entity_id, 48, include_past=True,
        )
        if not data:
            return []
        today = dt_util.now().strftime("%Y-%m-%d")
        return [entry for entry in data if entry.get("date") == today]

    def _parse_sensor(
        self,
        entity_id: str,
        hours_ahead: int,
        include_past: bool = False,
    ) -> list[dict[str, Any]] | None:
        """Parse forecast data from a single sensor."""
        state = self.hass.states.get(entity_id)
        if state is None:
            _LOGGER.warning("PV forecast sensor %s not found", entity_id)
            return None

        forecast_data = self._parse_forecast_attributes(
            state.attributes, include_past=include_past,
        )

        if not forecast_data:
            try:
                daily_total = float(state.state)
                forecast_data = self._distribute_daily_forecast(daily_total, hours_ahead)
            except (ValueError, TypeError):
                _LOGGER.warning("Could not parse PV forecast from sensor %s", entity_id)
                return None

        return forecast_data

    def _parse_forecast_attributes(
        self, attributes: dict[str, Any], include_past: bool = False,
    ) -> list[dict[str, Any]] | None:
        """Parse forecast from sensor attributes.

        Supports multiple formats:
        - Solcast: 'forecasts' attribute with period_start and pv_estimate
        - Forecast.Solar: 'forecast' attribute with hourly data
        - Generic: 'data' or 'hourly' attributes
        """
        local_tz = dt_util.get_default_time_zone()
        now = dt_util.now()
        confidence_map = self._build_confidence_map(attributes, local_tz)

        # Try Solcast format
        if "forecasts" in attributes:
            return self._parse_solcast_format(
                attributes["forecasts"], local_tz, now, confidence_map, include_past,
            )

        # Try Forecast.Solar format (watt hours per period)
        if "forecast" in attributes:
            return self._parse_forecast_solar_format(
                attributes["forecast"], local_tz, now, include_past,
            )

        # Try detailedHourly format (Solcast integration)
        if "detailedHourly" in attributes:
            return self._parse_detailed_hourly_format(
                attributes["detailedHourly"], local_tz, now,
                confidence_map, include_past,
            )

        # Try generic data format
        if "data" in attributes:
            return self._parse_generic_data_format(
                attributes["data"], local_tz, now, include_past,
            )

        # Try hourly format
        if "hourly" in attributes:
            return self._parse_hourly_format(
                attributes["hourly"], local_tz, now, include_past,
            )

        return None

    def _build_confidence_map(
        self, attributes: dict[str, Any], local_tz: Any,
    ) -> dict[tuple[str, int], float]:
        """Build a (date, hour) -> avg confidence map from analysis.intervals.

        Solcast publishes per-30-min confidence values in
        attributes['analysis']['intervals']. We average pairs into hourly
        confidence so it lines up with the optimizer's hourly grid.
        """
        analysis = attributes.get("analysis")
        if not isinstance(analysis, dict):
            return {}
        intervals = analysis.get("intervals")
        if not isinstance(intervals, list):
            return {}

        bucket: dict[tuple[str, int], list[float]] = {}
        for entry in intervals:
            try:
                period_start = entry.get("period_start")
                conf = entry.get("confidence")
                if period_start is None or conf is None:
                    continue
                if isinstance(period_start, str):
                    start_time = datetime.fromisoformat(
                        period_start.replace("Z", "+00:00")
                    )
                else:
                    start_time = period_start
                start_local = start_time.astimezone(local_tz)
                key = (start_local.strftime("%Y-%m-%d"), start_local.hour)
                bucket.setdefault(key, []).append(float(conf))
            except (KeyError, ValueError, TypeError):
                continue

        return {key: sum(vals) / len(vals) for key, vals in bucket.items() if vals}

    def _parse_solcast_format(
        self,
        forecasts: list[dict],
        local_tz: Any,
        now: datetime,
        confidence_map: dict[tuple[str, int], float],
        include_past: bool = False,
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

                if not include_past and start_local < now - timedelta(hours=1):
                    continue

                # pv_estimate is in kW, convert to kWh for 30-min period
                pv_estimate = entry.get("pv_estimate", 0) or 0
                pv_estimate10 = entry.get("pv_estimate10")
                pv_estimate90 = entry.get("pv_estimate90")
                kwh = float(pv_estimate) * 0.5

                result.append({
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "kwh_p10": float(pv_estimate10) * 0.5 if pv_estimate10 is not None else None,
                    "kwh_p90": float(pv_estimate90) * 0.5 if pv_estimate90 is not None else None,
                    "datetime": start_local,
                })
            except (KeyError, ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing Solcast entry: %s", err)
                continue

        # Aggregate 30-min periods into hourly
        return self._aggregate_to_hourly(result, confidence_map)

    def _parse_forecast_solar_format(
        self, forecast: dict, local_tz: Any, now: datetime,
        include_past: bool = False,
    ) -> list[dict[str, Any]]:
        """Parse Forecast.Solar format (dict with datetime keys)."""
        result = []

        for timestamp_str, wh_value in forecast.items():
            try:
                # Forecast.Solar uses ISO format timestamps as keys
                timestamp = datetime.fromisoformat(timestamp_str)
                local_time = timestamp.astimezone(local_tz)

                if not include_past and local_time < now - timedelta(hours=1):
                    continue

                # Value is in Wh, convert to kWh
                kwh = float(wh_value) / 1000.0

                result.append({
                    "hour": local_time.hour,
                    "date": local_time.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "kwh_p10": None,
                    "kwh_p90": None,
                    "datetime": local_time,
                })
            except (ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing Forecast.Solar entry: %s", err)
                continue

        return self._aggregate_to_hourly(result, {})

    def _parse_detailed_hourly_format(
        self, hourly_data: list[dict], local_tz: Any, now: datetime,
        confidence_map: dict[tuple[str, int], float] | None = None,
        include_past: bool = False,
    ) -> list[dict[str, Any]]:
        """Parse Solcast detailedHourly format."""
        confidence_map = confidence_map or {}
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

                if not include_past and start_local < now - timedelta(hours=1):
                    continue

                # pv_estimate is in kW for the hour
                kwh = float(entry.get("pv_estimate", 0) or 0)
                pv_estimate10 = entry.get("pv_estimate10")
                pv_estimate90 = entry.get("pv_estimate90")
                date_str = start_local.strftime("%Y-%m-%d")

                result.append({
                    "hour": start_local.hour,
                    "date": date_str,
                    "kwh": kwh,
                    "kwh_p10": float(pv_estimate10) if pv_estimate10 is not None else None,
                    "kwh_p90": float(pv_estimate90) if pv_estimate90 is not None else None,
                    "confidence": confidence_map.get((date_str, start_local.hour)),
                    "datetime": start_local,
                })
            except (KeyError, ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing detailedHourly entry: %s", err)
                continue

        return result

    def _parse_generic_data_format(
        self, data: list[dict], local_tz: Any, now: datetime,
        include_past: bool = False,
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

                if not include_past and start_local < now - timedelta(hours=1):
                    continue

                # Try different value keys
                value = entry.get("value", entry.get("power", entry.get("energy", 0)))
                kwh = float(value) if value else 0

                result.append({
                    "hour": start_local.hour,
                    "date": start_local.strftime("%Y-%m-%d"),
                    "kwh": kwh,
                    "kwh_p10": None,
                    "kwh_p90": None,
                    "datetime": start_local,
                })
            except (ValueError, TypeError) as err:
                _LOGGER.debug("Error parsing generic data entry: %s", err)
                continue

        return self._aggregate_to_hourly(result, {})

    def _parse_hourly_format(
        self, hourly: list | dict, local_tz: Any, now: datetime,
        include_past: bool = False,
    ) -> list[dict[str, Any]]:
        """Parse simple hourly format."""
        result = []
        current_date = now.date()

        if isinstance(hourly, list):
            # List of values, assume starting from hour 0 (max 24 entries)
            for hour, value in enumerate(hourly):
                if hour > 23:
                    break
                forecast_time = datetime.combine(
                    current_date,
                    datetime.min.time().replace(hour=hour)
                ).replace(tzinfo=local_tz)

                if not include_past and forecast_time < now - timedelta(hours=1):
                    continue

                result.append({
                    "hour": hour,
                    "date": forecast_time.strftime("%Y-%m-%d"),
                    "kwh": float(value) if value else 0,
                    "kwh_p10": None,
                    "kwh_p90": None,
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

                    if not include_past and forecast_time < now - timedelta(hours=1):
                        continue

                    result.append({
                        "hour": hour,
                        "date": forecast_time.strftime("%Y-%m-%d"),
                        "kwh": float(value) if value else 0,
                        "kwh_p10": None,
                        "kwh_p90": None,
                        "datetime": forecast_time,
                    })
                except (ValueError, TypeError):
                    continue

        return result

    def _aggregate_to_hourly(
        self,
        data: list[dict[str, Any]],
        confidence_map: dict[tuple[str, int], float],
    ) -> list[dict[str, Any]]:
        """Aggregate sub-hourly data to hourly totals.

        Sums kwh, kwh_p10, kwh_p90 across periods within the same hour.
        Confidence is looked up per (date, hour) from confidence_map
        (already averaged from per-period values when built).
        """
        hourly_totals: dict[str, dict[str, Any]] = {}

        for entry in data:
            key = f"{entry['date']}_{entry['hour']}"
            if key not in hourly_totals:
                hourly_totals[key] = {
                    "hour": entry["hour"],
                    "date": entry["date"],
                    "kwh": 0.0,
                    "kwh_p10": 0.0,
                    "kwh_p90": 0.0,
                    "_p10_seen": False,
                    "_p90_seen": False,
                }
            bucket = hourly_totals[key]
            bucket["kwh"] += entry["kwh"]
            if entry.get("kwh_p10") is not None:
                bucket["kwh_p10"] += entry["kwh_p10"]
                bucket["_p10_seen"] = True
            if entry.get("kwh_p90") is not None:
                bucket["kwh_p90"] += entry["kwh_p90"]
                bucket["_p90_seen"] = True

        for bucket in hourly_totals.values():
            if not bucket.pop("_p10_seen"):
                bucket["kwh_p10"] = None
            if not bucket.pop("_p90_seen"):
                bucket["kwh_p90"] = None
            bucket["confidence"] = confidence_map.get((bucket["date"], bucket["hour"]))

        return sorted(
            hourly_totals.values(),
            key=lambda x: (x["date"], x["hour"]),
        )

    def _distribute_daily_forecast(
        self, daily_total: float, hours_ahead: int
    ) -> list[dict[str, Any]]:
        """Distribute daily total across daylight hours (6:00-18:00).

        Uses a bell curve distribution peaking at noon.
        """
        result = []
        now = dt_util.now()
        local_tz = dt_util.get_default_time_zone()

        # Simple solar curve weights for hours 6-18 (normalized to sum=1.0)
        solar_weights = {
            6: 0.02, 7: 0.05, 8: 0.08, 9: 0.10, 10: 0.12, 11: 0.13,
            12: 0.13, 13: 0.12, 14: 0.10, 15: 0.07, 16: 0.04, 17: 0.02,
            18: 0.02,
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
                "kwh_p10": None,
                "kwh_p90": None,
                "confidence": None,
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
                "kwh_p10": None,
                "kwh_p90": None,
                "confidence": None,
            })

        return result

    def get_forecast_sum(self, hours_ahead: int = 36) -> float:
        """Get total PV forecast within the specified horizon."""
        forecast = self.get_hourly_forecast(hours_ahead)
        now = dt_util.now()
        horizon_end = now + timedelta(hours=hours_ahead)
        total = 0.0
        for entry in forecast:
            try:
                entry_dt = datetime.strptime(
                    f"{entry['date']} {entry['hour']}:00", "%Y-%m-%d %H:%M"
                ).replace(tzinfo=now.tzinfo)
                if now <= entry_dt < horizon_end:
                    total += entry["kwh"]
            except (KeyError, ValueError):
                pass
        return total

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


def baseline_kwh(entry: dict[str, Any]) -> float:
    """Apply probabilistic blend P10 + confidence * (P50 - P10).

    When confidence or P10 are missing (non-Solcast providers), returns the
    raw kwh value (effectively treating it as P50 with full confidence).
    """
    p10 = entry.get("kwh_p10")
    confidence = entry.get("confidence")
    p50 = entry.get("kwh", 0.0) or 0.0
    if p10 is None or confidence is None:
        return float(p50)
    blended = float(p10) + float(confidence) * (float(p50) - float(p10))
    # Guard against negative or NaN
    if blended < 0 or blended != blended:  # noqa: PLR0124
        return float(p50)
    return blended


def has_probabilistic_data(entries: list[dict[str, Any]]) -> bool:
    """True when at least one entry has both P10 and confidence."""
    return any(
        e.get("kwh_p10") is not None and e.get("confidence") is not None
        for e in entries
    )
