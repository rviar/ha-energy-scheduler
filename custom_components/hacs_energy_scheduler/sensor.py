"""Sensor platform for HACS Energy Scheduler."""
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up sensor platform."""
    data = hass.data[DOMAIN][entry.entry_id]
    ev_controller = data["coordinator"]._ev_charge_controller
    entities = []
    if ev_controller:
        # Reason sensor always created (useful for diagnostics)
        entities.append(EVChargeReasonSensor(ev_controller, entry))
        # Amps sensor only as fallback (if no direct amps entity)
        if not ev_controller.uses_direct_control:
            entities.append(EVChargeAmpsSensor(ev_controller, entry))
    if entities:
        async_add_entities(entities)


class EVChargeAmpsSensor(SensorEntity):
    """Sensor showing recommended EV charge amps."""

    _attr_has_entity_name = True
    _attr_name = "EV Charge Amps"
    _attr_native_unit_of_measurement = "A"
    _attr_icon = "mdi:current-ac"

    def __init__(self, ev_controller, entry: ConfigEntry) -> None:
        self._ev = ev_controller
        self._attr_unique_id = f"{entry.entry_id}_ev_charge_amps"
        ev_controller.register_listener(self.schedule_update_ha_state)

    @property
    def native_value(self) -> int:
        return self._ev.amps


class EVChargeReasonSensor(SensorEntity):
    """Sensor showing the reason for current EV charge state."""

    _attr_has_entity_name = True
    _attr_name = "EV Charge Reason"
    _attr_icon = "mdi:information-outline"

    def __init__(self, ev_controller, entry: ConfigEntry) -> None:
        self._ev = ev_controller
        self._attr_unique_id = f"{entry.entry_id}_ev_charge_reason"
        ev_controller.register_listener(self.schedule_update_ha_state)

    @property
    def native_value(self) -> str:
        return self._ev.reason
