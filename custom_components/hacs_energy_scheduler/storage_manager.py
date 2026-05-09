"""Storage manager for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    OPTIMIZE_INTERVAL_AUTO,
    OPTIMIZE_INTERVAL_MANUAL,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)


class ScheduleStorageManager:
    """Manage schedule storage for Energy Scheduler."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage manager."""
        self._hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, dict[str, dict[str, Any]]] = {}
        self._state: dict[str, Any] = {
            "paused": False,
            "optimize_interval": OPTIMIZE_INTERVAL_AUTO,
        }

    def _get_stats(self) -> tuple[int, int]:
        """Return count of scheduled dates and hours."""
        date_count = len(self._data)
        hour_count = sum(len(hours) for hours in self._data.values())
        return date_count, hour_count

    async def async_load(self) -> dict[str, dict[str, dict[str, Any]]]:
        """Load schedule data from storage."""
        data = await self._store.async_load()
        if data is None:
            self._data = {}
            self._state = {
                "paused": False,
                "optimize_interval": OPTIMIZE_INTERVAL_AUTO,
            }
        elif isinstance(data, dict) and "schedule" in data:
            self._data = data.get("schedule", {})
            raw_state = data.get("state", {})
            self._state = {
                "paused": bool(raw_state.get("paused", False)),
                "optimize_interval": raw_state.get(
                    "optimize_interval",
                    OPTIMIZE_INTERVAL_AUTO,
                ),
            }
        else:
            # Backward compatibility with the old storage format.
            self._data = data
            self._state = {
                "paused": False,
                "optimize_interval": OPTIMIZE_INTERVAL_AUTO,
            }
        date_count, hour_count = self._get_stats()
        _LOGGER.debug(
            "Loaded schedule storage: %d dates, %d hours, paused=%s, interval=%s",
            date_count,
            hour_count,
            self.get_paused(),
            self.get_optimize_interval(),
        )
        return self._data

    async def async_save(self) -> None:
        """Save schedule data to storage."""
        await self._store.async_save({
            "schedule": self._data,
            "state": self._state,
        })

    def get_schedule(self, date: str | None = None) -> dict[str, dict[str, Any]]:
        """Get schedule for a specific date or all dates."""
        if date is None:
            return self._data
        return self._data.get(date, {})

    def get_hour_schedule(self, date: str, hour: str) -> dict[str, Any] | None:
        """Get schedule for a specific hour."""
        return self._data.get(date, {}).get(hour)

    def get_paused(self) -> bool:
        """Return the persisted paused flag."""
        return bool(self._state.get("paused", False))

    def get_optimize_interval(self) -> str:
        """Return the persisted optimization interval (AUTO or MANUAL)."""
        interval = str(
            self._state.get("optimize_interval", OPTIMIZE_INTERVAL_AUTO)
        )
        if interval not in (OPTIMIZE_INTERVAL_AUTO, OPTIMIZE_INTERVAL_MANUAL):
            return OPTIMIZE_INTERVAL_AUTO
        return interval

    async def async_set_paused(self, paused: bool) -> None:
        """Persist the paused flag."""
        self._state["paused"] = bool(paused)
        await self.async_save()

    async def async_set_optimize_interval(self, interval: str) -> None:
        """Persist the optimization interval."""
        self._state["optimize_interval"] = interval
        await self.async_save()

    async def async_set_hour_schedule(
        self,
        date: str,
        hour: str,
        action: str,
        soc_limit: int | None = None,
        soc_limit_type: str | None = None,
        full_hour: bool = False,
        minutes: int | None = None,
        planned_energy_kwh: float | None = None,
        ev_charging: bool = False,
        ev_charge_reason: str | None = None,
        manual: bool = False,
        export_surplus: bool | None = None,
        pv_input: bool | None = None,
    ) -> None:
        """Set schedule for a specific hour."""
        if date not in self._data:
            self._data[date] = {}

        schedule_entry = {
            "action": action,
            "soc_limit": soc_limit,
            "soc_limit_type": soc_limit_type,  # "max" (charge) or "min" (discharge)
            "full_hour": full_hour,
            "minutes": minutes,
            "planned_energy_kwh": planned_energy_kwh,
            "ev_charging": ev_charging,
            "ev_charge_reason": ev_charge_reason,
            "manual": manual,
            "export_surplus": export_surplus,
            "pv_input": pv_input,
        }

        # Remove None/False values (except action and per-slot toggles — False is meaningful)
        meaningful_keys = ("action", "export_surplus", "pv_input")
        schedule_entry = {
            k: v for k, v in schedule_entry.items()
            if k in meaningful_keys or (v is not None and v is not False)
        }
        # Drop None toggles entirely (no setting written for that slot)
        for toggle in ("export_surplus", "pv_input"):
            if schedule_entry.get(toggle) is None:
                schedule_entry.pop(toggle, None)

        self._data[date][hour] = schedule_entry
        await self.async_save()

    async def async_clear_hour_schedule(self, date: str, hour: str) -> None:
        """Clear schedule for a specific hour."""
        if date in self._data and hour in self._data[date]:
            del self._data[date][hour]
            if not self._data[date]:
                del self._data[date]
            await self.async_save()
            _LOGGER.debug("Cleared schedule for %s hour %s", date, hour)

    async def async_clear_date_schedule(self, date: str, preserve_manual: bool = False) -> None:
        """Clear all schedules for a specific date.

        Args:
            date: The date to clear schedules for
            preserve_manual: If True, keep entries with manual=True
        """
        if date not in self._data:
            return

        if preserve_manual:
            # Keep only manual entries
            manual_entries = {
                hour: entry for hour, entry in self._data[date].items()
                if entry.get("manual", False)
            }
            if manual_entries:
                self._data[date] = manual_entries
                _LOGGER.debug(
                    "Cleared auto schedules for %s, preserved %d manual entries",
                    date, len(manual_entries),
                )
            else:
                del self._data[date]
                _LOGGER.debug("Cleared all schedules for %s (no manual entries)", date)
        else:
            del self._data[date]
            _LOGGER.debug("Cleared all schedules for %s", date)

        await self.async_save()

    def get_manual_hours(self, date: str) -> set[str]:
        """Get set of hours with manual entries for a date."""
        if date not in self._data:
            return set()
        return {
            hour for hour, entry in self._data[date].items()
            if entry.get("manual", False)
        }

    async def async_set_manual_flag(self, date: str, hour: str, manual: bool) -> None:
        """Set or clear the manual flag for an hour."""
        if date in self._data and hour in self._data[date]:
            self._data[date][hour]["manual"] = manual
            if not manual:
                # Remove the key if False to save space
                del self._data[date][hour]["manual"]
            await self.async_save()
            _LOGGER.info("Set manual=%s for %s hour %s", manual, date, hour)

    async def async_clear_all(self) -> None:
        """Clear all schedule data."""
        self._data = {}
        await self.async_save()
        _LOGGER.info("Cleared all schedule data")

    async def async_cleanup_old_dates(self, days_to_keep: int = 7) -> None:
        """Remove schedule data older than specified days."""
        today = dt_util.now().date()
        dates_to_remove = []

        for date_str in self._data:
            try:
                schedule_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                delta = (today - schedule_date).days
                if delta > days_to_keep:
                    dates_to_remove.append(date_str)
            except ValueError:
                _LOGGER.warning("Invalid date format in storage: %s", date_str)
                dates_to_remove.append(date_str)

        for date_str in dates_to_remove:
            del self._data[date_str]

        if dates_to_remove:
            await self.async_save()
            _LOGGER.info("Cleaned up old schedule dates: %s", dates_to_remove)
