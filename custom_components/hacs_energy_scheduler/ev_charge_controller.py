"""EV charge controller for HACS Energy Scheduler.

Hybrid approach:
- If ev_charge_entity / ev_amps_entity configured -> direct control
- If not configured -> create fallback output sensors
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    CONF_EV_AMPS_ENTITY,
    CONF_EV_CHARGE_ENTITY,
    CONF_EV_MAX_CHARGE_AMPS,
    CONF_EV_MIN_CHARGE_AMPS,
    CONF_EV_VOLTAGE,
    DEFAULT_EV_MAX_CHARGE_AMPS,
    DEFAULT_EV_MIN_CHARGE_AMPS,
    DEFAULT_EV_VOLTAGE,
    EV_REASON_MANUAL,
    EV_REASON_NONE,
)

_LOGGER = logging.getLogger(__name__)


class EVChargeController:
    """Controls EV charging -- direct or via fallback sensors."""

    def __init__(self, hass: HomeAssistant, config: dict[str, Any]) -> None:
        self.hass = hass
        self._charge_entity = config.get(CONF_EV_CHARGE_ENTITY)
        self._amps_entity = config.get(CONF_EV_AMPS_ENTITY)
        self._max_amps = int(config.get(CONF_EV_MAX_CHARGE_AMPS, DEFAULT_EV_MAX_CHARGE_AMPS))
        self._min_amps = int(config.get(CONF_EV_MIN_CHARGE_AMPS, DEFAULT_EV_MIN_CHARGE_AMPS))
        self._voltage = int(config.get(CONF_EV_VOLTAGE, DEFAULT_EV_VOLTAGE))

        # Current state
        self._requested = False
        self._amps = 0
        self._reason = EV_REASON_NONE
        self._manual_override = False

        # Listeners for fallback sensors
        self._listeners: list[callable] = []

    @property
    def uses_direct_control(self) -> bool:
        """True if direct entity control is configured."""
        return bool(self._charge_entity)

    @property
    def requested(self) -> bool:
        return self._manual_override or self._requested

    @property
    def amps(self) -> int:
        return self._amps

    @property
    def reason(self) -> str:
        if self._manual_override:
            return EV_REASON_MANUAL
        return self._reason

    @property
    def max_amps(self) -> int:
        return self._max_amps

    @property
    def min_amps(self) -> int:
        return self._min_amps

    def calculate_amps_for_power(self, available_kw: float) -> int:
        """Calculate amps from available power (min 6A per EV spec)."""
        if self._voltage <= 0:
            return self._max_amps
        amps = int((available_kw * 1000) / self._voltage)
        return max(self._min_amps, min(amps, self._max_amps))

    async def async_start_charge(self, amps: int, reason: str) -> None:
        """Start EV charging -- direct or via state update."""
        self._requested = True
        self._amps = min(amps, self._max_amps)
        self._reason = reason

        if self.uses_direct_control:
            await self._async_direct_start(self._amps)
        self._notify()

    async def async_stop_charge(self) -> None:
        """Stop scheduled EV charging."""
        self._requested = False
        if not self._manual_override:
            self._amps = 0
            self._reason = EV_REASON_NONE
            if self.uses_direct_control:
                await self._async_direct_stop()
        self._notify()

    async def async_manual_start(self) -> None:
        """Start manual charge at max amps."""
        self._manual_override = True
        self._amps = self._max_amps
        self._reason = EV_REASON_MANUAL

        if self.uses_direct_control:
            await self._async_direct_start(self._max_amps)
        self._notify()
        _LOGGER.info("Manual EV charge started at %dA", self._max_amps)

    async def async_manual_stop(self) -> None:
        """Stop manual charge."""
        self._manual_override = False
        if not self._requested:
            self._amps = 0
            self._reason = EV_REASON_NONE
            if self.uses_direct_control:
                await self._async_direct_stop()
        self._notify()
        _LOGGER.info("Manual EV charge stopped")

    async def async_throttle_amps(self, new_amps: int) -> None:
        """Throttle charging current (called by breaker protection)."""
        if not self._requested and not self._manual_override:
            return
        clamped = max(self._min_amps, min(new_amps, self._max_amps))
        if clamped == self._amps:
            return
        self._amps = clamped
        if self.uses_direct_control and self._amps_entity:
            try:
                domain = self._amps_entity.split(".")[0]
                await self.hass.services.async_call(
                    domain, "set_value",
                    {"entity_id": self._amps_entity, "value": clamped},
                )
                _LOGGER.info("Breaker protection: throttled EV to %dA", clamped)
            except Exception as err:
                _LOGGER.error("Failed to throttle EV amps: %s", err)
        self._notify()

    async def async_pause_charge(self) -> None:
        """Pause charging due to breaker overload (can be resumed)."""
        if not self._requested and not self._manual_override:
            return
        self._amps = 0
        if self.uses_direct_control:
            await self._async_direct_stop()
        _LOGGER.warning("Breaker protection: EV charging paused (overload)")
        self._notify()

    async def async_resume_charge(self, amps: int) -> None:
        """Resume charging after breaker overload cleared."""
        if not self._requested and not self._manual_override:
            return
        self._amps = max(self._min_amps, min(amps, self._max_amps))
        if self.uses_direct_control:
            await self._async_direct_start(self._amps)
        _LOGGER.info("Breaker protection: EV charging resumed at %dA", self._amps)
        self._notify()

    # --- Direct control methods ---

    async def _async_direct_start(self, amps: int) -> None:
        """Directly turn on charger and set amps."""
        try:
            if self._amps_entity:
                domain = self._amps_entity.split(".")[0]
                await self.hass.services.async_call(
                    domain, "set_value",
                    {"entity_id": self._amps_entity, "value": amps},
                )
                _LOGGER.debug("Set EV charge amps: %s = %d", self._amps_entity, amps)

            if self._charge_entity:
                domain = self._charge_entity.split(".")[0]
                await self.hass.services.async_call(
                    domain, "turn_on",
                    {"entity_id": self._charge_entity},
                )
                _LOGGER.info("EV charge ON: %s at %dA", self._charge_entity, amps)
        except Exception as err:
            _LOGGER.error("Failed to start EV charge: %s", err)

    async def _async_direct_stop(self) -> None:
        """Directly turn off charger."""
        try:
            if self._charge_entity:
                domain = self._charge_entity.split(".")[0]
                await self.hass.services.async_call(
                    domain, "turn_off",
                    {"entity_id": self._charge_entity},
                )
                _LOGGER.info("EV charge OFF: %s", self._charge_entity)
        except Exception as err:
            _LOGGER.error("Failed to stop EV charge: %s", err)

    # --- Fallback sensor support ---

    def register_listener(self, callback: callable) -> None:
        """Register listener for fallback sensor updates."""
        self._listeners.append(callback)

    def _notify(self) -> None:
        for cb in self._listeners:
            cb()
