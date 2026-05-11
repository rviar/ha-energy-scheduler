"""Schedule execution logic for HACS Energy Scheduler."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.helpers import condition
from homeassistant.util import dt as dt_util

from .const import (
    ACTION_CHARGE,
    ACTION_PAID_IMPORT,
    ACTION_PV_CHARGE,
    ACTION_SELF_CONSUME_FIRST,
    ACTION_SELF_CONSUME_ONLY,
    CONF_EV_MAX_CHARGE_AMPS,
    CONF_MIN_SELL_PRICE,
    DEFAULT_EV_MAX_CHARGE_AMPS,
    DEFAULT_MIN_SELL_PRICE,
)

_LOGGER = logging.getLogger(__name__)


class ScheduleExecutorMixin:
    """Mixin providing schedule execution and mode application for the coordinator."""

    def _get_idle_mode(self) -> str:
        """Return the neutral mode to use when no scheduled action is active."""
        return self._optimizer.mode_grid_only or self.default_mode

    async def _async_check_schedule(self, now: datetime) -> None:
        """Check and apply scheduled actions."""
        local_now = dt_util.as_local(now)

        if self._paused:
            _LOGGER.debug("Scheduler is paused, skipping schedule check")
            return

        current_date = local_now.strftime("%Y-%m-%d")
        current_hour = str(local_now.hour)
        current_minute = local_now.minute

        # SOC locks are keyed by (date, hour, plan_signature). Encoding the
        # plan into the key makes locks self-invalidate when the schedule
        # for the same hour is rewritten (e.g. mid-hour re-optimization with
        # a new soc_limit): the old key no longer matches the freshly built
        # one, so the prior "target completed" / "direction auto-detected"
        # state is silently abandoned and the new plan is evaluated from
        # scratch. Cleanup here only drops entries for non-current hours;
        # stale entries for the current hour age out via the same mechanism
        # the next time their plan_sig fails to match.
        def _key_belongs_to_current_hour(k) -> bool:
            return (
                isinstance(k, tuple) and len(k) >= 2
                and k[0] == current_date and k[1] == current_hour
            )

        if hasattr(self, "_locked_soc_types"):
            for k in [k for k in self._locked_soc_types if not _key_belongs_to_current_hour(k)]:
                del self._locked_soc_types[k]
        if hasattr(self, "_soc_target_completed"):
            for k in [k for k in self._soc_target_completed if not _key_belongs_to_current_hour(k)]:
                del self._soc_target_completed[k]

        # Sync current action with actual inverter state (handles external changes)
        actual_mode = self._get_current_inverter_mode()
        if actual_mode and self._current_action != actual_mode:
            _LOGGER.debug(
                "Inverter mode changed externally: %s -> %s",
                self._current_action, actual_mode
            )
            self._current_action = actual_mode

        # Get the schedule for this hour
        hour_schedule = self._storage.get_hour_schedule(current_date, current_hour)

        if hour_schedule:
            action = hour_schedule.get("action")
            soc_limit = hour_schedule.get("soc_limit")
            full_hour = hour_schedule.get("full_hour", False)
            minutes = hour_schedule.get("minutes")
            ev_charging = hour_schedule.get("ev_charging", False)

            if not action:
                return

            should_apply = True
            should_revert = False

            # Check EV stop condition if specified
            if ev_charging and self._is_ev_stop_condition_configured():
                stop_condition_met, reason = await self._async_check_ev_stop_condition()
                if stop_condition_met:
                    should_apply = False
                    should_revert = self._current_action == action
                    if should_revert:
                        _LOGGER.info(
                            "EV stop condition met (%s), reverting to default mode",
                            reason
                        )

            # Check SOC limit if specified (only if not EV charging mode)
            if soc_limit is not None and self.soc_sensor and not ev_charging:
                current_soc = self._get_current_soc()
                soc_limit_type = hour_schedule.get("soc_limit_type")
                # Content-keyed lock: every field that affects the SOC-check
                # decision is part of the key. A rewrite that changes any of
                # them produces a fresh key and the prior completion/direction
                # state stops applying.
                plan_sig = (
                    action,
                    soc_limit,
                    soc_limit_type,
                    full_hour,
                    minutes,
                    ev_charging,
                )
                schedule_key = (current_date, current_hour, plan_sig)

                # Initialize lock storage if needed
                if not hasattr(self, "_soc_target_completed"):
                    self._soc_target_completed = {}

                # Check if target was already completed this hour - skip entirely
                if self._soc_target_completed.get(schedule_key):
                    should_apply = False
                    _LOGGER.debug(
                        "SOC target already completed for %s, skipping",
                        schedule_key
                    )
                elif current_soc is not None:
                    # Auto-detect direction if not specified or set to "auto"
                    if soc_limit_type is None or soc_limit_type == "auto":
                        # Check if we already locked direction for this schedule entry
                        if not hasattr(self, "_locked_soc_types"):
                            self._locked_soc_types = {}
                        locked_type = self._locked_soc_types.get(schedule_key)

                        if locked_type:
                            # Use previously locked direction
                            soc_limit_type = locked_type
                        else:
                            # First time - detect and lock direction
                            # Use hysteresis: 2% buffer to avoid oscillation
                            hysteresis = 2
                            if current_soc < soc_limit - hysteresis:
                                soc_limit_type = "max"  # Need to charge up to target
                            elif current_soc > soc_limit + hysteresis:
                                soc_limit_type = "min"  # Need to discharge down to target
                            else:
                                # Within hysteresis band - already close to target
                                should_apply = False
                                self._soc_target_completed[schedule_key] = True
                                should_revert = self._current_action == action
                                if should_revert:
                                    _LOGGER.info(
                                        "SOC already at target (%s%% ≈ %s%%), reverting to default mode",
                                        current_soc, soc_limit
                                    )
                                soc_limit_type = "max"  # Fallback, won't be used

                            # Lock the detected direction for this hour
                            self._locked_soc_types[schedule_key] = soc_limit_type
                            _LOGGER.debug(
                                "Auto-detected SOC direction for %s: %s (current=%s%%, target=%s%%)",
                                schedule_key, soc_limit_type, current_soc, soc_limit
                            )

                    # "max" = charging mode: stop when SOC >= limit
                    # "min" = discharging mode: stop when SOC <= limit
                    limit_reached = False
                    if soc_limit_type == "min" and current_soc <= soc_limit:
                        limit_reached = True
                    elif soc_limit_type == "max" and current_soc >= soc_limit:
                        limit_reached = True

                    if limit_reached:
                        should_apply = False
                        # Mark as completed to prevent ping-pong
                        self._soc_target_completed[schedule_key] = True
                        should_revert = self._current_action == action
                        direction = "discharge" if soc_limit_type == "min" else "charge"
                        comparison = "<=" if soc_limit_type == "min" else ">="
                        if should_revert:
                            _LOGGER.info(
                                "SOC %s limit reached (%s%% %s %s%%), reverting to default mode",
                                direction, current_soc, comparison, soc_limit
                            )
                        else:
                            # Target already reached before action started - skip
                            _LOGGER.debug(
                                "SOC %s target already reached (%s%% %s %s%%), skipping action",
                                direction, current_soc, comparison, soc_limit
                            )

            # Check minutes limit (stop when current_minute reaches the limit)
            if minutes is not None and not full_hour:
                if current_minute >= minutes:
                    should_apply = False
                    should_revert = self._current_action == action
                    if should_revert:
                        _LOGGER.info(
                            "Minutes limit reached (%s >= %s), reverting to default mode",
                            current_minute, minutes
                        )

            # Resolve ACTION_PV_CHARGE and ACTION_SELF_CONSUME_FIRST to default mode
            if should_apply and action in (ACTION_PV_CHARGE, ACTION_SELF_CONSUME_FIRST):
                action = self.default_mode or action

            # Resolve ACTION_SELF_CONSUME_ONLY to self-consume mode (no grid export)
            if should_apply and action == ACTION_SELF_CONSUME_ONLY:
                action = self._optimizer.mode_self_consume or self.default_mode or action

            # Resolve ACTION_PAID_IMPORT to grid_only mode. Pair with the
            # PV Input switch (Basic Settings) so PV is curtailed during
            # negative-price hours — otherwise an inverter that still routes
            # PV to the home in Grid Only mode will silently nullify the
            # paid-import revenue.
            if should_apply and action == ACTION_PAID_IMPORT:
                action = self._optimizer.mode_grid_only or self.default_mode or action

            # Dynamic charge mode resolution (R2): resolve ACTION_CHARGE at runtime
            if should_apply and action == ACTION_CHARGE:
                action = self._optimizer.select_charge_mode()

            if should_apply:
                # Apply export surplus + PV input switches first so the
                # inverter is in the right configuration before mode change
                # (especially critical for discharge / paid-import slots).
                export_surplus = hour_schedule.get("export_surplus")
                if export_surplus is not None:
                    await self._async_apply_export_surplus(bool(export_surplus))
                pv_input = hour_schedule.get("pv_input")
                if pv_input is not None:
                    await self._async_apply_pv_input(bool(pv_input))

                if self._current_action != action:
                    await self._async_apply_mode(action)
                # Start EV charge if scheduled
                if ev_charging and self._ev_charge_controller:
                    ev_reason = hour_schedule.get("ev_charge_reason", "cheap_hour")
                    await self._ev_charge_controller.async_start_charge(
                        self._ev_charge_controller.max_amps, ev_reason
                    )
            elif should_revert and self._current_action != self._get_idle_mode():
                await self._async_apply_idle_mode()
                # Stop EV charge when reverting
                if self._ev_charge_controller:
                    await self._ev_charge_controller.async_stop_charge()

        else:
            # No schedule for this hour - revert to default if we're not already there
            if self._current_action and self._current_action != self._get_idle_mode():
                await self._async_apply_idle_mode()

        # Breaker protection: runs every 60s cycle regardless of schedule
        await self._async_check_breaker_protection()

    def _is_ev_stop_condition_configured(self) -> bool:
        """Check if EV stop condition is properly configured."""
        cond = self.ev_stop_condition
        return cond is not None and len(cond) > 0

    def _get_current_inverter_mode(self) -> str | None:
        """Get current inverter mode from entity."""
        state = self.hass.states.get(self.inverter_mode_entity)
        if state is None:
            return None
        return state.state

    def _get_current_soc(self) -> int | None:
        """Get current SOC value from sensor."""
        if not self.soc_sensor:
            return None

        state = self.hass.states.get(self.soc_sensor)
        if state is None:
            return None

        try:
            return int(float(state.state))
        except (ValueError, TypeError):
            return None

    def _get_current_load_power(self) -> float | None:
        """Get current total house load from sensor (kW)."""
        sensor = self.load_power_sensor
        if not sensor:
            return None
        state = self.hass.states.get(sensor)
        if state is None or state.state in ("unknown", "unavailable"):
            return None
        try:
            value = float(state.state)
            # Auto-detect W vs kW: if value > 200, assume Watts
            if value > 200:
                value = value / 1000
            return value
        except (ValueError, TypeError):
            return None

    async def _async_check_breaker_protection(self) -> None:
        """Check if total load exceeds breaker limit and throttle EV."""
        if self.breaker_power_limit <= 0 or not self._ev_charge_controller:
            return
        if not self._ev_charge_controller.requested:
            # EV not charging -- nothing to throttle
            if self._ev_paused_by_breaker:
                self._ev_paused_by_breaker = False
                self._last_throttle_amps = None
            return

        current_load = self._get_current_load_power()
        if current_load is None:
            return

        limit = self.breaker_power_limit
        ev_voltage = self._config.get("ev_voltage", 230)
        ev_current_amps = self._ev_charge_controller.amps
        ev_current_kw = (ev_current_amps * ev_voltage) / 1000

        overload = current_load - limit

        if overload > 0.1:
            # Over limit -- need to reduce EV
            reduce_kw = overload + 0.5  # 0.5 kW safety margin
            reduce_amps = int((reduce_kw * 1000) / ev_voltage) + 1
            target_amps = ev_current_amps - reduce_amps

            if target_amps < self._ev_charge_controller.min_amps:
                # Can't go below min -- pause entirely
                if not self._ev_paused_by_breaker:
                    await self._ev_charge_controller.async_pause_charge()
                    self._ev_paused_by_breaker = True
                    _LOGGER.warning(
                        "Breaker protection: load %.1f kW > limit %.1f kW, "
                        "EV paused (would need %dA, min is %dA)",
                        current_load, limit, target_amps,
                        self._ev_charge_controller.min_amps,
                    )
            else:
                # Throttle down
                self._ev_paused_by_breaker = False
                self._last_throttle_amps = target_amps
                await self._ev_charge_controller.async_throttle_amps(target_amps)
                _LOGGER.info(
                    "Breaker protection: load %.1f kW > limit %.1f kW, "
                    "EV throttled to %dA",
                    current_load, limit, target_amps,
                )
        elif overload < -1.0 and (self._ev_paused_by_breaker or self._last_throttle_amps is not None):
            # Under limit by >1 kW margin -- can restore
            headroom_kw = abs(overload) - 0.5  # Keep 0.5 kW safety margin
            headroom_amps = int((headroom_kw * 1000) / ev_voltage)
            max_amps = self._config.get(
                CONF_EV_MAX_CHARGE_AMPS, DEFAULT_EV_MAX_CHARGE_AMPS
            )

            if self._ev_paused_by_breaker:
                # Resume at min amps first, will ramp up on next cycles
                resume_amps = min(
                    self._ev_charge_controller.min_amps + headroom_amps,
                    max_amps,
                )
                if resume_amps >= self._ev_charge_controller.min_amps:
                    await self._ev_charge_controller.async_resume_charge(resume_amps)
                    self._ev_paused_by_breaker = False
                    self._last_throttle_amps = resume_amps
                    _LOGGER.info(
                        "Breaker protection: load %.1f kW, resuming EV at %dA",
                        current_load, resume_amps,
                    )
            elif self._last_throttle_amps is not None:
                # Ramp up gradually
                target_amps = min(
                    self._last_throttle_amps + headroom_amps,
                    max_amps,
                )
                if target_amps > self._last_throttle_amps:
                    await self._ev_charge_controller.async_throttle_amps(target_amps)
                    self._last_throttle_amps = target_amps
                    _LOGGER.info(
                        "Breaker protection: load %.1f kW, EV ramped up to %dA",
                        current_load, target_amps,
                    )
                if target_amps >= max_amps:
                    # Fully restored
                    self._last_throttle_amps = None

    async def _async_check_ev_stop_condition(self) -> tuple[bool, str]:
        """Check if EV stop condition is met using HA condition evaluation.

        Returns:
            Tuple of (condition_met, reason_string)
        """
        if not self._is_ev_stop_condition_configured():
            return False, ""

        conditions = self.ev_stop_condition
        if not conditions:
            return False, ""

        try:
            # ConditionSelector returns a list of conditions
            # ALL conditions must be met (implicit AND)
            reasons = []
            for cond_config in conditions:
                cond_func = await condition.async_from_config(self.hass, cond_config)
                if not cond_func(self.hass):
                    # At least one condition not met -- AND fails
                    return False, ""

                # Build reason string for this condition
                cond_type = cond_config.get("condition", "unknown")
                entity_id = cond_config.get("entity_id", "")
                if isinstance(entity_id, list):
                    entity_id = entity_id[0] if entity_id else ""
                if entity_id:
                    state = self.hass.states.get(entity_id)
                    if state:
                        reasons.append(f"{cond_type}: {entity_id} = {state.state}")
                    else:
                        reasons.append(f"{cond_type} condition met")
                else:
                    reasons.append(f"{cond_type} condition met")

            # All conditions met
            return True, "; ".join(reasons)

        except Exception as err:
            _LOGGER.error("Error evaluating EV stop condition: %s", err)
            return False, ""

    async def _async_apply_mode(self, mode: str) -> None:
        """Apply the specified inverter mode."""
        try:
            await self.hass.services.async_call(
                "input_select",
                "select_option",
                {
                    "entity_id": self.inverter_mode_entity,
                    "option": mode,
                },
            )
            self._current_action = mode
            self._action_start_time = dt_util.utcnow()
            _LOGGER.info("Applied inverter mode: %s", mode)
        except Exception as err:
            _LOGGER.error("Failed to apply mode %s: %s", mode, err)

    async def _async_apply_export_surplus(self, enabled: bool) -> None:
        """Toggle the optional inverter Export Surplus switch.

        No-op if the switch is not configured or already in the desired state.
        """
        await self._async_toggle_optional_switch(
            self.inverter_export_surplus_switch, enabled, "export surplus",
        )

    async def _async_apply_pv_input(self, enabled: bool) -> None:
        """Toggle the optional inverter PV Input switch.

        No-op if the switch is not configured or already in the desired state.
        OFF disables PV (curtails to 0); ON re-enables full PV input.
        """
        await self._async_toggle_optional_switch(
            self.inverter_pv_input_switch, enabled, "PV input",
        )

    async def _async_toggle_optional_switch(
        self, entity_id: str | None, enabled: bool, label: str,
    ) -> None:
        """Generic helper to toggle a switch/input_boolean if configured."""
        if not entity_id:
            return

        state = self.hass.states.get(entity_id)
        desired = "on" if enabled else "off"
        if state is not None and state.state == desired:
            return

        service = "turn_on" if enabled else "turn_off"
        domain = entity_id.split(".", 1)[0] if "." in entity_id else "switch"
        if domain not in ("switch", "input_boolean"):
            domain = "switch"
        try:
            await self.hass.services.async_call(
                domain,
                service,
                {"entity_id": entity_id},
            )
            _LOGGER.info("Applied %s: %s (%s)", label, desired, entity_id)
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Failed to apply %s %s: %s", label, desired, err)

    async def _async_apply_idle_mode(self) -> None:
        """Apply the neutral fallback mode used outside scheduled actions.

        Also re-enables PV input if a PV switch is configured — guarantees
        we never get stuck with PV disabled after a paid-import slot ends.
        """
        if self.inverter_pv_input_switch:
            await self._async_apply_pv_input(True)
        idle_mode = self._get_idle_mode()
        if idle_mode:
            await self._async_apply_mode(idle_mode)
            _LOGGER.info("Reverted to idle mode: %s", idle_mode)

    async def _async_apply_optimization_result(
        self, result,
    ) -> None:
        """Apply optimization result to the schedule.

        Uses ACTION_CHARGE for charge hours to enable dynamic mode selection.
        """
        # Clear future schedule first, but preserve manual entries
        now = dt_util.now()
        current_date = now.strftime("%Y-%m-%d")

        min_sell_price = float(
            self._config.get(CONF_MIN_SELL_PRICE, DEFAULT_MIN_SELL_PRICE)
        )
        export_switch_configured = bool(self.inverter_export_surplus_switch)
        pv_switch_configured = bool(self.inverter_pv_input_switch)

        def _pv_input_for(kind: str, buy_price: float | None = None) -> bool | None:
            """Decide whether the PV Input switch should be ON for a slot.

            Returns None when the switch is not configured (no toggling done).
            OFF only for slots that DP planned with PV-curtailed semantics:
            - paid_import (always)
            - charge with buy_price < 0 (negative-price grid charge)
            All other slots get ON to ensure PV is available.
            """
            if not pv_switch_configured:
                return None
            if kind == "paid_import":
                return False
            if kind == "charge" and buy_price is not None and buy_price < 0:
                return False
            return True

        def _export_for(date: str | None, hour, kind: str) -> bool | None:
            """Decide whether the Export Surplus switch should be ON for a slot.

            kind: charge | discharge | solar | pv_charge | self_consume_first
                  | self_consume_only | idle | paid_import
            Returns None when the switch is not configured (no-op in executor).
            """
            if not export_switch_configured:
                return None
            if kind == "discharge":
                return True
            if kind == "self_consume_only":
                return False
            if kind == "paid_import":
                # Grid Only mode: PV is curtailed, no export needed/possible.
                return False
            # charge / solar / pv_charge / self_consume_first / idle -- gate on
            # sell price. For "charge", this also handles the negative-price
            # case (sell typically 0): Export OFF prevents accidental PV give-
            # away if the PV-input switch fails to disable PV in time, and
            # avoids triggering grid-operator restrictions on exports during
            # negative-price windows.
            price = self.get_sell_price_at(date, hour) if date is not None else None
            if price is None:
                return True  # unknown -> don't block export
            return price > min_sell_price

        # Collect all dates that appear in optimization results
        all_dates = set()
        for hour_data in result.charge_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.discharge_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.idle_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.solar_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.pv_charge_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.self_consume_first_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.self_consume_only_hours:
            all_dates.add(hour_data.get("date"))
        for hour_data in result.paid_import_hours:
            all_dates.add(hour_data.get("date"))
        all_dates.discard(None)
        # Always include today
        all_dates.add(current_date)

        # Get manual hours for all affected dates before clearing
        manual_hours_by_date: dict[str, set[str]] = {}
        for date in all_dates:
            manual_hours_by_date[date] = self._storage.get_manual_hours(date)

        manual_hours_total = sum(len(hours) for hours in manual_hours_by_date.values())
        _LOGGER.debug(
            "Manual hours to preserve: %d across %d dates",
            manual_hours_total,
            len(manual_hours_by_date),
        )

        # Clear all affected date schedules, preserving manual entries
        for date in all_dates:
            await self._storage.async_clear_date_schedule(date, preserve_manual=True)

        # Apply charge hours
        for hour_data in result.charge_hours:
            date = hour_data.get("date")
            hour = str(hour_data.get("hour"))
            manual_hours = manual_hours_by_date.get(date, set())
            if hour in manual_hours:
                _LOGGER.debug("Skipping charge hour %s %s:00 - manual entry exists", date, hour)
                continue

            ev_reason = hour_data.get("ev_charge_reason", "cheap_hour")
            ev_charging = self._optimizer.ev_enabled and self._optimizer._is_ev_connected()

            # SOC target: emergency -> 100%, DP grid-charge -> precise target
            if ev_charging:
                soc_target = None
            elif hour_data.get("expected_end_usable_kwh") is not None:
                end_usable = hour_data["expected_end_usable_kwh"]
                cap = self._optimizer.battery_capacity
                min_soc = self._optimizer.battery_min_soc
                soc_target = round(min_soc + (end_usable / cap * 100), 1) if cap > 0 else 100
                soc_target = min(100, max(min_soc, soc_target))
            else:
                soc_target = 100

            # EV-charging slots use ACTION_CHARGE (resolved at runtime via R2 to
            # pick a smart EV/battery split). Pure battery slots use the
            # charge mode directly; for negative-price hours the PV Input
            # switch (when configured) flips PV off so the battery is filled
            # entirely from the paid grid.
            buy_price = hour_data.get("value", 0)
            if ev_charging:
                charge_action = ACTION_CHARGE
            else:
                charge_action = self._optimizer.mode_charge_battery or ACTION_CHARGE

            await self._storage.async_set_hour_schedule(
                date=date,
                hour=hour,
                action=charge_action,
                soc_limit=soc_target,
                soc_limit_type="max",
                full_hour=True,
                minutes=None,
                ev_charging=ev_charging,
                ev_charge_reason=ev_reason if ev_charging else None,
                manual=False,
                export_surplus=_export_for(date, hour, "charge"),
                pv_input=_pv_input_for("charge", buy_price),
            )
            _LOGGER.debug(
                "Applied charge slot %s %s:00 - planned=%.2f kWh soc_target=%.1f%% price=%.4f",
                date, hour,
                hour_data.get("planned_energy_kwh", 0),
                soc_target if soc_target is not None else 0,
                hour_data.get("value", 0),
            )

        # Apply discharge hours with sell mode
        sell_mode = self._optimizer.mode_sell
        if sell_mode:
            for hour_data in result.discharge_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    _LOGGER.debug("Skipping discharge hour %s %s:00 - manual entry exists", date, hour)
                    continue

                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=sell_mode,
                    soc_limit=hour_data.get("soc_limit", self._optimizer.battery_min_soc),
                    soc_limit_type="min",
                    full_hour=True,
                    minutes=None,
                    planned_energy_kwh=hour_data.get("planned_energy_kwh"),
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "discharge"),
                    pv_input=_pv_input_for("discharge"),
                )
                _LOGGER.debug(
                    "Applied discharge slot %s %s:00 - battery=%.2f kWh to_grid=%.2f kWh to_home=%.2f kWh soc_limit=%.2f%% price=%.4f",
                    date,
                    hour,
                    hour_data.get("planned_battery_out_kwh", hour_data.get("planned_energy_kwh", 0.0)),
                    hour_data.get("planned_export_kwh", 0.0),
                    hour_data.get("planned_home_supply_kwh", 0.0),
                    hour_data.get("soc_limit", float(self._optimizer.battery_min_soc)),
                    hour_data.get("value", 0.0),
                )

        # Apply solar-only hours
        solar_mode = self._optimizer.mode_sell_solar_only
        if solar_mode:
            for hour_data in result.solar_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    _LOGGER.debug("Skipping solar hour %s %s:00 - manual entry exists", date, hour)
                    continue

                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue

                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=solar_mode,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "solar"),
                    pv_input=_pv_input_for("solar"),
                )

        # Apply idle/grid-only hours so the UI reflects optimizer-selected neutral mode
        idle_mode = self._get_idle_mode()
        if idle_mode:
            for hour_data in result.idle_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    continue

                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue

                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=idle_mode,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "idle"),
                    pv_input=_pv_input_for("idle"),
                )

        # Apply PV charge hours (resolved to default_mode at runtime)
        if result.pv_charge_hours:
            for hour_data in result.pv_charge_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    continue
                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue
                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=ACTION_PV_CHARGE,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "pv_charge"),
                    pv_input=_pv_input_for("pv_charge"),
                )

        # Apply self-consume-first hours (Default mode — battery covers deficit, surplus sold)
        if result.self_consume_first_hours:
            for hour_data in result.self_consume_first_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    continue
                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue
                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=ACTION_SELF_CONSUME_FIRST,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "self_consume_first"),
                    pv_input=_pv_input_for("self_consume_first"),
                )

        # Apply self-consume-only hours (Self-Consume mode — no grid export, sell_price ≈ 0)
        if result.self_consume_only_hours:
            for hour_data in result.self_consume_only_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    continue
                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue
                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=ACTION_SELF_CONSUME_ONLY,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "self_consume_only"),
                    pv_input=_pv_input_for("self_consume_only"),
                )

        # Apply paid-import hours. Sent to the inverter in Grid Only mode
        # (resolved at runtime from ACTION_PAID_IMPORT). Pair with the PV
        # Input switch in Basic Settings for the revenue to materialize.
        if result.paid_import_hours and self._optimizer.mode_grid_only:
            for hour_data in result.paid_import_hours:
                date = hour_data.get("date")
                hour = str(hour_data.get("hour"))
                manual_hours = manual_hours_by_date.get(date, set())
                if hour in manual_hours:
                    continue
                existing = self._storage.get_hour_schedule(date, hour)
                if existing:
                    continue
                await self._storage.async_set_hour_schedule(
                    date=date,
                    hour=hour,
                    action=ACTION_PAID_IMPORT,
                    soc_limit=None,
                    soc_limit_type=None,
                    full_hour=True,
                    minutes=None,
                    ev_charging=False,
                    manual=False,
                    export_surplus=_export_for(date, hour, "paid_import"),
                    pv_input=_pv_input_for("paid_import"),
                )
                _LOGGER.debug(
                    "Applied paid-import slot %s %s:00 - buy=%.4f cons=%.2f kWh revenue=%.4f",
                    date, hour,
                    hour_data.get("buy_price", 0),
                    hour_data.get("planned_grid_import_kwh", 0),
                    hour_data.get("expected_revenue", 0),
                )

        _LOGGER.info(
            "Applied optimization schedule: %d charge, %d discharge, %d solar, %d pv-charge, %d sc-first, %d sc-only, %d paid-import hours",
            len(result.charge_hours),
            len(result.discharge_hours),
            len(result.solar_hours),
            len(result.pv_charge_hours),
            len(result.self_consume_first_hours),
            len(result.self_consume_only_hours),
            len(result.paid_import_hours),
        )
