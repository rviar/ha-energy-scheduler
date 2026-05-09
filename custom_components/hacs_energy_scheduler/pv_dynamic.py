"""Dynamic PV confidence calculator.

Computes an intra-day correction factor for the PV forecast based on actual
production observed today. Combined with the probabilistic baseline (handled
in pv_forecast.py), this lets the optimizer react when reality diverges from
the morning forecast.

See docs/adr/0001-dynamic-pv-confidence.md for design rationale.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    PV_DYNAMIC_FACTOR_MAX,
    PV_DYNAMIC_FACTOR_MIN,
    PV_DYNAMIC_THRESHOLD_KWH,
)
from .pv_forecast import PVForecastParser, baseline_kwh

_LOGGER = logging.getLogger(__name__)


_UNIT_TO_KWH = {
    "kWh": 1.0,
    "Wh": 1e-3,
    "MWh": 1e3,
}


def _read_actual_today_kwh(
    hass: HomeAssistant, sensor_id: str | None,
) -> tuple[float | None, str | None]:
    """Read today-production sensor and return (kWh, error_reason).

    Returns (None, reason) on any problem so the caller can disable dynamic
    correction with a clear cause shown in attributes.
    """
    if not sensor_id:
        return None, "no_sensor"
    state = hass.states.get(sensor_id)
    if state is None:
        return None, "sensor_missing"
    if state.state in (None, "", "unknown", "unavailable"):
        return None, "sensor_unavailable"
    try:
        value = float(state.state)
    except (TypeError, ValueError):
        return None, "sensor_invalid"
    if value != value:  # NaN  # noqa: PLR0124
        return None, "sensor_invalid"
    if value < 0:
        return None, "sensor_negative"

    unit = state.attributes.get("unit_of_measurement")
    multiplier = _UNIT_TO_KWH.get(unit, 1.0 if unit is None else None)
    if multiplier is None:
        return None, f"unit_unsupported:{unit}"
    return value * multiplier, None


async def _get_pv_input_on_hours(
    hass: HomeAssistant,
    pv_input_switch: str | None,
    today: datetime,
) -> set[int] | None:
    """Return set of hours today where the PV-input switch was ON majority.

    Returns:
        - None if the switch is not configured (caller treats all hours as ON).
        - Empty set if recorder is unavailable / fails (caller treats all hours
          as ON via separate fallback).
        - Otherwise, set of hour ints (0-23) where switch was ON >= half the hour.
    """
    if not pv_input_switch:
        return None

    try:
        from homeassistant.components.recorder.history import (
            get_significant_states,
        )
        from homeassistant.components.recorder import get_instance
    except ImportError:
        _LOGGER.warning("Recorder component not available — assuming PV ON all day")
        return None

    midnight_local = today.replace(hour=0, minute=0, second=0, microsecond=0)
    end_local = midnight_local + timedelta(days=1)

    try:
        instance = get_instance(hass)
        history = await instance.async_add_executor_job(
            get_significant_states,
            hass,
            midnight_local,
            end_local,
            [pv_input_switch],
            None,
            True,
            False,
        )
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "Failed to read history for %s: %s — assuming PV ON",
            pv_input_switch, err,
        )
        return None

    states = history.get(pv_input_switch) if history else None
    if not states:
        # No history means we lack ground truth; let caller fall back.
        return None

    # Build interval list of (start, state) pairs in local time.
    intervals: list[tuple[datetime, str]] = []
    for entry in states:
        last_changed = getattr(entry, "last_changed", None)
        state_value = getattr(entry, "state", None)
        if last_changed is None or state_value is None:
            continue
        intervals.append((last_changed.astimezone(midnight_local.tzinfo), state_value))

    if not intervals:
        return None

    intervals.sort(key=lambda x: x[0])

    on_hours: set[int] = set()
    for hour in range(24):
        h_start = midnight_local + timedelta(hours=hour)
        h_end = h_start + timedelta(hours=1)
        if h_start > today:
            break

        # Determine the state at h_start
        state_at_start = "on"
        for ts, st in intervals:
            if ts <= h_start:
                state_at_start = st
            else:
                break

        on_seconds = 0.0
        cursor = h_start
        cursor_state = state_at_start
        for ts, st in intervals:
            if ts <= h_start:
                continue
            if ts >= h_end:
                break
            if cursor_state == "on":
                on_seconds += (ts - cursor).total_seconds()
            cursor = ts
            cursor_state = st
        if cursor_state == "on":
            on_seconds += (h_end - cursor).total_seconds()

        if on_seconds >= 1800:  # >= 30 min
            on_hours.add(hour)

    return on_hours


async def compute_today_factor(
    hass: HomeAssistant,
    pv_parser: PVForecastParser,
    pv_production_sensor: str | None,
    pv_input_switch: str | None,
) -> dict[str, Any]:
    """Compute intra-day correction factor and observability attributes.

    Returns a dict with at minimum:
        - factor: float in [PV_DYNAMIC_FACTOR_MIN, PV_DYNAMIC_FACTOR_MAX]
                  or 1.0 when inactive
        - active: bool — whether factor should be applied
        - reason: str — why active/inactive
        - actual_today_kwh: float | None
        - baseline_elapsed_kwh: float | None
        - baseline_today_kwh: float | None — total expected for the full day
        - solcast_confidence: float | None — daily analysis.confidence proxy
    """
    actual, sensor_err = _read_actual_today_kwh(hass, pv_production_sensor)
    today_dt = dt_util.now()
    today_str = today_dt.strftime("%Y-%m-%d")

    full_today = pv_parser.get_today_full_forecast()
    baseline_today_total = sum(baseline_kwh(e) for e in full_today)
    daily_confidences = [
        e.get("confidence") for e in full_today if e.get("confidence") is not None
    ]
    solcast_confidence = (
        sum(daily_confidences) / len(daily_confidences) if daily_confidences else None
    )

    if actual is None:
        return {
            "factor": 1.0,
            "active": False,
            "reason": sensor_err or "no_data",
            "actual_today_kwh": None,
            "baseline_elapsed_kwh": None,
            "baseline_today_kwh": baseline_today_total or None,
            "solcast_confidence": solcast_confidence,
        }

    pv_on_hours = await _get_pv_input_on_hours(hass, pv_input_switch, today_dt)

    # Sum baseline (denominator of the factor) and raw P50 (activation gate)
    # for past hours of today where PV was actually on. Activation is gated on
    # raw P50 so the threshold timing doesn't depend on Solcast confidence —
    # otherwise low-confidence days (small baseline) would activate dynamics
    # very late, exactly when the correction is most needed.
    current_hour = today_dt.hour
    baseline_elapsed = 0.0
    p50_elapsed = 0.0
    included_hours: list[int] = []
    excluded_hours: list[int] = []
    for entry in full_today:
        if entry["date"] != today_str:
            continue
        if entry["hour"] >= current_hour:
            continue  # only fully-elapsed hours
        if pv_on_hours is not None and entry["hour"] not in pv_on_hours:
            if (entry.get("kwh") or 0.0) > 0 or baseline_kwh(entry) > 0:
                excluded_hours.append(entry["hour"])
            continue
        baseline_elapsed += baseline_kwh(entry)
        p50_elapsed += float(entry.get("kwh", 0.0) or 0.0)
        if (entry.get("kwh") or 0.0) > 0 or baseline_kwh(entry) > 0:
            included_hours.append(entry["hour"])

    if pv_on_hours is None:
        on_hours_label = "all (switch unconfigured or recorder unavailable)"
    else:
        on_hours_label = f"{sorted(pv_on_hours)} (from switch history)"
    _LOGGER.debug(
        "PV dynamic inputs: actual=%.2f kWh, P50_elapsed=%.2f kWh, "
        "baseline_elapsed=%.2f kWh, included_solar_hours=%s, "
        "excluded_solar_hours=%s, pv_on_hours=%s",
        actual, p50_elapsed, baseline_elapsed,
        included_hours, excluded_hours, on_hours_label,
    )

    if p50_elapsed < PV_DYNAMIC_THRESHOLD_KWH or baseline_elapsed <= 0:
        return {
            "factor": 1.0,
            "active": False,
            "reason": "below_threshold",
            "actual_today_kwh": actual,
            "baseline_elapsed_kwh": baseline_elapsed,
            "baseline_today_kwh": baseline_today_total or None,
            "solcast_confidence": solcast_confidence,
        }

    raw = actual / baseline_elapsed
    factor = max(PV_DYNAMIC_FACTOR_MIN, min(PV_DYNAMIC_FACTOR_MAX, raw))
    return {
        "factor": factor,
        "active": True,
        "reason": "ok" if raw == factor else "clamped",
        "actual_today_kwh": actual,
        "baseline_elapsed_kwh": baseline_elapsed,
        "baseline_today_kwh": baseline_today_total or None,
        "solcast_confidence": solcast_confidence,
    }
