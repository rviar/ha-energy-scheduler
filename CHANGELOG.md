# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.1...HEAD
[4.7.1]: https://github.com/rviar/ha-energy-scheduler/compare/v4.7.0...v4.7.1
[4.7.0]: https://github.com/rviar/ha-energy-scheduler/compare/v4.6.1...v4.7.0
[4.6.1]: https://github.com/rviar/ha-energy-scheduler/compare/v4.6.0...v4.6.1
[4.6.0]: https://github.com/rviar/ha-energy-scheduler/releases/tag/v4.6.0
