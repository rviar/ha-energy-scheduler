"""Storage manager for Energy Scheduler Pstryk."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)


class ScheduleStorageManager:
    """Manage schedule storage for Energy Scheduler."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage manager."""
        self._hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, dict[str, dict[str, Any]]] = {}

    async def async_load(self) -> dict[str, dict[str, dict[str, Any]]]:
        """Load schedule data from storage."""
        data = await self._store.async_load()
        if data is None:
            self._data = {}
        else:
            self._data = data
        _LOGGER.debug("Loaded schedule data: %s", self._data)
        return self._data

    async def async_save(self) -> None:
        """Save schedule data to storage."""
        await self._store.async_save(self._data)
        _LOGGER.debug("Saved schedule data: %s", self._data)

    def get_schedule(self, date: str | None = None) -> dict[str, dict[str, Any]]:
        """Get schedule for a specific date or all dates."""
        if date is None:
            return self._data
        return self._data.get(date, {})

    def get_hour_schedule(self, date: str, hour: str) -> dict[str, Any] | None:
        """Get schedule for a specific hour."""
        return self._data.get(date, {}).get(hour)

    async def async_set_hour_schedule(
        self,
        date: str,
        hour: str,
        action: str,
        soc_limit: int | None = None,
        full_hour: bool = False,
        minutes: int | None = None,
        ev_charging: bool = False,
    ) -> None:
        """Set schedule for a specific hour."""
        if date not in self._data:
            self._data[date] = {}

        schedule_entry = {
            "action": action,
            "soc_limit": soc_limit,
            "full_hour": full_hour,
            "minutes": minutes,
            "ev_charging": ev_charging,
        }

        # Remove None/False values (except action)
        schedule_entry = {k: v for k, v in schedule_entry.items() if v is not None and v is not False or k == "action"}

        self._data[date][hour] = schedule_entry
        await self.async_save()
        _LOGGER.info("Set schedule for %s hour %s: %s", date, hour, schedule_entry)

    async def async_clear_hour_schedule(self, date: str, hour: str) -> None:
        """Clear schedule for a specific hour."""
        if date in self._data and hour in self._data[date]:
            del self._data[date][hour]
            if not self._data[date]:
                del self._data[date]
            await self.async_save()
            _LOGGER.info("Cleared schedule for %s hour %s", date, hour)

    async def async_clear_date_schedule(self, date: str) -> None:
        """Clear all schedules for a specific date."""
        if date in self._data:
            del self._data[date]
            await self.async_save()
            _LOGGER.info("Cleared all schedules for %s", date)

    async def async_clear_all(self) -> None:
        """Clear all schedule data."""
        self._data = {}
        await self.async_save()
        _LOGGER.info("Cleared all schedule data")

    async def async_cleanup_old_dates(self, days_to_keep: int = 7) -> None:
        """Remove schedule data older than specified days."""
        today = datetime.now().date()
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
