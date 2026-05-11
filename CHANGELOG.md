# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.7.5] — 2026-05-11

### Fixed

- **Negative profit displayed as `+-X.XX`.** Card status-bar and stats-tab hardcoded a `+` prefix in front of `estimated_profit.toFixed(2)`, producing `+-2.18 PLN` for losing plans. Now the sign is derived from the value: positive shows `+`, negative shows the natural `-` from `toFixed`, zero shows no sign.
- **Micro-export filter wiped valuable home-supply slots.** When DP planned a small discharge dominated by battery-to-home flow (e.g. expensive morning hour with PV ≈ 0: `battery=0.30 kWh, to_home=0.24 kWh, to_grid=0.06 kWh`), the post-processing filter saw `planned_energy_kwh < min_discharge_energy` and removed the slot entirely. With nowhere else to land — R6's SCF/SCO logic gates on `sell < min_sell_price` AND `pv > 0.1`, neither of which applied to the morning case — the hour fell into IDL, the inverter went to Grid Only, and the home bought from the grid at the peak price. Loss: roughly `home_supply × (buy_price − cycle_cost)` per affected hour. The filter now triggers on `planned_export_kwh` (not total energy) and demotes slots with meaningful home-supply (`>= 0.10 kWh`) to self-consume — SCF or SCO depending on `sell_price` vs `min_sell_price`, mirroring DP's native split — instead of dropping them. Slots with tiny export and tiny home-supply are still removed as before.

### Notes

- DP itself was correct; the bug was purely in the post-filter heuristic. No DP changes; the original filter rationale ("micro-exports don't recover the mode-switch overhead at sell-price margins") is preserved — just applied to the export portion of the slot rather than the total.

## [4.7.4] — 2026-05-11

### Fixed

- **Inverter stuck in Grid Only after mid-hour re-optimization.** When optimization ran inside an hour that already had a discharge slot, hit its `soc_limit`, and reverted to idle (Grid Only), the freshly-written plan for the same hour was silently ignored even though storage had the new slot. Root cause: the in-memory `_soc_target_completed` / `_locked_soc_types` dicts were keyed by `f"{date}_{hour}"`. The lock survived the schedule rewrite — so the next 60s scheduler tick saw `should_apply = False` regardless of what the new slot said, and the inverter stayed in Grid Only until the hour ended. Fix: lock key now includes a plan signature `(action, soc_limit, soc_limit_type, full_hour, minutes, ev_charging)`. Any change to the slot produces a fresh key, the prior completion state stops applying, and the new plan is evaluated from scratch. Stable plans see the same key on every tick — ping-pong protection is preserved.

### Notes

- The lock is in-memory, so the fix takes effect immediately on integration reload — no storage migration.
- If you observe the symptom on a running install before updating: reloading the integration (Settings → Devices → HACS Energy Scheduler → Reload) clears the in-memory state and the next scheduler tick applies the current plan.

## [4.7.3] — 2026-05-10

### Fixed

- **Recorder executor warning on every optimization run.** The dynamic-confidence factor's hourly-deltas query (added in 4.7.2) was running `statistics_during_period` via the generic `hass.async_add_executor_job` instead of the recorder's own executor. This produced a `Detected code that accesses the database without the database executor` warning at WARNING level on every optimization (~1× per hour minimum). Switched to `get_instance(hass).async_add_executor_job(...)` so the call lands on the recorder thread pool. Same fix applied preemptively to `consumption_history.py` (silent until now because the consumption profile is built rarely, but the same warning would have appeared on first profile build with debug logging).

### Changed

- **Let HA convert sensor units instead of doing it ourselves.** `_read_today_sensor_hourly_deltas` now passes `units={"energy": "kWh"}` to `statistics_during_period`, so HA returns Wh/MWh sensors pre-converted to kWh. Removes a code path that had to inspect `unit_of_measurement` and apply a multiplier table. Same change in `consumption_history._query_cumulative_sensor`. The EV-sensor query still passes `units=None` because the sensor may be either energy (kWh, sum) or power (kW, mean) and is detected after the fact.

### Notes

- No behavior change for end users — factor values, included hours, and produced schedules are unchanged. Only difference visible in HA logs is the absence of the recorder-executor warning.
- `_convert_to_kwh` helper removed from `pv_dynamic.py` as it became dead code after the `units` parameter switch.

## [4.7.2] — 2026-05-10

### Fixed

