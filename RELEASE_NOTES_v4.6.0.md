# v4.6.0 — Dynamic PV Confidence

Two-layer adaptive PV forecast: probabilistic baseline (Solcast P10/P50/P90 + per-period confidence) plus intra-day reactive correction from actual production. Replaces the static `PV Forecast Confidence` slider as the primary mechanism — slider stays as a manual override.

Plus an architectural cleanup: the old `check_emergency_charge` path is gone — the DP optimizer's reserve mechanism already handles low-SOC scenarios cleanly.

## Why

A real day surfaced the problem: Solcast forecast 22.98 kWh, actual 9.7 kWh — a 58% miss. The static 50–100% slider couldn't react. Worse, Solcast itself was telling us via `analysis.confidence: 0.286` that it was unsure — and the day landed almost exactly at P10 (`estimate10: 9.79`). We were ignoring all the signal Solcast already provided.

## What changed

### Layer 1 — Probabilistic baseline (preventive, from sunrise)

For each forecast period the integration now reads `pv_estimate10` / `pv_estimate` / `pv_estimate90` and the per-period `confidence` from Solcast's `analysis.intervals[]` and blends:

```
baseline = P10 + confidence × (P50 − P10)
```

- High Solcast confidence → baseline ≈ P50 (median), trust the forecast.
- Low Solcast confidence → baseline approaches P10 (pessimistic), hedge.

Per-hour confidence is used (not daily average) so different parts of the day get different conservatism.

### Layer 2 — Intra-day reactive correction

On every optimization run:

```
factor = clamp(actual_today / baseline_for_elapsed_pv_on_hours, 0.3, 1.5)
```

- `actual_today` = state of your `inverter_today_production` sensor (resets at midnight).
- `baseline_for_elapsed_pv_on_hours` = sum of layer-1 baseline for past hours today, **excluding hours where the PV input switch was OFF** (`paid_import` or negative-price grid charge slots).
- Factor is applied **only to remaining hours of today** — tomorrow keeps the pure baseline plus slider.
- Activates after ≥ 2 kWh of baseline has accumulated (avoids morning noise).
- Switch ON/OFF history is read from HA recorder for ground truth, not from the schedule.

### Fallback for non-Solcast providers

Forecast.Solar, OpenMeteo, and any custom forecast sensor without P10/P90 fields automatically degrade to: `baseline = raw forecast` (= effective P50). Layer 2 still works. Slider remains the main conservatism rocker for these users.

### Old static slider — kept as multiplier

`PV Forecast Confidence` (50–100%) stays in settings. Default 100% = pass-through. Useful as:
- Extra conservatism on top of the auto blend (e.g. for tomorrow when no actual data exists yet)
- Main manual rocker for users without probabilistic forecasts
- Compatibility with Solcast's own dampening — leave at 100% if you've already configured Solcast dampening to avoid compound reduction.

### Emergency charge — removed

The previous `check_emergency_charge` path added charge slots outside the DP optimizer when SOC was low. The DP didn't see them, planned independently, and the two collided (e.g. emergency at 08:00 forced 100% SOC at 0.80 PLN, then DP planned more charging at the cheap window assuming an empty battery).

The DP already has a reserve mechanism (`min_end_usable`) that forces it to plan charging during cheap windows to maintain a survival reserve. Low SOC + grid imports for consumption is the natural correct behavior — no separate emergency path needed. A diagnostic warning is now logged when SOC is below the configured minimum.

## New configuration fields

In integration options, "PV Forecast & Consumption" step:

| Field | Description |
|---|---|
| **PV Production Today Sensor** | Optional. A `today-energy` sensor (kWh, resets at midnight). Required for Layer 2 to activate. |
| **Dynamic intra-day PV correction** | Toggle. Default ON when sensor is configured. |

Existing `PV Forecast Confidence` slider is unchanged.

## Card changes

- **Status bar**: compact colored indicator showing the current effective `PV dynamic factor` when Layer 2 is active. Green ≥ 80%, yellow 50–80%, red < 50%. Hover for breakdown.
- **Stats tab**: dedicated `PV Confidence` block with full diagnostics — factor value, status reason (active / waiting for threshold / sensor unavailable / etc.), `actual today vs baseline elapsed`, `baseline today (full day)`, and average Solcast confidence.

## Observability

Backend logs (per optimization run):

```
PV dynamic factor: 0.73 (active=True, reason=ok, actual=9.7, baseline=13.38)
THRESHOLDS: ... slider=90% todayFactor=0.73 ...
```

API endpoint `/api/hacs_energy_scheduler/data` now includes a `pv_dynamic` block with: `factor`, `active`, `reason`, `actual_today_kwh`, `baseline_elapsed_kwh`, `baseline_today_kwh`, `solcast_confidence`.

## Upgrade path

No migration steps required. Existing installs:
- Without a `today_production` sensor: behaves exactly like before (slider is the only mechanism). Add the new sensor in options to opt in.
- With a `today_production` sensor: Layer 2 activates automatically with the recommended defaults. Slider remains in effect on top.
- Solcast users: probabilistic baseline kicks in immediately based on what Solcast already publishes. No additional configuration.

## Known limitations

- Linear blend between P10 and P50 is intentionally conservative on very-low-confidence days (e.g. `analysis.confidence: 0.057` collapses baseline near P10). Layer 2 self-corrects upward (up to 1.5×) if actual outperforms — but if Solcast badly mispredicts uncertainty, daytime planning can be over-cautious. See `docs/follow-ups.md` for the calibration knob if this becomes a real-world issue.
- Layer 2 doesn't smooth across days — tomorrow starts fresh.
- `today_production` sensor must report in kWh, Wh, or MWh (auto-detected via `unit_of_measurement`). Other units disable Layer 2 with reason `unit_unsupported`.

## Design rationale

Full architectural reasoning: [`docs/adr/0001-dynamic-pv-confidence.md`](docs/adr/0001-dynamic-pv-confidence.md). Watch-list for follow-ups: [`docs/follow-ups.md`](docs/follow-ups.md).

## Commits in this release

- `47793b4` — feat: dynamic PV confidence with probabilistic baseline + intra-day correction
- `eac8a31` — fix: tighten emergency charge (mitigation, superseded by next commit)
- `2107ec9` — refactor: remove check_emergency_charge — DP reserve already handles low SOC
- `c52a9b4` — docs: record DP coverage watch-list after emergency-charge removal
- `9f81bac` — chore: bump card to 4.6.0 to match integration version
