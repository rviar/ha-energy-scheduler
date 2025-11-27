"""Energy Optimizer for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from math import ceil
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    ACTION_CHARGE,
    CONF_AUTO_OPTIMIZE,
    CONF_AVG_CONSUMPTION,
    CONF_BATTERY_CAPACITY,
    CONF_BATTERY_COST,
    CONF_BATTERY_CYCLES,
    CONF_BATTERY_MAX_CHARGE_POWER,
    CONF_BATTERY_MAX_DISCHARGE_POWER,
    CONF_BATTERY_MIN_SOC,
    CONF_BATTERY_SOC_SENSOR,
    CONF_EV_BATTERY_CAPACITY,
    CONF_EV_CONNECTED_SENSOR,
    CONF_EV_ENABLED,
    CONF_EV_MAX_CHARGE_POWER,
    CONF_EV_READY_BY,
    CONF_EV_SOC_SENSOR,
    CONF_EV_TARGET_SOC,
    CONF_MAX_GRID_POWER,
    CONF_MODE_CHARGE_BATTERY,
    CONF_MODE_CHARGE_EV,
    CONF_MODE_CHARGE_EV_AND_BATTERY,
    CONF_MODE_GRID_ONLY,
    CONF_MODE_SELL,
    CONF_MODE_SELL_SOLAR_ONLY,
    CONF_OPTIMIZE_INTERVAL,
    CONF_PV_FORECAST_SENSOR,
    DEFAULT_AVG_CONSUMPTION,
    DEFAULT_BATTERY_MIN_SOC,
    DEFAULT_EV_TARGET_SOC,
    DEFAULT_MAX_GRID_POWER,
)
from .pv_forecast import PVForecastParser

_LOGGER = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """Result of energy optimization."""

    charge_hours: list[dict[str, Any]] = field(default_factory=list)
    discharge_hours: list[dict[str, Any]] = field(default_factory=list)
    solar_hours: list[dict[str, Any]] = field(default_factory=list)
    emergency_charge: bool = False
    emergency_reason: str = ""
    ev_urgent_charge: bool = False
    ev_urgent_reason: str = ""
    skip_night_charge: bool = False
    total_deficit: float = 0.0
    cycle_cost: float = 0.0
    warnings: list[str] = field(default_factory=list)


class EnergyOptimizer:
    """Energy optimization engine."""

    def __init__(
        self,
        hass: HomeAssistant,
        config: dict[str, Any],
        price_data_callback: callable,
    ) -> None:
        """Initialize the optimizer.

        Args:
            hass: Home Assistant instance
            config: Configuration dictionary with optimizer settings
            price_data_callback: Callback to get current price data
        """
        self.hass = hass
        self._config = config
        self._get_price_data = price_data_callback
        self._pv_parser = PVForecastParser(
            hass, config.get(CONF_PV_FORECAST_SENSOR)
        )

    # === Configuration Properties ===

    @property
    def battery_capacity(self) -> float:
        """Return battery capacity in kWh."""
        return self._config.get(CONF_BATTERY_CAPACITY, 0.0)

    @property
    def battery_min_soc(self) -> int:
        """Return minimum battery SOC in percent."""
        return self._config.get(CONF_BATTERY_MIN_SOC, DEFAULT_BATTERY_MIN_SOC)

    @property
    def battery_max_charge_power(self) -> float:
        """Return max battery charge power in kW."""
        return self._config.get(CONF_BATTERY_MAX_CHARGE_POWER, 0.0)

    @property
    def battery_max_discharge_power(self) -> float:
        """Return max battery discharge power in kW."""
        # If not configured, fall back to charge power
        discharge_power = self._config.get(CONF_BATTERY_MAX_DISCHARGE_POWER, 0.0)
        if discharge_power <= 0:
            return self.battery_max_charge_power
        return discharge_power

    @property
    def battery_cost(self) -> float:
        """Return battery cost in currency."""
        return self._config.get(CONF_BATTERY_COST, 0.0)

    @property
    def battery_cycles(self) -> int:
        """Return battery cycle count."""
        return self._config.get(CONF_BATTERY_CYCLES, 1)

    @property
    def avg_consumption(self) -> float:
        """Return average consumption in kW."""
        return self._config.get(CONF_AVG_CONSUMPTION, DEFAULT_AVG_CONSUMPTION)

    @property
    def max_grid_power(self) -> float:
        """Return max grid power in kW."""
        return self._config.get(CONF_MAX_GRID_POWER, DEFAULT_MAX_GRID_POWER)

    @property
    def ev_enabled(self) -> bool:
        """Return if EV support is enabled."""
        return self._config.get(CONF_EV_ENABLED, False)

    @property
    def ev_battery_capacity(self) -> float:
        """Return EV battery capacity in kWh."""
        return self._config.get(CONF_EV_BATTERY_CAPACITY, 0.0)

    @property
    def ev_max_charge_power(self) -> float:
        """Return max EV charge power in kW."""
        return self._config.get(CONF_EV_MAX_CHARGE_POWER, 0.0)

    @property
    def ev_target_soc(self) -> int:
        """Return target EV SOC in percent."""
        return self._config.get(CONF_EV_TARGET_SOC, DEFAULT_EV_TARGET_SOC)

    @property
    def ev_ready_by(self) -> time | None:
        """Return EV ready by time."""
        ready_by = self._config.get(CONF_EV_READY_BY)
        if ready_by:
            if isinstance(ready_by, time):
                return ready_by
            if isinstance(ready_by, str):
                try:
                    return datetime.strptime(ready_by, "%H:%M").time()
                except ValueError:
                    return None
        return None

    # === Mode Properties ===

    @property
    def mode_charge_battery(self) -> str:
        """Return charge battery mode."""
        return self._config.get(CONF_MODE_CHARGE_BATTERY, "")

    @property
    def mode_charge_ev(self) -> str:
        """Return charge EV mode."""
        return self._config.get(CONF_MODE_CHARGE_EV, "")

    @property
    def mode_charge_ev_and_battery(self) -> str:
        """Return charge EV and battery mode."""
        return self._config.get(CONF_MODE_CHARGE_EV_AND_BATTERY, "")

    @property
    def mode_sell(self) -> str:
        """Return sell/discharge mode."""
        return self._config.get(CONF_MODE_SELL, "")

    @property
    def mode_sell_solar_only(self) -> str:
        """Return sell solar only mode."""
        return self._config.get(CONF_MODE_SELL_SOLAR_ONLY, "")

    @property
    def mode_grid_only(self) -> str:
        """Return grid only mode."""
        return self._config.get(CONF_MODE_GRID_ONLY, "")

    # === Sensor State Helpers ===

    def _get_sensor_value(self, entity_id: str | None) -> float | None:
        """Get numeric value from a sensor."""
        if not entity_id:
            return None

        state = self.hass.states.get(entity_id)
        if state is None:
            return None

        try:
            return float(state.state)
        except (ValueError, TypeError):
            return None

    def _get_battery_soc(self) -> float | None:
        """Get current battery SOC."""
        return self._get_sensor_value(self._config.get(CONF_BATTERY_SOC_SENSOR))

    def _get_ev_soc(self) -> float | None:
        """Get current EV SOC."""
        if not self.ev_enabled:
            return None
        return self._get_sensor_value(self._config.get(CONF_EV_SOC_SENSOR))

    def _is_ev_connected(self) -> bool:
        """Check if EV is connected."""
        if not self.ev_enabled:
            return False

        sensor_id = self._config.get(CONF_EV_CONNECTED_SENSOR)
        if not sensor_id:
            return False

        state = self.hass.states.get(sensor_id)
        if state is None:
            return False

        # Handle binary_sensor (on/off) and regular sensor (true/false, 1/0, connected/disconnected)
        state_value = state.state.lower()
        return state_value in ("on", "true", "1", "connected", "charging", "plugged")

    # === Calculation Methods ===

    def calculate_cycle_cost(self) -> float:
        """Calculate battery cycle cost per kWh.

        A full cycle = charge + discharge = 2 × capacity
        """
        if self.battery_cycles <= 0 or self.battery_capacity <= 0:
            return 0.0

        cost_per_cycle = self.battery_cost / self.battery_cycles
        # Cycle cost per kWh (full cycle = 2 × capacity)
        return cost_per_cycle / (self.battery_capacity * 2)

    def calculate_energy_balance(self, hours_ahead: int = 24) -> dict[str, float]:
        """Calculate energy balance for the planning horizon.

        Returns dict with:
            - consumption: Total expected consumption (kWh)
            - solar_production: Total expected PV production (kWh)
            - usable_battery: Available battery energy (kWh)
            - ev_need: Energy needed for EV (kWh)
            - deficit: Energy to buy from grid (kWh)
        """
        # Get current battery state
        battery_soc = self._get_battery_soc() or 0.0
        usable_battery = self.battery_capacity * (battery_soc - self.battery_min_soc) / 100
        usable_battery = max(0, usable_battery)

        # Expected consumption
        consumption = hours_ahead * self.avg_consumption

        # Solar production forecast
        solar_production = self._pv_parser.get_forecast_sum(hours_ahead)

        # EV energy need
        ev_need = 0.0
        if self.ev_enabled and self._is_ev_connected():
            ev_soc = self._get_ev_soc() or 0.0
            ev_need = self.ev_battery_capacity * (self.ev_target_soc - ev_soc) / 100
            ev_need = max(0, ev_need)

        # Calculate deficit
        deficit = max(0, consumption - solar_production - usable_battery + ev_need)

        return {
            "consumption": consumption,
            "solar_production": solar_production,
            "usable_battery": usable_battery,
            "ev_need": ev_need,
            "deficit": deficit,
        }

    def _get_effective_charge_power(self) -> tuple[float, float]:
        """Get effective charge power considering grid limit.

        Returns (battery_power, ev_power) tuple.
        """
        battery_power = self.battery_max_charge_power
        ev_power = self.ev_max_charge_power if self.ev_enabled and self._is_ev_connected() else 0

        total_needed = battery_power + ev_power

        if total_needed > self.max_grid_power:
            # Proportionally reduce
            ratio = self.max_grid_power / total_needed
            battery_power = battery_power * ratio
            ev_power = ev_power * ratio

        return battery_power, ev_power

    # === Optimization Methods ===

    def check_emergency_charge(
        self, buy_prices: list[dict], pv_forecast: list[dict]
    ) -> dict[str, Any]:
        """Check if emergency charging is needed.

        Emergency = not enough energy to survive until next cheap hour.
        """
        battery_soc = self._get_battery_soc() or 0.0
        available_energy = self.battery_capacity * (battery_soc - self.battery_min_soc) / 100
        available_energy = max(0, available_energy)

        if not buy_prices:
            return {"emergency": False}

        now = dt_util.now()
        current_hour = now.hour

        # Sort prices to find cheapest hours
        sorted_prices = sorted(buy_prices, key=lambda x: x.get("value", float("inf")))
        if not sorted_prices:
            return {"emergency": False}

        # Find next cheap hour (in the cheapest 25%)
        cheap_threshold_idx = max(1, len(sorted_prices) // 4)
        cheap_hours = {
            (p["date"], p["hour"]) for p in sorted_prices[:cheap_threshold_idx]
        }

        # Find hours until next cheap hour
        hours_until_cheap = 0
        for offset in range(48):
            check_time = now + timedelta(hours=offset)
            check_key = (check_time.strftime("%Y-%m-%d"), check_time.hour)
            if check_key in cheap_hours:
                hours_until_cheap = offset
                break
        else:
            hours_until_cheap = 24  # Default if no cheap hour found

        if hours_until_cheap == 0:
            return {"emergency": False}

        # Calculate energy needed to survive
        energy_needed = hours_until_cheap * self.avg_consumption

        # Add PV forecast for this period
        pv_until_cheap = sum(
            p["kwh"] for p in pv_forecast[:hours_until_cheap]
        ) if pv_forecast else 0

        energy_available = available_energy + pv_until_cheap

        if energy_needed > energy_available:
            # Emergency! Need to charge now
            deficit = energy_needed - energy_available

            # Avoid division by zero if max charge power not configured
            if self.battery_max_charge_power <= 0:
                hours_needed = ceil(deficit)  # Assume 1 kW default
            else:
                hours_needed = ceil(deficit / self.battery_max_charge_power)

            # Find cheapest hours before next planned cheap hour
            immediate_prices = [
                p for p in buy_prices
                if self._hours_from_now(p) < hours_until_cheap
            ]
            immediate_prices.sort(key=lambda x: x.get("value", float("inf")))
            emergency_hours = immediate_prices[:hours_needed]

            return {
                "emergency": True,
                "hours": emergency_hours,
                "reason": f"SOC {battery_soc:.0f}% insufficient for {hours_until_cheap}h wait "
                         f"(need {energy_needed:.1f} kWh, have {energy_available:.1f} kWh)",
            }

        return {"emergency": False}

    def check_ev_charging_feasibility(self) -> dict[str, Any]:
        """Check if EV can be charged in time."""
        if not self.ev_enabled or not self._is_ev_connected():
            return {"feasible": True}

        if not self.ev_ready_by:
            return {"feasible": True}

        now = dt_util.now()
        ready_by_datetime = datetime.combine(now.date(), self.ev_ready_by)
        ready_by_datetime = ready_by_datetime.replace(tzinfo=now.tzinfo)

        # Handle next day
        if ready_by_datetime <= now:
            ready_by_datetime += timedelta(days=1)

        hours_available = (ready_by_datetime - now).total_seconds() / 3600

        ev_soc = self._get_ev_soc() or 0.0
        ev_energy_needed = self.ev_battery_capacity * (self.ev_target_soc - ev_soc) / 100
        ev_energy_needed = max(0, ev_energy_needed)

        hours_needed = ev_energy_needed / self.ev_max_charge_power if self.ev_max_charge_power > 0 else float("inf")

        if hours_needed > hours_available:
            return {
                "feasible": False,
                "urgent": True,
                "reason": f"EV needs {hours_needed:.1f}h, only {hours_available:.1f}h available",
            }

        return {"feasible": True}

    def should_skip_night_charge(self, pv_forecast: list[dict]) -> bool:
        """Check if night charge can be skipped due to sufficient PV forecast."""
        if not pv_forecast:
            return False

        # Sum PV forecast for daylight hours (6:00-18:00)
        tomorrow_pv = sum(
            p["kwh"] for p in pv_forecast
            if 6 <= p.get("hour", 0) < 18
        )

        # Expected consumption for 12 daylight hours
        tomorrow_consumption = 12 * self.avg_consumption

        # Skip if PV covers consumption with 20% margin
        if tomorrow_pv > tomorrow_consumption * 1.2:
            _LOGGER.info(
                "Sufficient PV forecast (%.1f kWh > %.1f kWh), skipping night charge",
                tomorrow_pv, tomorrow_consumption
            )
            return True

        return False

    def _hours_from_now(self, price_entry: dict) -> float:
        """Calculate hours from now for a price entry."""
        now = dt_util.now()
        entry_date = price_entry.get("date", now.strftime("%Y-%m-%d"))
        entry_hour = price_entry.get("hour", 0)

        try:
            entry_time = datetime.strptime(f"{entry_date} {entry_hour}:00", "%Y-%m-%d %H:%M")
            entry_time = entry_time.replace(tzinfo=now.tzinfo)
            return (entry_time - now).total_seconds() / 3600
        except ValueError:
            return 0

    def optimize(self, hours_ahead: int = 24) -> OptimizationResult:
        """Run the optimization algorithm.

        Args:
            hours_ahead: Planning horizon in hours

        Returns:
            OptimizationResult with schedule recommendations
        """
        result = OptimizationResult()

        # Log configuration
        _LOGGER.debug("=" * 60)
        _LOGGER.debug("OPTIMIZATION START - Planning horizon: %d hours", hours_ahead)
        _LOGGER.debug("=" * 60)
        _LOGGER.debug("Configuration:")
        _LOGGER.debug("  Battery capacity: %.1f kWh", self.battery_capacity)
        _LOGGER.debug("  Battery min SOC: %d%%", self.battery_min_soc)
        _LOGGER.debug("  Battery max charge power: %.1f kW", self.battery_max_charge_power)
        _LOGGER.debug("  Battery max discharge power: %.1f kW", self.battery_max_discharge_power)
        _LOGGER.debug("  Battery cost: %.0f EUR, cycles: %d", self.battery_cost, self.battery_cycles)
        _LOGGER.debug("  Avg consumption: %.2f kW", self.avg_consumption)
        _LOGGER.debug("  Max grid power: %.1f kW", self.max_grid_power)
        _LOGGER.debug("  EV enabled: %s", self.ev_enabled)
        if self.ev_enabled:
            _LOGGER.debug("  EV battery capacity: %.1f kWh", self.ev_battery_capacity)
            _LOGGER.debug("  EV max charge power: %.1f kW", self.ev_max_charge_power)
            _LOGGER.debug("  EV target SOC: %d%%", self.ev_target_soc)
            _LOGGER.debug("  EV connected: %s", self._is_ev_connected())
        _LOGGER.debug("Mode mappings:")
        _LOGGER.debug("  Charge battery: %s", self.mode_charge_battery)
        _LOGGER.debug("  Charge EV: %s", self.mode_charge_ev)
        _LOGGER.debug("  Charge EV+Battery: %s", self.mode_charge_ev_and_battery)
        _LOGGER.debug("  Sell: %s", self.mode_sell)
        _LOGGER.debug("  Sell solar only: %s", self.mode_sell_solar_only)

        # Get price data
        price_data = self._get_price_data()
        buy_prices = price_data.get("buy_prices", [])
        sell_prices = price_data.get("sell_prices", [])

        _LOGGER.debug("Price data:")
        _LOGGER.debug("  Buy prices count: %d", len(buy_prices))
        _LOGGER.debug("  Sell prices count: %d", len(sell_prices))
        if buy_prices:
            prices_sorted = sorted(buy_prices, key=lambda x: x.get("value", 0))
            _LOGGER.debug("  Min buy price: %.4f at %s %02d:00",
                        prices_sorted[0].get("value", 0),
                        prices_sorted[0].get("date", "?"),
                        prices_sorted[0].get("hour", 0))
            _LOGGER.debug("  Max buy price: %.4f at %s %02d:00",
                        prices_sorted[-1].get("value", 0),
                        prices_sorted[-1].get("date", "?"),
                        prices_sorted[-1].get("hour", 0))

        # Validate price data
        if not buy_prices:
            result.warnings.append("No buy price data available, using default mode")
            _LOGGER.warning("No buy price data available for optimization")
            return result

        # Check for price anomalies
        for i, buy in enumerate(buy_prices):
            sell = next(
                (s for s in sell_prices if s["date"] == buy["date"] and s["hour"] == buy["hour"]),
                None
            )
            if sell and sell.get("value", 0) > buy.get("value", 0):
                result.warnings.append(
                    f"Price anomaly at {buy['date']} {buy['hour']}:00 - sell > buy"
                )

        # Get PV forecast
        pv_forecast = self._pv_parser.get_hourly_forecast(hours_ahead)
        total_pv = sum(p.get("kwh", 0) for p in pv_forecast) if pv_forecast else 0
        _LOGGER.debug("PV Forecast:")
        _LOGGER.debug("  Forecast hours: %d", len(pv_forecast) if pv_forecast else 0)
        _LOGGER.debug("  Total PV expected: %.2f kWh", total_pv)
        if pv_forecast:
            for pv in pv_forecast[:6]:  # Log first 6 hours
                _LOGGER.debug("    %s %02d:00 - %.2f kWh",
                             pv.get("date", "?"), pv.get("hour", 0), pv.get("kwh", 0))

        # Check emergency charge
        emergency = self.check_emergency_charge(buy_prices, pv_forecast)
        if emergency.get("emergency"):
            result.emergency_charge = True
            result.emergency_reason = emergency.get("reason", "")
            result.charge_hours.extend(emergency.get("hours", []))
            _LOGGER.warning("Emergency charge needed: %s", result.emergency_reason)

        # Check EV charging feasibility
        ev_feasibility = self.check_ev_charging_feasibility()
        if not ev_feasibility.get("feasible"):
            result.ev_urgent_charge = True
            result.ev_urgent_reason = ev_feasibility.get("reason", "")
            result.warnings.append(f"EV urgent charge: {result.ev_urgent_reason}")

        # Check if night charge can be skipped
        result.skip_night_charge = self.should_skip_night_charge(pv_forecast)

        # Calculate energy balance and cycle cost
        balance = self.calculate_energy_balance(hours_ahead)
        result.total_deficit = balance["deficit"]
        result.cycle_cost = self.calculate_cycle_cost()

        _LOGGER.debug("Energy Balance:")
        _LOGGER.debug("  Consumption: %.2f kWh", balance.get("consumption", 0))
        _LOGGER.debug("  Solar production: %.2f kWh", balance.get("solar_production", 0))
        _LOGGER.debug("  Usable battery: %.2f kWh", balance.get("usable_battery", 0))
        _LOGGER.debug("  EV need: %.2f kWh", balance.get("ev_need", 0))
        _LOGGER.debug("  Total deficit: %.2f kWh", result.total_deficit)
        _LOGGER.debug("  Cycle cost: %.4f EUR/kWh", result.cycle_cost)
        _LOGGER.debug("  Skip night charge: %s", result.skip_night_charge)

        # Calculate effective prices (including cycle cost)
        effective_prices = []
        for price in buy_prices:
            hours_from_now = self._hours_from_now(price)
            if 0 <= hours_from_now < hours_ahead:
                effective_prices.append({
                    **price,
                    "effective_price": price.get("value", 0) + result.cycle_cost,
                    "hours_from_now": hours_from_now,
                })

        # Sort by effective price
        effective_prices.sort(key=lambda x: x["effective_price"])

        # Calculate hours needed for charging
        battery_power, ev_power = self._get_effective_charge_power()
        total_charge_power = battery_power + ev_power

        if total_charge_power > 0:
            hours_needed = ceil(result.total_deficit / total_charge_power)
        else:
            hours_needed = 0

        _LOGGER.debug("Charging calculation:")
        _LOGGER.debug("  Battery charge power: %.1f kW", battery_power)
        _LOGGER.debug("  EV charge power: %.1f kW", ev_power)
        _LOGGER.debug("  Total charge power: %.1f kW", total_charge_power)
        _LOGGER.debug("  Hours needed: %d", hours_needed)
        _LOGGER.debug("  Available price slots: %d", len(effective_prices))

        # Skip night charge hours if PV is sufficient (unless emergency)
        if result.skip_night_charge and not result.emergency_charge:
            # Filter out night hours (22:00-06:00)
            effective_prices = [
                p for p in effective_prices
                if not (p.get("hour", 0) >= 22 or p.get("hour", 0) < 6)
            ]

        # Select cheapest hours for charging (exclude emergency hours already added)
        emergency_keys = {
            (h["date"], h["hour"]) for h in result.charge_hours
        }
        for price in effective_prices[:hours_needed]:
            key = (price["date"], price["hour"])
            if key not in emergency_keys:
                result.charge_hours.append(price)

        # Determine discharge hours
        # Key insight: We can only discharge what we have or will charge
        # Available energy for discharge = charge_energy + current_usable - consumption_during_discharge
        if effective_prices:
            min_buy_price = effective_prices[0]["effective_price"]
            discharge_threshold = min_buy_price + 2 * result.cycle_cost

            charge_keys = {(h["date"], h["hour"]) for h in result.charge_hours}

            # Calculate energy available for arbitrage (sell back to grid)
            # Energy we'll charge during charge hours
            charge_energy = len(result.charge_hours) * self.battery_max_charge_power

            # Current usable battery (above min SOC)
            current_soc = self._get_battery_soc() or 50.0
            usable_capacity = self.battery_capacity * (1 - self.battery_min_soc / 100)
            current_usable = self.battery_capacity * (current_soc - self.battery_min_soc) / 100
            current_usable = max(0, current_usable)

            # Total energy available for discharge (capped by usable capacity)
            total_discharge_available = min(charge_energy + current_usable, usable_capacity)

            # Use configured discharge power
            discharge_power = self.battery_max_discharge_power

            # Max discharge hours based on available energy
            max_discharge_hours = int(total_discharge_available / discharge_power) if discharge_power > 0 else 0

            _LOGGER.debug("Discharge calculation:")
            _LOGGER.debug("  Charge energy planned: %.1f kWh", charge_energy)
            _LOGGER.debug("  Current usable battery: %.1f kWh", current_usable)
            _LOGGER.debug("  Total available for discharge: %.1f kWh", total_discharge_available)
            _LOGGER.debug("  Discharge power: %.1f kW", discharge_power)
            _LOGGER.debug("  Max discharge hours: %d", max_discharge_hours)
            _LOGGER.debug("  Discharge threshold: %.4f", discharge_threshold)

            # Collect all potential discharge hours with their profitability
            potential_discharge = []
            for sell in sell_prices:
                sell_value = sell.get("value", 0)
                sell_key = (sell["date"], sell["hour"])
                hours_from_now = self._hours_from_now(sell)

                # Check PV for this hour
                pv_for_hour = sum(
                    p["kwh"] for p in pv_forecast
                    if p["date"] == sell["date"] and p["hour"] == sell["hour"]
                )

                # Discharge only if:
                # - Price above threshold (profitable after cycle cost)
                # - Not a charge hour
                # - No significant PV (use solar mode instead)
                # - Within planning horizon
                if (
                    sell_value > discharge_threshold
                    and sell_key not in charge_keys
                    and pv_for_hour < 0.1
                    and 0 <= hours_from_now < hours_ahead
                ):
                    # Calculate profit per hour
                    profit = sell_value - min_buy_price - 2 * result.cycle_cost
                    potential_discharge.append({
                        **sell,
                        "profit": profit,
                        "hours_from_now": hours_from_now,
                    })

            # Sort by profit (most profitable first) and limit to max_discharge_hours
            potential_discharge.sort(key=lambda x: x["profit"], reverse=True)
            result.discharge_hours = potential_discharge[:max_discharge_hours]

            _LOGGER.debug("  Selected %d discharge hours from %d candidates",
                         len(result.discharge_hours), len(potential_discharge))

        # Determine solar-only hours
        for pv in pv_forecast:
            if pv["kwh"] > 0.1:
                pv_key = (pv["date"], pv["hour"])
                charge_keys = {(h["date"], h["hour"]) for h in result.charge_hours}
                discharge_keys = {(h["date"], h["hour"]) for h in result.discharge_hours}

                if pv_key not in charge_keys and pv_key not in discharge_keys:
                    result.solar_hours.append({
                        "date": pv["date"],
                        "hour": pv["hour"],
                        "pv_kwh": pv["kwh"],
                    })

        # Log final results
        _LOGGER.debug("=" * 60)
        _LOGGER.debug("OPTIMIZATION RESULTS")
        _LOGGER.debug("=" * 60)
        _LOGGER.debug("Charge hours (%d):", len(result.charge_hours))
        for ch in sorted(result.charge_hours, key=lambda x: (x.get("date", ""), x.get("hour", 0))):
            _LOGGER.debug("  %s %02d:00 - price: %.4f, effective: %.4f",
                        ch.get("date", "?"), ch.get("hour", 0),
                        ch.get("value", 0), ch.get("effective_price", ch.get("value", 0)))
        _LOGGER.debug("Discharge hours (%d):", len(result.discharge_hours))
        for dh in sorted(result.discharge_hours, key=lambda x: (x.get("date", ""), x.get("hour", 0))):
            _LOGGER.debug("  %s %02d:00 - sell price: %.4f",
                        dh.get("date", "?"), dh.get("hour", 0), dh.get("value", 0))
        _LOGGER.debug("Solar hours (%d):", len(result.solar_hours))
        for sh in sorted(result.solar_hours, key=lambda x: (x.get("date", ""), x.get("hour", 0))):
            _LOGGER.debug("  %s %02d:00 - PV: %.2f kWh",
                        sh.get("date", "?"), sh.get("hour", 0), sh.get("pv_kwh", 0))
        if result.warnings:
            _LOGGER.debug("Warnings:")
            for w in result.warnings:
                _LOGGER.debug("  ⚠️ %s", w)
        _LOGGER.debug("=" * 60)

        return result

    def select_charge_mode(self) -> str:
        """Select appropriate charge mode based on current state.

        Logic:
        - If EV not enabled -> mode_charge_battery
        - If EV enabled:
            - EV connected + battery not full -> mode_charge_ev_and_battery
            - EV connected + battery full -> mode_charge_ev
            - EV not connected -> mode_charge_battery
        """
        if not self.ev_enabled:
            return self.mode_charge_battery

        battery_soc = self._get_battery_soc() or 0.0
        battery_full = battery_soc >= 100

        if self._is_ev_connected():
            if battery_full:
                return self.mode_charge_ev
            else:
                return self.mode_charge_ev_and_battery
        else:
            return self.mode_charge_battery

    def get_mode_for_action(self, action: str) -> str:
        """Get the inverter mode for a given action.

        Args:
            action: Action type (CHARGE, sell, solar_only, etc.)

        Returns:
            Inverter mode string
        """
        if action == ACTION_CHARGE:
            return self.select_charge_mode()
        elif action == "sell" or action == self.mode_sell:
            return self.mode_sell
        elif action == "solar_only" or action == self.mode_sell_solar_only:
            return self.mode_sell_solar_only
        elif action == "grid_only" or action == self.mode_grid_only:
            return self.mode_grid_only
        else:
            return action  # Return as-is if already a mode