- **Dynamic-confidence factor was biased low when the export-surplus switch curtailed PV.** When `inverter_export_surplus_switch` is OFF (sell price ≤ minimum) and the battery is already absorbing what it can, the inverter throttles PV output to match local demand — the production sensor records the throttled value, not the meteorological potential. Without accounting for this, the factor concluded "PV is underperforming" and pushed the optimizer toward conservative planning despite Solcast being correct. Fixed by switching the factor computation to **per-hour sensor deltas** (one extra recorder query per optimization run): a fully-elapsed hour contributes to both numerator and denominator only when both `inverter_pv_input_switch` AND `inverter_export_surplus_switch` were ON for the majority of that hour. Falls back to the previous cumulative-sensor approach if recorder is unavailable. The debug log now breaks excluded hours into `excluded_pv_off=…` and `excluded_export_off=…` for visibility.

## [4.7.1] — 2026-05-10

### Fixed

- **Dynamic-confidence factor was systematically over-estimated mid-hour.** The numerator (`actual_today_kwh` from the production sensor) included accumulated production from the in-progress hour, but the denominator only summed baseline for fully-elapsed hours. At 10:42 with hour 10 in progress, that meant comparing ~5h42m of actual to 5h of forecast — biasing the factor upward by up to ~30% when partial-hour production was substantial. Now the numerator is read **at the top of the current hour** via HA recorder history, so both sides cover the same fully-elapsed window. Symmetric exclusion, no within-hour interpolation, zero bias from sub-hourly solar curve shape. Falls back to the current sensor reading if recorder is unavailable (only matters on first install / right after midnight reset). The debug log shows the source of the numerator (`from history` vs `current sensor; hour-start fallback: <reason>`) so the path is auditable.

## [4.7.0] — 2026-05-09

### Changed

- **Optimization modes collapsed to `auto` / `manual`.** Removed `hourly`, `6h`, `daily`, and `reactive`. New `auto` mode combines all reactive event listeners (price, PV forecast, battery SOC, EV SOC, EV connect/disconnect) with a 1-hour fallback timer — strictly better coverage than any old mode. `manual` is preserved for power users driving the integration via the `run_optimization` service. Anything else in stored config is transparently treated as `auto` at read time. Card dropdowns (control-tab and schedule-tab) now show two options.

### Added

- Debug log line `PV dynamic inputs: actual=… P50_elapsed=… baseline_elapsed=… included_solar_hours=… excluded_solar_hours=… pv_on_hours=…` exposes the exact inputs to the dynamic-confidence calculation, including which hours were dropped because the PV-input switch was OFF (paid-import / negative-price grid charge) and whether the source was switch history or the no-switch fallback.

### Notes

- No migration needed. Existing configs with old interval values are silently mapped to `auto`.
- Two card pickers now stay in sync (the schedule-tab one was missed in the initial collapse and updated in a follow-up).

## [4.6.1] — 2026-05-09

### Fixed

- **Dynamic-confidence activation now uses raw P50 elapsed kWh as the gate, not `baseline_elapsed`.** Previously the 2 kWh activation threshold was measured against the P10/P50 blend; on low-Solcast-confidence days that blend is heavily skewed toward P10, so the threshold was reached very late — exactly the days when the correction is most valuable. After the fix:

  | Day type | Solcast confidence | Old activation | New activation |
  | --- | --- | --- | --- |
  | Sunny, high confidence | ~0.30 | ~08:00 | ~08:00 (no change) |
  | Cloudy, very low confidence | ~0.06 | ~14:00 | ~08:00 |

  The ratio denominator is unchanged (still `baseline_elapsed`); only the activation gate moved.

- Explicit `baseline_elapsed > 0` guard against division by zero in degenerate cases (zero baseline at every entry).

### Notes

- No configuration changes needed. Behavior changes silently: dynamic correction starts earlier on low-confidence days. If you want activation conservative, raise the static `PV Forecast Confidence` slider — it still applies on top.
- ADR `docs/adr/0001-dynamic-pv-confidence.md` updated with the rationale.

## [4.6.0] — 2026-05-09

### Added

