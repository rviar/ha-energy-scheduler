"""Dynamic PV confidence calculator.

Computes an intra-day correction factor for the PV forecast based on actual
production observed today. Combined with the probabilistic baseline (handled
in pv_forecast.py), this lets the optimizer react when reality diverges from
the morning forecast.

The factor is computed from per-hour sensor deltas (not from the cumulative
sensor reading), so we can symmetrically exclude hours where the inverter
was throttled — either via the PV-input switch (paid-import / negative-price
grid charge) or via the export switch (curtailment when sell price drops
below threshold and the battery is already absorbing all it can).

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
    """Read today-production sensor and return (kWh, error_reason)."""
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


async def _get_switch_on_hours_today(
    hass: HomeAssistant,
    switch_id: str | None,
    today: datetime,
) -> set[int] | None:
    """Return set of hours today where the switch was ON for >= half the hour.

    Returns:
        - None if the switch is not configured or recorder is unavailable
          (caller treats all hours as ON).
        - Otherwise, set of hour ints (0-23) where switch was ON >= 30 min.
    """
    if not switch_id:
        return None

    try:
        from homeassistant.components.recorder.history import (
            get_significant_states,
        )
        from homeassistant.components.recorder import get_instance
    except ImportError:
        _LOGGER.warning("Recorder not available — assuming %s ON all day", switch_id)
        return None

    midnight_local = today.replace(hour=0, minute=0, second=0, microsecond=0)
    end_local = midnight_local + timedelta(days=1)

    try:
        instance = get_instance(hass)
        history = await instance.async_add_executor_job(
            get_significant_states,
            hass, midnight_local, end_local, [switch_id], None, True, False,
        )
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning("Failed to read history for %s: %s", switch_id, err)
        return None

    states = history.get(switch_id) if history else None
    if not states:
        return None

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

        if on_seconds >= 1800:
            on_hours.add(hour)

    return on_hours


async def _read_today_sensor_hourly_deltas(
    hass: HomeAssistant, sensor_id: str, today_dt: datetime,
) -> tuple[dict[int, float] | None, str]:
    """Return per-hour kWh production for fully-elapsed hours of today.

    Uses HA Long-Term Statistics (`statistics_during_period`) which already
    aggregates `total_increasing` sensors into hourly buckets — same
    mechanism used by the consumption profile. Returns a dict mapping
    hour_int -> kWh produced in that hour, or (None, reason) when stats
    are unavailable / empty.

    Note: statistics are computed every ~5 minutes by default so the most
    recent hour may not appear immediately after it ends. Acceptable for
    our use case (we only consume fully-elapsed hours and optimization
    runs trail hour boundaries by at least a few minutes in practice).
    """
    midnight = today_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    current_hour_start = today_dt.replace(minute=0, second=0, microsecond=0)
    if current_hour_start <= midnight:
        return {}, "no_elapsed_hours"

    try:
        from homeassistant.components.recorder import get_instance
        from homeassistant.components.recorder.statistics import (
            statistics_during_period,
        )
    except ImportError:
        return None, "recorder_unavailable"

    # Run on the recorder's own executor — required by HA, otherwise it
    # logs a "Detected code that accesses the database without the database
    # executor" warning on every optimization run.
    try:
        stats = await get_instance(hass).async_add_executor_job(
            statistics_during_period,
            hass,
            midnight,
            current_hour_start + timedelta(seconds=1),
            {sensor_id},
            "hour",
            {"energy": "kWh"},  # let HA convert Wh/MWh → kWh for us
            {"sum"},
        )
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "Failed to read sensor statistics for %s: %s", sensor_id, err,
        )
        return None, "statistics_query_failed"

    sensor_stats = (stats.get(sensor_id) if stats else None) or []
    if len(sensor_stats) < 2:
        return None, "no_statistics"

    # For total_increasing sensors, each bucket's `sum` is the cumulative
    # value AT THE END of the bucket period. So `bucket[i].sum −
    # bucket[i-1].sum` equals production during the hour starting at
    # `bucket[i].start`. Same labeling convention as consumption_history.py
    # — verified against the HA Energy Dashboard which renders the same
    # buckets with the same labels.
    deltas: dict[int, float] = {}
    for i in range(1, len(sensor_stats)):
        prev_sum = sensor_stats[i - 1].get("sum")
        curr_sum = sensor_stats[i].get("sum")
        if prev_sum is None or curr_sum is None:
            continue
        delta = curr_sum - prev_sum
        if delta < 0:
            continue

        start_raw = sensor_stats[i].get("start")
        if isinstance(start_raw, (int, float)):
            entry_dt = datetime.fromtimestamp(start_raw, tz=midnight.tzinfo)
        elif isinstance(start_raw, datetime):
            entry_dt = start_raw.astimezone(midnight.tzinfo)
        else:
            continue
        if entry_dt.date() != midnight.date():
            continue
        deltas[entry_dt.hour] = float(delta)

    if not deltas:
        return None, "no_hourly_deltas"
    return deltas, "from_statistics"


async def compute_today_factor(
    hass: HomeAssistant,
    pv_parser: PVForecastParser,
    pv_production_sensor: str | None,
    pv_input_switch: str | None,
    export_surplus_switch: str | None = None,
) -> dict[str, Any]:
    """Compute intra-day correction factor and observability attributes.

    Returns a dict with at minimum:
        - factor: float in [PV_DYNAMIC_FACTOR_MIN, PV_DYNAMIC_FACTOR_MAX]
                  or 1.0 when inactive
        - active: bool
        - reason: str
        - actual_today_kwh: float | None
        - baseline_elapsed_kwh: float | None
        - baseline_today_kwh: float | None
        - solcast_confidence: float | None
    """
    actual_now, sensor_err = _read_actual_today_kwh(hass, pv_production_sensor)
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

    if actual_now is None or not pv_production_sensor:
        return {
            "factor": 1.0,
            "active": False,
            "reason": sensor_err or "no_data",
            "actual_today_kwh": actual_now,
            "baseline_elapsed_kwh": None,
            "baseline_today_kwh": baseline_today_total or None,
            "solcast_confidence": solcast_confidence,
        }

    # Per-hour sensor deltas for fully-elapsed hours. Lets us selectively
    # sum actual production for "useful" hours only, mirroring the
    # selective baseline summation below.
    hour_deltas, deltas_source = await _read_today_sensor_hourly_deltas(
        hass, pv_production_sensor, today_dt,
    )

    pv_on_hours = await _get_switch_on_hours_today(
        hass, pv_input_switch, today_dt,
    )
    export_on_hours = await _get_switch_on_hours_today(
        hass, export_surplus_switch, today_dt,
    )

    def _hour_useful(h: int) -> tuple[bool, str | None]:
        """Return (include_in_factor, exclusion_reason).

        A hour is useful when both PV-input and export switches were ON
        for the majority of that hour. When a switch is not configured,
        treat as always ON.
        """
        if pv_on_hours is not None and h not in pv_on_hours:
            return False, "pv_off"
        if export_on_hours is not None and h not in export_on_hours:
            return False, "export_off"
        return True, None

    current_hour = today_dt.hour
    actual_sum = 0.0
    baseline_elapsed = 0.0
    p50_elapsed = 0.0
    included_hours: list[int] = []
    excluded_pv: list[int] = []
    excluded_export: list[int] = []
    missing_history: list[int] = []

    for entry in full_today:
        if entry["date"] != today_str:
            continue
        h = entry["hour"]
        if h >= current_hour:
            continue  # current hour and future
        useful, reason = _hour_useful(h)
        has_solar = (entry.get("kwh") or 0.0) > 0 or baseline_kwh(entry) > 0
        if not useful:
            if has_solar:
                if reason == "pv_off":
                    excluded_pv.append(h)
                elif reason == "export_off":
                    excluded_export.append(h)
            continue
        # Useful hour: need both forecast (we have it) and actual delta
        # (from history). If history is missing for this hour, we can't
        # contribute it to either side without bias — skip it.
        if hour_deltas is None or h not in hour_deltas:
            if has_solar:
                missing_history.append(h)
            continue
        actual_sum += hour_deltas[h]
        baseline_elapsed += baseline_kwh(entry)
        p50_elapsed += float(entry.get("kwh", 0.0) or 0.0)
        if has_solar:
            included_hours.append(h)

    # Fallback path: history unavailable AND nothing was excluded by switch
    # logic. Use cumulative sensor at top-of-current-hour (may carry small
    # bias from yesterday-rollover edge cases on first install).
    fallback_used = False
    if hour_deltas is None and not excluded_pv and not excluded_export:
        # Approximate: actual_now is cumulative through "now"; we need
        # through "top of current hour". Without history we can't refine,
        # so accept the bias and surface it.
        actual_sum = float(actual_now)
        # Re-sum baseline for all elapsed solar hours treating switches as ON.
        baseline_elapsed = 0.0
        p50_elapsed = 0.0
        included_hours = []
        for entry in full_today:
            if entry["date"] != today_str:
                continue
            h = entry["hour"]
            if h >= current_hour:
                continue
            baseline_elapsed += baseline_kwh(entry)
            p50_elapsed += float(entry.get("kwh", 0.0) or 0.0)
            if (entry.get("kwh") or 0.0) > 0 or baseline_kwh(entry) > 0:
                included_hours.append(h)
        fallback_used = True

    # Build debug labels
    if pv_on_hours is None:
        pv_label = "all (unconfigured / no history)"
    else:
        pv_label = f"{sorted(pv_on_hours)}"
    if export_on_hours is None:
        export_label = "all (unconfigured / no history)"
    else:
        export_label = f"{sorted(export_on_hours)}"
    deltas_label = (
        f"{deltas_source}; {len(hour_deltas)} hourly deltas"
        if hour_deltas is not None else f"unavailable ({deltas_source})"
    )
    actual_label = (
        f"{actual_sum:.2f} kWh "
        f"({'cumulative-fallback' if fallback_used else 'sum-of-deltas'}; "
        f"current sensor: {actual_now:.2f} kWh)"
    )
    _LOGGER.debug(
        "PV dynamic inputs: actual=%s, P50_elapsed=%.2f kWh, "
        "baseline_elapsed=%.2f kWh, included_hours=%s, "
        "excluded_pv_off=%s, excluded_export_off=%s, missing_history=%s, "
        "pv_on_hours=%s, export_on_hours=%s, sensor_history=%s",
        actual_label, p50_elapsed, baseline_elapsed,
        included_hours, excluded_pv, excluded_export, missing_history,
        pv_label, export_label, deltas_label,
    )

    if p50_elapsed < PV_DYNAMIC_THRESHOLD_KWH or baseline_elapsed <= 0:
        return {
            "factor": 1.0,
            "active": False,
            "reason": "below_threshold",
            "actual_today_kwh": actual_sum,
            "baseline_elapsed_kwh": baseline_elapsed,
            "baseline_today_kwh": baseline_today_total or None,
            "solcast_confidence": solcast_confidence,
        }

    raw = actual_sum / baseline_elapsed
    factor = max(PV_DYNAMIC_FACTOR_MIN, min(PV_DYNAMIC_FACTOR_MAX, raw))
    return {
        "factor": factor,
        "active": True,
        "reason": "ok" if raw == factor else "clamped",
        "actual_today_kwh": actual_sum,
        "baseline_elapsed_kwh": baseline_elapsed,
        "baseline_today_kwh": baseline_today_total or None,
        "solcast_confidence": solcast_confidence,
    }
