"""Energy Optimizer for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    ACTION_CHARGE,
    CONF_AVG_CONSUMPTION,
    CONF_BATTERY_CAPACITY,
    CONF_BATTERY_COST,
    CONF_BATTERY_CYCLES,
    CONF_BATTERY_MAX_CHARGE_POWER,
    CONF_BATTERY_MAX_DISCHARGE_POWER,
    CONF_BATTERY_MIN_SOC,
    CONF_BATTERY_SOC_SENSOR,
    CONF_CURRENCY,
    CONF_EV_BATTERY_CAPACITY,
    CONF_EV_CONNECTED_SENSOR,
    CONF_EV_ENABLED,
    CONF_EV_MAX_CHARGE_POWER,
    CONF_EV_READY_BY,
    CONF_EV_SOC_SENSOR,
    CONF_EV_TARGET_SOC,
    CONF_MAX_GRID_POWER,
    CONF_MIN_DISCHARGE_ENERGY,
    CONF_MIN_SELL_PRICE,
    CONF_MODE_CHARGE_BATTERY,
    CONF_MODE_CHARGE_EV,
    CONF_MODE_CHARGE_EV_AND_BATTERY,
    CONF_MODE_GRID_ONLY,
    CONF_MODE_SELF_CONSUME,
    CONF_MODE_SELL,
    CONF_MODE_SELL_SOLAR_ONLY,
    CONF_OPTIMIZE_INTERVAL,
    CONF_PRIORITY_EV_HIGH_THRESHOLD,
    CONF_PRIORITY_HOME_HIGH_THRESHOLD,
    CONF_PRIORITY_HOME_LOW_THRESHOLD,
    CONF_PV_CONFIDENCE_FACTOR,
    CONF_PV_FORECAST_SENSOR,
    CONF_PV_FORECAST_TOMORROW_SENSOR,
    DEFAULT_AVG_CONSUMPTION,
    DEFAULT_BATTERY_MIN_SOC,
    DEFAULT_CURRENCY,
    DEFAULT_EV_TARGET_SOC,
    DEFAULT_MAX_GRID_POWER,
    DEFAULT_MIN_DISCHARGE_ENERGY,
    DEFAULT_MIN_SELL_PRICE,
    DEFAULT_PV_CONFIDENCE_FACTOR,
    DEFAULT_PRIORITY_EV_HIGH,
    DEFAULT_PRIORITY_HOME_HIGH,
    DEFAULT_PRIORITY_HOME_LOW,
)
from .consumption_history import ConsumptionProfileManager
from .dp_engine import DPConfig, hours_from_now, run_unified_dp
from .pv_forecast import PVForecastParser, baseline_kwh

_LOGGER = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """Result of energy optimization."""

    charge_hours: list[dict[str, Any]] = field(default_factory=list)
    discharge_hours: list[dict[str, Any]] = field(default_factory=list)
    idle_hours: list[dict[str, Any]] = field(default_factory=list)
    solar_hours: list[dict[str, Any]] = field(default_factory=list)
    self_consume_first_hours: list[dict[str, Any]] = field(default_factory=list)
    self_consume_only_hours: list[dict[str, Any]] = field(default_factory=list)
    pv_charge_hours: list[dict[str, Any]] = field(default_factory=list)
    paid_import_hours: list[dict[str, Any]] = field(default_factory=list)
    ev_urgent_charge: bool = False
    ev_urgent_reason: str = ""
    total_deficit: float = 0.0
    cycle_cost: float = 0.0
    gross_discharge_margin: float = 0.0
    net_plan_profit: float = 0.0
    estimated_profit: float = 0.0
    warnings: list[str] = field(default_factory=list)


class EnergyOptimizer:
    """Energy optimization engine."""

    # Noise floor for demoting a micro-export DIS slot to SCF: home-supply
    # below this is treated as not worth preserving, and the slot is dropped.
    SCF_DEMOTE_HOME_MIN_KWH = 0.10

    def __init__(
        self,
        hass: HomeAssistant,
        config: dict[str, Any],
        price_data_callback: callable,
        consumption_profile: ConsumptionProfileManager | None = None,
        pv_dynamic_callback: callable | None = None,
    ) -> None:
        """Initialize the optimizer.

        Args:
            hass: Home Assistant instance
            config: Configuration dictionary with optimizer settings
            price_data_callback: Callback to get current price data
            consumption_profile: Consumption profile manager for hourly estimates
            pv_dynamic_callback: Callable returning the latest dynamic PV data
                snapshot (factor + flags). Computed in the coordinator so the
                async recorder access stays out of the sync optimizer path.
        """
        self.hass = hass
        self._config = config
        self._get_price_data = price_data_callback
        self._get_pv_dynamic = pv_dynamic_callback
        self._consumption_profile = consumption_profile or ConsumptionProfileManager(
            hass, None, config.get(CONF_AVG_CONSUMPTION, DEFAULT_AVG_CONSUMPTION),
        )
        self._pv_parser = PVForecastParser(
            hass,
            config.get(CONF_PV_FORECAST_SENSOR),
            config.get(CONF_PV_FORECAST_TOMORROW_SENSOR),
        )

    # === Configuration Properties ===

    @property
    def battery_capacity(self) -> float:
        """Return battery capacity in kWh."""
        return self._config.get(CONF_BATTERY_CAPACITY, 0.0)

    @property
    def battery_min_soc(self) -> int:
        """Return minimum battery SOC in percent."""
        return int(self._config.get(CONF_BATTERY_MIN_SOC, DEFAULT_BATTERY_MIN_SOC))

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
        return int(self._config.get(CONF_BATTERY_CYCLES, 6000))

    @property
    def avg_consumption(self) -> float:
        """Return average consumption in kW."""
        return self._config.get(CONF_AVG_CONSUMPTION, DEFAULT_AVG_CONSUMPTION)

    @property
    def currency(self) -> str:
        """Return configured currency symbol/code."""
        return self._config.get(CONF_CURRENCY, DEFAULT_CURRENCY)

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
        return int(self._config.get(CONF_EV_TARGET_SOC, DEFAULT_EV_TARGET_SOC))

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

    @property
    def mode_self_consume(self) -> str:
        """Return self-consume mode."""
        return self._config.get(CONF_MODE_SELF_CONSUME, "")

    @property
    def min_sell_price(self) -> float:
        """Return minimum sell price threshold."""
        return self._config.get(CONF_MIN_SELL_PRICE, DEFAULT_MIN_SELL_PRICE)

    @property
    def min_discharge_energy(self) -> float:
        """Return minimum discharge energy per slot in kWh."""
        return self._config.get(CONF_MIN_DISCHARGE_ENERGY, DEFAULT_MIN_DISCHARGE_ENERGY)

    @property
    def pv_confidence_factor(self) -> float:
        """Return static PV forecast confidence slider (0.0-1.0).

        Acts as a manual multiplier applied on top of the probabilistic
        baseline and intra-day dynamic correction. Default 100% = pass-through.
        """
        pct = self._config.get(CONF_PV_CONFIDENCE_FACTOR, DEFAULT_PV_CONFIDENCE_FACTOR)
        return pct / 100.0

    def _today_dynamic_factor(self) -> float:
        """Return current intra-day correction factor, or 1.0 when inactive."""
        if not self._get_pv_dynamic:
            return 1.0
        try:
            data = self._get_pv_dynamic() or {}
        except Exception:  # noqa: BLE001
            return 1.0
        if not data.get("active"):
            return 1.0
        return float(data.get("factor", 1.0))

    def _get_effective_pv_forecast(
        self, hours_ahead: int = 48,
    ) -> list[dict[str, Any]]:
        """Return forecast list with `kwh` mutated to effective baseline.

        Effective value per slot:
            baseline (P10/P50 blend) * today_factor (today only) * slider

        Non-Solcast providers fall back to raw `kwh` as baseline. today_factor
        is applied only to entries with date == today and hour >= current hour.
        """
        forecast = self._pv_parser.get_hourly_forecast(hours_ahead)
        if not forecast:
            return forecast
        slider = self.pv_confidence_factor
        today_factor = self._today_dynamic_factor()
        now = dt_util.now()
        today_str = now.strftime("%Y-%m-%d")
        current_hour = now.hour
        for entry in forecast:
            base = baseline_kwh(entry)
            apply_today = (
                today_factor != 1.0
                and entry.get("date") == today_str
                and entry.get("hour", -1) >= current_hour
            )
            multiplier = today_factor if apply_today else 1.0
            entry["kwh"] = base * multiplier * slider
        return forecast

    def _get_effective_pv_sum(self, hours_ahead: int) -> float:
        """Sum effective PV expected within the given horizon from now."""
        forecast = self._get_effective_pv_forecast(hours_ahead)
        if not forecast:
            return 0.0
        now = dt_util.now()
        horizon_end = now + timedelta(hours=hours_ahead)
        total = 0.0
        for entry in forecast:
            try:
                entry_dt = datetime.strptime(
                    f"{entry['date']} {entry['hour']}:00", "%Y-%m-%d %H:%M",
                ).replace(tzinfo=now.tzinfo)
                if now <= entry_dt < horizon_end:
                    total += entry.get("kwh", 0.0)
            except (KeyError, ValueError):
                continue
        return total

    @property
    def priority_home_low_threshold(self) -> int:
        """Return home battery 'critically low' SOC threshold."""
        return int(self._config.get(CONF_PRIORITY_HOME_LOW_THRESHOLD, DEFAULT_PRIORITY_HOME_LOW))

    @property
    def priority_home_high_threshold(self) -> int:
        """Return home battery 'sufficient' SOC threshold."""
        return int(self._config.get(CONF_PRIORITY_HOME_HIGH_THRESHOLD, DEFAULT_PRIORITY_HOME_HIGH))

    @property
    def priority_ev_high_threshold(self) -> int:
        """Return EV 'sufficient' SOC threshold."""
        return self._config.get(CONF_PRIORITY_EV_HIGH_THRESHOLD, DEFAULT_PRIORITY_EV_HIGH)

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

    def _calculate_profit_metrics(self, result: OptimizationResult) -> None:
        """Calculate both debug and user-facing profit metrics for the final plan."""
        gross_discharge_margin = 0.0
        net_plan_profit = 0.0

        for discharge in result.discharge_hours:
            energy = discharge.get("planned_energy_kwh", 0.0)
            sell_price = discharge.get("value", 0.0)
            gross_discharge_margin += max(0.0, sell_price - result.cycle_cost) * energy
            net_plan_profit += (sell_price - result.cycle_cost) * energy

        for charge in result.charge_hours:
            energy = charge.get("planned_energy_kwh")
            if energy is None:
                continue
            buy_price = charge.get("value", 0.0)
            net_plan_profit -= (buy_price + result.cycle_cost) * energy

        # Paid import: revenue from being paid to consume during buy<0 hours
        for pi in result.paid_import_hours:
            buy_price = pi.get("buy_price", 0.0)
            cons = pi.get("planned_grid_import_kwh", 0.0)
            net_plan_profit += -buy_price * cons

        result.gross_discharge_margin = gross_discharge_margin
        result.net_plan_profit = net_plan_profit
        # Backward-compatible field used by the UI/API today.
        result.estimated_profit = net_plan_profit

    def calculate_energy_balance(self, hours_ahead: int = 36) -> dict[str, float]:
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

        # Expected consumption (from profile or fallback)
        now = dt_util.now()
        consumption = self._consumption_profile.get_consumption_for_range(now, hours_ahead)

        # Solar production forecast (probabilistic baseline + today_factor + slider)
        solar_production = self._get_effective_pv_sum(hours_ahead)

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

        if ev_energy_needed <= 0:
            return {"feasible": True}

        hours_needed = ev_energy_needed / self.ev_max_charge_power if self.ev_max_charge_power > 0 else float("inf")

        if hours_needed > hours_available:
            return {
                "feasible": False,
                "urgent": True,
                "reason": f"EV needs {hours_needed:.1f}h, only {hours_available:.1f}h available",
            }

        return {"feasible": True}

    def _build_hourly_market_slots(
        self,
        buy_prices: list[dict[str, Any]],
        sell_prices: list[dict[str, Any]],
        pv_forecast: list[dict[str, Any]],
        hours_ahead: int,
        ev_requirements: dict[tuple[str, int], float] | None = None,
    ) -> list[dict[str, Any]]:
        """Build a chronological hourly horizon for sequential battery planning."""
        now = dt_util.now()
        slot_keys: set[tuple[str, int]] = set()
        ev_requirements = ev_requirements or {}
        buy_lookup = {
            (p["date"], p["hour"]): p for p in buy_prices
            if -1 < hours_from_now(p) < hours_ahead
        }
        sell_lookup = {
            (p["date"], p["hour"]): p for p in sell_prices
            if -1 < hours_from_now(p) < hours_ahead
        }
        pv_lookup = {
            (p["date"], p["hour"]): p.get("kwh", 0.0) for p in pv_forecast
            if -1 < hours_from_now(p) < hours_ahead
        }
        slot_keys.update(buy_lookup.keys())
        slot_keys.update(sell_lookup.keys())

        slots: list[dict[str, Any]] = []
        for date, hour in sorted(slot_keys):
            slot_dt = datetime.strptime(
                f"{date} {hour}:00", "%Y-%m-%d %H:%M"
            ).replace(tzinfo=now.tzinfo)
            slots.append({
                "date": date,
                "hour": hour,
                "dt": slot_dt,
                "buy_price": buy_lookup.get((date, hour), {}).get("value", 0.0),
                "sell_price": sell_lookup.get((date, hour), {}).get("value", 0.0),
                "pv_kwh": pv_lookup.get((date, hour), 0.0),
                "consumption_kwh": self._consumption_profile.get_consumption_for_hour(slot_dt),
                "ev_kwh": ev_requirements.get((date, hour), 0.0),
            })

        return slots

    def _get_ev_peak_sell_requirements(
        self,
        buy_prices: list[dict[str, Any]],
        hours_ahead: int,
    ) -> tuple[dict[tuple[str, int], float], dict[str, Any]]:
        """Reserve EV charging demand for peak-sell planning when EV is enabled."""
        stats = {
            "enabled": self.ev_enabled,
            "connected": self._is_ev_connected(),
            "energy_needed_kwh": 0.0,
            "hours_reserved": 0,
            "ready_by": None,
            "effective_ev_power": 0.0,
        }
        if not self.ev_enabled or not self._is_ev_connected():
            return {}, stats

        ev_soc = self._get_ev_soc() or 0.0
        ev_energy_needed = self.ev_battery_capacity * (self.ev_target_soc - ev_soc) / 100
        ev_energy_needed = max(0.0, ev_energy_needed)
        stats["energy_needed_kwh"] = round(ev_energy_needed, 2)
        if ev_energy_needed <= 0 or not self.ev_ready_by:
            return {}, stats

        now = dt_util.now()
        ready_by = datetime.combine(now.date(), self.ev_ready_by).replace(tzinfo=now.tzinfo)
        if ready_by <= now:
            ready_by += timedelta(days=1)

        stats["ready_by"] = ready_by.strftime("%Y-%m-%d %H:%M")

        effective_ev_power = self.ev_max_charge_power
        if self.max_grid_power > 0:
            effective_ev_power = min(effective_ev_power, self.max_grid_power)
        stats["effective_ev_power"] = round(effective_ev_power, 2)

        if effective_ev_power <= 0:
            return {}, stats

        candidate_slots: list[dict[str, Any]] = []
        for price in buy_prices:
            hfn = hours_from_now(price)
            if not (-1 < hfn < hours_ahead):
                continue
            slot_time = datetime.strptime(
                f"{price['date']} {price['hour']}:00", "%Y-%m-%d %H:%M"
            ).replace(tzinfo=now.tzinfo)
            if slot_time > ready_by:
                continue
            candidate_slots.append({
                "date": price["date"],
                "hour": price["hour"],
                "dt": slot_time,
                "buy_price": price.get("value", 0.0),
            })

        candidate_slots.sort(key=lambda x: (x["buy_price"], x["dt"]))

        requirements: dict[tuple[str, int], float] = {}
        remaining_need = ev_energy_needed
        for slot in candidate_slots:
            if remaining_need <= 0:
                break
            slot_energy = min(effective_ev_power, remaining_need)
            requirements[(slot["date"], slot["hour"])] = round(slot_energy, 2)
            remaining_need -= slot_energy

        stats["hours_reserved"] = len(requirements)
        stats["remaining_unplanned_kwh"] = round(max(0.0, remaining_need), 2)
        return requirements, stats

    def optimize(self, hours_ahead: int = 36) -> OptimizationResult:
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
        _LOGGER.debug("  Battery cost: %.0f %s, cycles: %d", self.battery_cost, self.currency, self.battery_cycles)
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
            # Skip when buy < 0 — sell is normally floored at 0 in negative-price
            # markets, so sell > buy is expected, not an anomaly.
            if (
                sell
                and buy.get("value", 0) > 0
                and sell.get("value", 0) > buy.get("value", 0)
            ):
                result.warnings.append(
                    f"Price anomaly at {buy['date']} {buy['hour']}:00 - sell > buy"
                )

        # Get effective PV forecast (probabilistic baseline + today_factor + slider applied in-place)
        pv_forecast = self._get_effective_pv_forecast(hours_ahead)
        # Sum PV only within optimization horizon for accurate logging
        now = dt_util.now()
        horizon_end = now + timedelta(hours=hours_ahead)
        total_pv = 0.0
        if pv_forecast:
            for p in pv_forecast:
                try:
                    entry_dt = datetime.strptime(f"{p['date']} {p['hour']}:00", "%Y-%m-%d %H:%M")
                    entry_dt = entry_dt.replace(tzinfo=now.tzinfo)
                    if now <= entry_dt < horizon_end:
                        total_pv += p.get("kwh", 0)
                except (KeyError, ValueError):
                    pass
        today_factor = self._today_dynamic_factor()
        _LOGGER.debug("PV Forecast:")
        _LOGGER.debug("  Forecast hours: %d", len(pv_forecast) if pv_forecast else 0)
        _LOGGER.debug("  Static slider: %d%%", round(self.pv_confidence_factor * 100))
        _LOGGER.debug("  Today dynamic factor: %.2f", today_factor)
        _LOGGER.debug("  Total PV expected (effective, %dh horizon): %.2f kWh", hours_ahead, total_pv)
        if pv_forecast:
            for pv in pv_forecast[:6]:  # Log first 6 hours
                _LOGGER.debug("    %s %02d:00 - %.2f kWh",
                             pv.get("date", "?"), pv.get("hour", 0), pv.get("kwh", 0))

        # Critically-low battery is handled by the DP via min_end_usable
        # reserve and the natural cycle-cost weighted optimization — no
        # separate emergency-charge path is needed. Surface a warning for
        # diagnostics but don't add slots.
        battery_soc = self._get_battery_soc() or 0.0
        if battery_soc < self.battery_min_soc:
            _LOGGER.warning(
                "Battery SOC %.0f%% is below configured min %d%% — DP will plan "
                "grid imports for consumption until the next cheap charging window",
                battery_soc, self.battery_min_soc,
            )

        # Check EV charging feasibility
        ev_feasibility = self.check_ev_charging_feasibility()
        if not ev_feasibility.get("feasible"):
            result.ev_urgent_charge = True
            result.ev_urgent_reason = ev_feasibility.get("reason", "")
            result.warnings.append(f"EV urgent charge: {result.ev_urgent_reason}")

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
        _LOGGER.debug("  Cycle cost: %.4f %s/kWh", result.cycle_cost, self.currency)

        # Calculate global min buy price for terminal value
        horizon_buy = [
            p.get("value", float("inf"))
            for p in buy_prices
            if -1 < hours_from_now(p) < hours_ahead
        ]
        global_min_buy_price = (min(horizon_buy) + result.cycle_cost) if horizon_buy else 0
        # Negative-price charging is now decided inside the DP (GRID_CHARGE is
        # allowed even with PV surplus, so the optimizer naturally drains the
        # battery beforehand and refills it from paid grid hours).

        requested_energy_reserve = 0.0
        energy_reserve_needed = 0.0
        post_dp_hours = 0
        reserve_target = "n/a"

        # === Unified DP: decide GRID_CHARGE / PV_CHARGE / SOL / DIS for every hour ===
        if horizon_buy:
            current_soc = self._get_battery_soc() or 50.0
            usable_capacity = self.battery_capacity * (1 - self.battery_min_soc / 100)
            current_usable = self.battery_capacity * (current_soc - self.battery_min_soc) / 100
            current_usable = max(0, current_usable)

            now = dt_util.now()

            # EV requirements for DP
            ev_requirements, ev_stats = self._get_ev_peak_sell_requirements(buy_prices, hours_ahead)
            hourly_slots = self._build_hourly_market_slots(
                buy_prices, sell_prices, pv_forecast, hours_ahead, ev_requirements,
            )

            # Calculate reserve: consumption from end of DP horizon to next charging opportunity
            # (morning PV production or next cheap grid hour — whichever comes first)
            reserve_target = "unknown"
            if hourly_slots:
                last_slot_dt = hourly_slots[-1]["dt"] + timedelta(hours=1)

                # Find next morning PV start (first hour with PV >= 0.5 kWh after DP horizon)
                next_pv_start = None
                if pv_forecast:
                    for p in pv_forecast:
                        try:
                            pv_dt = datetime.strptime(
                                f"{p['date']} {p['hour']}:00", "%Y-%m-%d %H:%M"
                            ).replace(tzinfo=last_slot_dt.tzinfo)
                            if pv_dt > last_slot_dt and p.get("kwh", 0) >= 0.5:
                                next_pv_start = pv_dt
                                break
                        except (KeyError, ValueError):
                            pass

                # Fallback: nearest next 8:00 AM if no PV data available
                if next_pv_start is None:
                    next_pv_start = last_slot_dt.replace(
                        hour=8, minute=0, second=0, microsecond=0,
                    )
                    if next_pv_start <= last_slot_dt:
                        next_pv_start += timedelta(days=1)
                    reserve_target = f"fallback 08:00"
                else:
                    reserve_target = f"PV start {next_pv_start.strftime('%H:%M')}"

                post_dp_hours = max(0, (next_pv_start - last_slot_dt).total_seconds() / 3600)
                requested_energy_reserve = self._consumption_profile.get_consumption_for_range(
                    last_slot_dt, int(post_dp_hours),
                )
                energy_reserve_needed = min(requested_energy_reserve, usable_capacity)
                if requested_energy_reserve > usable_capacity + 0.01:
                    warning = (
                        f"Reserve request {requested_energy_reserve:.1f} kWh exceeds usable "
                        f"battery capacity {usable_capacity:.1f} kWh; capping reserve target"
                    )
                    result.warnings.append(warning)
                    _LOGGER.warning("%s", warning)

            _LOGGER.debug("Unified DP setup:")
            _LOGGER.debug("  Slots: %d, current usable: %.2f kWh", len(hourly_slots), current_usable)
            _LOGGER.debug(
                "  Reserve: %.1f kWh requested, %.1f kWh effective (%d hours to %s)",
                requested_energy_reserve, energy_reserve_needed, int(post_dp_hours), reserve_target,
            )

            terminal_value_per_kwh = max(self.min_sell_price, global_min_buy_price)
            # Run unified DP
            dp_config = DPConfig(
                min_sell_price=self.min_sell_price,
                battery_max_discharge_power=self.battery_max_discharge_power,
                battery_max_charge_power=self.battery_max_charge_power,
                battery_min_soc=self.battery_min_soc,
                battery_capacity=self.battery_capacity,
            )
            (
                dp_charge,
                result.discharge_hours,
                result.pv_charge_hours,
                dp_self_consume,
                result.paid_import_hours,
                dp_stats,
            ) = run_unified_dp(
                slots=hourly_slots,
                current_usable=current_usable,
                usable_capacity=usable_capacity,
                cycle_cost=result.cycle_cost,
                terminal_value_per_kwh=terminal_value_per_kwh,
                min_end_usable=energy_reserve_needed,
                config=dp_config,
            )

            # Merge DP charge hours with emergency charge hours
            existing_charge_keys = {(h["date"], h["hour"]) for h in result.charge_hours}
            for ch in dp_charge:
                if (ch["date"], ch["hour"]) not in existing_charge_keys:
                    result.charge_hours.append(ch)

            # Split DP self-consume into FIRST (Default mode) and ONLY (Self-Consume mode)
            for sc in dp_self_consume:
                if sc.get("sell_price", 0) < self.min_sell_price:
                    result.self_consume_only_hours.append(sc)
                else:
                    result.self_consume_first_hours.append(sc)

            max_discharge_hours = len(result.discharge_hours)

            _LOGGER.debug(
                "  DP result: slots=%d CHG=%d DIS=%d PVC=%d SC=%d PIM=%d battOut=%.2f export=%.2f gridChg=%.2f paidImp=%.2f end=%.2f value=%.2f",
                dp_stats.get("slot_count", 0),
                len(dp_charge),
                len(result.discharge_hours),
                len(result.pv_charge_hours),
                len(dp_self_consume),
                len(result.paid_import_hours),
                dp_stats.get("planned_battery_discharge_kwh", 0.0),
                dp_stats.get("planned_export_kwh", 0.0),
                dp_stats.get("planned_grid_charge_kwh", 0.0),
                dp_stats.get("planned_paid_import_kwh", 0.0),
                dp_stats.get("end_usable_kwh", 0.0),
                dp_stats.get("best_value", 0.0),
            )
            _LOGGER.debug(
                "  EV reserve: enabled=%s connected=%s need=%.2f kWh ready_by=%s reserved=%d hours",
                ev_stats.get("enabled"),
                ev_stats.get("connected"),
                ev_stats.get("energy_needed_kwh", 0.0),
                ev_stats.get("ready_by"),
                ev_stats.get("hours_reserved", 0),
            )

            if dp_charge:
                _LOGGER.debug("  Grid charge plan:")
                for i, ch in enumerate(dp_charge, start=1):
                    _LOGGER.debug(
                        "    %d. %s %02d:00 - buy: %.4f, charge: %.2f kWh",
                        i, ch["date"], ch["hour"], ch.get("value", 0), ch.get("planned_energy_kwh", 0),
                    )

            if result.paid_import_hours:
                _LOGGER.debug("  Paid import plan (paid for consuming from grid):")
                for i, pi in enumerate(result.paid_import_hours, start=1):
                    _LOGGER.debug(
                        "    %d. %s %02d:00 - buy: %.4f, cons: %.2f kWh, revenue: %.4f %s",
                        i, pi["date"], pi["hour"], pi.get("buy_price", 0),
                        pi.get("planned_grid_import_kwh", 0),
                        pi.get("expected_revenue", 0), self.currency,
                    )

            if result.discharge_hours:
                _LOGGER.debug("  Discharge plan:")
                for i, dh in enumerate(result.discharge_hours, start=1):
                    _LOGGER.debug(
                        "    %d. %s %02d:00 - sell: %.4f, battery: %.2f kWh, to_grid: %.2f kWh, to_home: %.2f kWh, grid: %.2f kWh, SOC: %.2f%%",
                        i, dh["date"], dh["hour"], dh.get("value", 0),
                        dh.get("planned_battery_out_kwh", dh.get("planned_energy_kwh", 0)),
                        dh.get("planned_export_kwh", 0),
                        dh.get("planned_home_supply_kwh", 0),
                        dh.get("planned_grid_import_kwh", 0),
                        dh.get("soc_limit", self.battery_min_soc),
                    )

            if result.pv_charge_hours:
                _LOGGER.debug("  PV charge plan (Default mode):")
                for i, pvc in enumerate(result.pv_charge_hours, start=1):
                    _LOGGER.debug(
                        "    %d. %s %02d:00 - charge: %.2f kWh, pv: %.2f",
                        i, pvc["date"], pvc["hour"], pvc.get("charge_kwh", 0), pvc.get("pv_kwh", 0),
                    )

        # Filter micro-charges from DP (< min_discharge_energy threshold)
        if self.min_discharge_energy > 0 and result.charge_hours:
            filtered_charge = []
            for ch in result.charge_hours:
                if ch.get("planned_energy_kwh", 999) < self.min_discharge_energy:
                    _LOGGER.debug(
                        "Filtered micro-charge: %s %02d:00 - %.2f kWh < %.2f kWh threshold",
                        ch.get("date"), ch.get("hour", 0),
                        ch.get("planned_energy_kwh", 0), self.min_discharge_energy,
                    )
                else:
                    filtered_charge.append(ch)
            if len(filtered_charge) < len(result.charge_hours):
                removed = len(result.charge_hours) - len(filtered_charge)
                result.charge_hours = filtered_charge
                _LOGGER.info("Removed %d micro-charge slots (< %.1f kWh)", removed, self.min_discharge_energy)

        # Micro-EXPORT filter (not micro-total): the original filter rationale
        # was "tiny exports don't recover mode-switching / export overhead at
        # sell-price margins". The right input to that check is the planned
        # EXPORT portion of the slot, not its total energy — a slot dominated
        # by battery-to-home flow is valuable regardless of export size.
        #
        # Three branches:
        #   1. planned_export_kwh >= min_discharge_energy
        #      → keep as DIS (DP plan stays intact, including any home-supply)
        #   2. export < threshold AND home_supply >= SCF_DEMOTE_HOME_MIN_KWH
        #      → demote to self-consume; split SCF vs SCO by the same rule DP
        #        applies natively (sell_price < min_sell_price → SCO, else SCF)
        #   3. export < threshold AND home_supply too small
        #      → drop entirely; slot has nothing meaningful to contribute
        #
        # Filtering on export instead of total preserves DP's full optimum
        # when home-supply is the main component (the case that prompted this
        # change: morning hours with PV ≈ 0, where DP correctly plans a small
        # discharge to cover expensive home consumption with a tiny export
        # tail). Falls back to planned_energy_kwh if planned_export_kwh is
        # missing — robust across older result shapes.
        if self.min_discharge_energy > 0 and result.discharge_hours:
            filtered_discharge = []
            removed_count = 0
            demoted_count = 0
            for dh in result.discharge_hours:
                planned_total = dh.get("planned_energy_kwh", 0.0)
                planned_export = dh.get("planned_export_kwh", planned_total)
                if planned_export >= self.min_discharge_energy:
                    filtered_discharge.append(dh)
                    continue
                home_supply = dh.get("planned_home_supply_kwh", 0.0)
                if home_supply >= self.SCF_DEMOTE_HOME_MIN_KWH:
                    sell_price = dh.get("value", 0.0)
                    sc_entry = {
                        "date": dh.get("date"),
                        "hour": dh.get("hour"),
                        "sell_price": sell_price,
                        "buy_price": dh.get("buy_price", 0.0),
                        "pv_kwh": dh.get("pv_kwh", 0.0),
                        "consumption_kwh": dh.get("consumption_kwh", 0.0),
                        "planned_energy_kwh": round(home_supply, 2),
                        "expected_start_usable_kwh": dh.get("expected_start_usable_kwh"),
                        "expected_end_usable_kwh": dh.get("expected_end_usable_kwh"),
                    }
                    if sell_price < self.min_sell_price:
                        result.self_consume_only_hours.append(sc_entry)
                        sc_tier = "SCO"
                    else:
                        result.self_consume_first_hours.append(sc_entry)
                        sc_tier = "SCF"
                    demoted_count += 1
                    _LOGGER.debug(
                        "Demoted micro-export to %s: %s %02d:00 - "
                        "export=%.2f kWh < %.2f kWh, home_supply=%.2f kWh "
                        "preserved",
                        sc_tier, dh.get("date"), dh.get("hour", 0),
                        planned_export, self.min_discharge_energy, home_supply,
                    )
                else:
                    removed_count += 1
                    _LOGGER.debug(
                        "Filtered micro-export: %s %02d:00 - export=%.2f kWh, "
                        "home_supply=%.2f kWh both below thresholds",
                        dh.get("date"), dh.get("hour", 0),
                        planned_export, home_supply,
                    )
            if removed_count or demoted_count:
                result.discharge_hours = filtered_discharge
                if removed_count:
                    _LOGGER.info(
                        "Removed %d micro-export slots (< %.1f kWh export, "
                        "< %.2f kWh home-supply)",
                        removed_count, self.min_discharge_energy,
                        self.SCF_DEMOTE_HOME_MIN_KWH,
                    )
                if demoted_count:
                    _LOGGER.info(
                        "Demoted %d micro-export slots to self-consume "
                        "(home-supply >= %.2f kWh preserved)",
                        demoted_count, self.SCF_DEMOTE_HOME_MIN_KWH,
                    )

        self._calculate_profit_metrics(result)
        _LOGGER.debug(
            "Profit metrics: gross discharge margin=%.2f %s, net plan profit=%.2f %s",
            result.gross_discharge_margin, self.currency,
            result.net_plan_profit, self.currency,
        )

        # R6: Self-consume hours (sell unprofitable but PV available)
        # Covers: sell_price <= 0 OR 0 < sell_price < min_sell_price
        charge_keys = {(h["date"], h["hour"]) for h in result.charge_hours}
        discharge_keys = {(h["date"], h["hour"]) for h in result.discharge_hours}
        paid_import_keys = {(h["date"], h["hour"]) for h in result.paid_import_hours}
        for sell in sell_prices:
            sell_value = sell.get("value", 0)
            sell_key = (sell["date"], sell["hour"])
            hfn = hours_from_now(sell)

            pv_for_hour = sum(
                p["kwh"] for p in pv_forecast
                if p["date"] == sell["date"] and p["hour"] == sell["hour"]
            )

            if (
                sell_value < self.min_sell_price
                and pv_for_hour > 0.1
                and sell_key not in charge_keys
                and sell_key not in discharge_keys
                and sell_key not in paid_import_keys
                and -1 < hfn < hours_ahead
            ):
                result.self_consume_only_hours.append({
                    "date": sell["date"],
                    "hour": sell["hour"],
                    "sell_price": sell_value,
                    "pv_kwh": pv_for_hour,
                })

        # Determine solar-only hours (exclude charge, discharge, pv_charge,
        # self_consume, and paid-import hours)
        pv_charge_keys = {(h["date"], h["hour"]) for h in result.pv_charge_hours}
        sc_keys = {(h["date"], h["hour"]) for h in result.self_consume_first_hours}
        sc_keys |= {(h["date"], h["hour"]) for h in result.self_consume_only_hours}
        for pv in pv_forecast:
            if pv["kwh"] > 0.1:
                pv_key = (pv["date"], pv["hour"])
                charge_keys = {(h["date"], h["hour"]) for h in result.charge_hours}
                discharge_keys = {(h["date"], h["hour"]) for h in result.discharge_hours}

                if (
                    pv_key not in charge_keys
                    and pv_key not in discharge_keys
                    and pv_key not in pv_charge_keys
                    and pv_key not in sc_keys
                    and pv_key not in paid_import_keys
                ):
                    result.solar_hours.append({
                        "date": pv["date"],
                        "hour": pv["hour"],
                        "pv_kwh": pv["kwh"],
                    })

        all_hours: dict[str, dict] = {}
        for p in buy_prices:
            key = f"{p['date']}_{p['hour']:02d}"
            hrs = hours_from_now(p)
            if -1 < hrs < hours_ahead:
                all_hours.setdefault(key, {"date": p["date"], "hour": p["hour"], "hrs": hrs})
                all_hours[key]["buy"] = p.get("value", 0)
        for s in sell_prices:
            key = f"{s['date']}_{s['hour']:02d}"
            if key in all_hours:
                all_hours[key]["sell"] = s.get("value", 0)
        for pv in pv_forecast:
            key = f"{pv['date']}_{pv['hour']:02d}"
            if key in all_hours:
                all_hours[key]["pv"] = pv.get("kwh", 0)
        now = dt_util.now()
        for key, h in all_hours.items():
            slot_dt = datetime.strptime(
                f"{h['date']} {h['hour']}:00", "%Y-%m-%d %H:%M"
            ).replace(tzinfo=now.tzinfo)
            h["cons"] = self._consumption_profile.get_consumption_for_hour(slot_dt)
            h["ev_cons"] = self._consumption_profile.get_ev_consumption_for_hour(slot_dt)

        idle_keys = set(all_hours.keys())
        for hours_list in (
            result.charge_hours,
            result.discharge_hours,
            result.solar_hours,
            result.pv_charge_hours,
            result.self_consume_first_hours,
            result.self_consume_only_hours,
            result.paid_import_hours,
        ):
            for entry in hours_list:
                idle_keys.discard(f"{entry['date']}_{entry['hour']:02d}")
        result.idle_hours = [
            {"date": all_hours[key]["date"], "hour": all_hours[key]["hour"]}
            for key in sorted(idle_keys)
        ]

        # === COMPACT DEBUG DUMP (all data for troubleshooting) ===
        _LOGGER.info("=== OPTIMIZATION DEBUG DUMP ===")

        # Config summary
        soc = self._get_battery_soc()
        _LOGGER.info(
            "CFG: cap=%.1fkWh minSOC=%d%% chrg=%.1fkW dis=%.1fkW cost=%d/%d cycleCost=%.4f SOC=%s%%",
            self.battery_capacity, self.battery_min_soc,
            self.battery_max_charge_power, self.battery_max_discharge_power,
            self.battery_cost, self.battery_cycles, result.cycle_cost,
            f"{soc:.0f}" if soc is not None else "N/A",
        )

        _LOGGER.info("PRICES (date hour | buy | sell | PV | cons | ev_cons | scheduled):")
        schedule_keys = {}
        for ch in result.charge_hours:
            schedule_keys[(ch.get("date"), ch.get("hour"))] = "CHG"
        for dh in result.discharge_hours:
            schedule_keys[(dh.get("date"), dh.get("hour"))] = "DIS"
        for sh in result.solar_hours:
            schedule_keys[(sh.get("date"), sh.get("hour"))] = "SOL"
        for pvc in result.pv_charge_hours:
            schedule_keys[(pvc.get("date"), pvc.get("hour"))] = "PVC"
        for sc in result.self_consume_first_hours:
            schedule_keys[(sc.get("date"), sc.get("hour"))] = "SCF"
        for sc in result.self_consume_only_hours:
            schedule_keys[(sc.get("date"), sc.get("hour"))] = "SCO"
        for pi in result.paid_import_hours:
            schedule_keys[(pi.get("date"), pi.get("hour"))] = "PIM"
        for idle in result.idle_hours:
            schedule_keys[(idle.get("date"), idle.get("hour"))] = "IDL"

        for key in sorted(all_hours.keys()):
            h = all_hours[key]
            sched = schedule_keys.get((h["date"], h["hour"]), "-")
            ev_c = h.get("ev_cons", 0)
            ev_str = f" | ev={ev_c:.2f}" if ev_c > 0.01 else ""
            _LOGGER.info(
                "  %s %02d:00 | buy=%.4f | sell=%.4f | pv=%.2f | cons=%.2f%s | %s",
                h["date"], h["hour"],
                h.get("buy", 0), h.get("sell", 0), h.get("pv", 0), h.get("cons", 0),
                ev_str, sched,
            )

        # Thresholds and decisions
        _LOGGER.info(
            "THRESHOLDS: globalMinBuy=%.4f minSellPrice=%.4f slider=%d%% todayFactor=%.2f minDisEnergy=%.1f",
            global_min_buy_price,
            self.min_sell_price,
            round(self.pv_confidence_factor * 100),
            self._today_dynamic_factor(),
            self.min_discharge_energy,
        )
        _LOGGER.info(
            "ENERGY: deficit=%.2f usable=%.2f reserveReq=%.2f reserveEff=%.2f maxDisHours=%d",
            result.total_deficit,
            self.battery_capacity * ((soc or 0) - self.battery_min_soc) / 100,
            requested_energy_reserve if horizon_buy else 0,
            energy_reserve_needed if horizon_buy else 0,
            max_discharge_hours if horizon_buy else 0,
        )

        # Result summary
        _LOGGER.info(
            "RESULT: charge=%d discharge=%d solar=%d pvCharge=%d scFirst=%d scOnly=%d paidImp=%d warnings=%d profit=%.2f",
            len(result.charge_hours), len(result.discharge_hours),
            len(result.solar_hours), len(result.pv_charge_hours),
            len(result.self_consume_first_hours), len(result.self_consume_only_hours),
            len(result.paid_import_hours),
            len(result.warnings), result.estimated_profit,
        )
        if result.warnings:
            for w in result.warnings:
                _LOGGER.info("  WARN: %s", w)
        _LOGGER.info("=== END DEBUG DUMP ===")

        return result

    def _check_ev_time_urgency(self) -> bool:
        """Check if EV charging is time-urgent (needs >50% of available time)."""
        if not self.ev_ready_by:
            return False
        now = dt_util.now()
        ready_by = datetime.combine(now.date(), self.ev_ready_by).replace(tzinfo=now.tzinfo)
        if ready_by <= now:
            ready_by += timedelta(days=1)
        hours_available = (ready_by - now).total_seconds() / 3600

        ev_soc = self._get_ev_soc() or 0.0
        energy_needed = self.ev_battery_capacity * (self.ev_target_soc - ev_soc) / 100
        energy_needed = max(0, energy_needed)
        if energy_needed <= 0:
            return False
        hours_needed = energy_needed / self.ev_max_charge_power if self.ev_max_charge_power > 0 else float("inf")

        return hours_needed > hours_available * 0.5

    def select_charge_mode(self) -> str:
        """Select charge mode with smart EV/battery priority (R2).

        Priority order:
        1. Home battery critically low (<home_low%) -> charge battery
        2. EV urgent (connected, low SOC, deadline close) -> charge EV
        3. Home battery mid-range, EV decent -> charge battery
        4. EV connected and needs charge -> charge both
        5. Default -> charge battery
        """
        if not self.ev_enabled:
            return self.mode_charge_battery

        battery_soc = self._get_battery_soc() or 0.0
        ev_soc = self._get_ev_soc() or 0.0
        ev_connected = self._is_ev_connected()

        home_low = self.priority_home_low_threshold
        home_high = self.priority_home_high_threshold
        ev_high = self.priority_ev_high_threshold

        # Priority 1: Home battery critically low
        if battery_soc < home_low:
            _LOGGER.debug("Charge priority: HOME (soc=%.0f%% < low=%d%%)", battery_soc, home_low)
            return self.mode_charge_battery

        # Priority 2: EV urgent
        if ev_connected and ev_soc < self.ev_target_soc and self._check_ev_time_urgency():
            _LOGGER.debug("Charge priority: EV URGENT (soc=%.0f%%, deadline close)", ev_soc)
            return self.mode_charge_ev

        # Priority 3: Home battery mid-range, EV has decent charge
        if battery_soc < home_high and ev_soc > ev_high:
            _LOGGER.debug("Charge priority: HOME (soc=%.0f%% < high=%d%%, ev=%.0f%% ok)",
                          battery_soc, home_high, ev_soc)
            return self.mode_charge_battery

        # Priority 4: EV connected and needs charge
        if ev_connected and ev_soc < self.ev_target_soc:
            _LOGGER.debug("Charge priority: BOTH (home=%.0f%%, ev=%.0f%%)", battery_soc, ev_soc)
            return self.mode_charge_ev_and_battery

        # Priority 5: Default
        _LOGGER.debug("Charge priority: HOME default (soc=%.0f%%)", battery_soc)
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