- **Two-layer adaptive PV forecast** replacing the static `PV Forecast Confidence` slider as the primary mechanism. The slider is preserved as an override.

  **Layer 1 — Probabilistic baseline (preventive, from sunrise).** Reads `pv_estimate10` / `pv_estimate` / `pv_estimate90` and per-period `confidence` from Solcast's `analysis.intervals[]` and blends:

  ```text
  baseline = P10 + confidence × (P50 − P10)
  ```

  High Solcast confidence → baseline ≈ P50 (median). Low Solcast confidence → baseline approaches P10 (pessimistic). Per-hour confidence is used so different parts of the day get different conservatism.

  **Layer 2 — Intra-day reactive correction.** On every optimization run:

  ```text
  factor = clamp(actual_today / baseline_for_elapsed_pv_on_hours, 0.3, 1.5)
  ```

  - `actual_today` = state of the configured `inverter_today_production` sensor (resets at midnight).
  - Hours where the PV input switch was OFF (`paid_import` / negative-price grid charge) are excluded from the denominator using HA recorder state history.
  - Factor applies **only to remaining hours of today** — tomorrow keeps the pure baseline plus slider.
  - Activates after ≥ 2 kWh of baseline has accumulated to avoid morning noise.

- Two new configuration fields under "PV Forecast & Consumption":
  - **PV Production Today Sensor** (optional) — today-energy sensor in kWh that resets at midnight. Required for Layer 2.
  - **Dynamic intra-day PV correction** (toggle, default ON when sensor configured).
- **Card status bar** shows a compact colored indicator (green ≥ 80%, yellow 50–80%, red < 50%) when Layer 2 is active. Hover for breakdown.
- **Card stats tab** shows a dedicated `PV Confidence` block with full diagnostics: factor value, status reason, `actual today vs baseline elapsed`, `baseline today (full day)`, average Solcast confidence.
- API endpoint `/api/hacs_energy_scheduler/data` now includes a `pv_dynamic` block with `factor`, `active`, `reason`, `actual_today_kwh`, `baseline_elapsed_kwh`, `baseline_today_kwh`, `solcast_confidence`.
- Backend logs per optimization run: `PV dynamic factor: 0.73 (active=True, reason=ok, actual=9.7, baseline=13.38)` and `THRESHOLDS: ... slider=90% todayFactor=0.73 ...`.
- Architectural rationale recorded in [`docs/adr/0001-dynamic-pv-confidence.md`](docs/adr/0001-dynamic-pv-confidence.md). Watch-list for follow-ups in [`docs/follow-ups.md`](docs/follow-ups.md).

### Changed

- Forecast.Solar, OpenMeteo, and any custom forecast sensor without P10/P90 fields automatically degrade to `baseline = raw forecast` (effective P50). Layer 2 still works for them; the slider remains the main conservatism rocker.
- Static `PV Forecast Confidence` slider repurposed as a manual multiplier on top of the auto-blend (default 100% = pass-through). Useful for: extra conservatism on tomorrow when no actual data exists, primary rocker for non-Solcast users, and avoiding compound reduction with Solcast's own dampening (leave at 100% if Solcast dampening is configured).

### Removed

- **`check_emergency_charge` path.** Previously added charge slots outside the DP optimizer when SOC was low. The DP didn't see them, planned independently, and the two collided (e.g. emergency at 08:00 forced 100% SOC at 0.80 PLN, then DP planned more charging at the cheap window assuming an empty battery). The DP already has a reserve mechanism (`min_end_usable`) that forces it to plan charging during cheap windows to maintain a survival reserve; low SOC + grid imports for consumption is the natural correct behavior. A diagnostic warning is now logged when SOC is below the configured minimum.

### Migration

- No steps required. Without a `today_production` sensor: behaves exactly like before (slider is the only mechanism). With one: Layer 2 activates automatically. Solcast users: probabilistic baseline kicks in immediately based on what Solcast already publishes.

### Known limitations

- Linear blend between P10 and P50 is intentionally conservative on very-low-confidence days (e.g. `analysis.confidence: 0.057` collapses baseline near P10). Layer 2 self-corrects upward (up to 1.5×) if actual outperforms — but if Solcast badly mispredicts uncertainty, daytime planning can be over-cautious. See `docs/follow-ups.md` for the calibration knob if this becomes a real-world issue.
- Layer 2 doesn't smooth across days — tomorrow starts fresh.
- `today_production` sensor must report in kWh, Wh, or MWh (auto-detected via `unit_of_measurement`). Other units disable Layer 2 with reason `unit_unsupported`.

[Unreleased]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.5...HEAD
[4.7.5]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.4...v4.7.5
[4.7.4]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.3...v4.7.4
[4.7.3]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.2...v4.7.3
[4.7.2]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.1...v4.7.2
[4.7.1]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.0...v4.7.1
[4.7.0]: https://github.com/rviar/ha-energy-scheduler/compare/v4.6.1...v4.7.0
[4.6.1]: https://github.com/rviar/ha-energy-scheduler/compare/v4.6.0...v4.6.1
[4.6.0]: https://github.com/rviar/ha-energy-scheduler/releases/tag/v4.6.0
