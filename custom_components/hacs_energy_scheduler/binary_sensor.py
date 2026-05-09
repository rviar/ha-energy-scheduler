"""Binary sensor platform for HACS Energy Scheduler."""
from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up binary sensor platform."""
    data = hass.data[DOMAIN][entry.entry_id]
    ev_controller = data["coordinator"]._ev_charge_controller
    if ev_controller and not ev_controller.uses_direct_control:
        async_add_entities([EVChargeRequestedSensor(ev_controller, entry)])


class EVChargeRequestedSensor(BinarySensorEntity):
    """Binary sensor indicating if EV charge is requested."""

    _attr_has_entity_name = True
    _attr_name = "EV Charge Requested"
    _attr_icon = "mdi:ev-station"

    def __init__(self, ev_controller, entry: ConfigEntry) -> None:
        self._ev = ev_controller
        self._attr_unique_id = f"{entry.entry_id}_ev_charge_requested"
        ev_controller.register_listener(self.schedule_update_ha_state)

    @property
    def is_on(self) -> bool:
        return self._ev.requested
