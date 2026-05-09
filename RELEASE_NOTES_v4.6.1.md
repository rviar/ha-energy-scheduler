# v4.6.1 — Dynamic confidence activates earlier on low-confidence days

Patch release fixing the activation timing of the intra-day PV correction so it kicks in by morning on cloudy/uncertain days, not at lunchtime.

## What changed

The `2 kWh` activation threshold was previously measured against `baseline_elapsed` (P10/P50 blend). On low-confidence days Solcast pushes baseline heavily toward P10, so the threshold was reached very late — exactly the days when the correction is most valuable.

Switched the activation gate to **raw P50 elapsed kWh** while keeping `baseline_elapsed` as the ratio denominator. Activation timing is now stable regardless of Solcast confidence; the correction math is unchanged.

### Before vs after

For a typical residential setup observed during testing:

| Day type | Solcast confidence | Old activation | New activation |
|---|---|---|---|
| Sunny, high confidence | ~0.30 | ~08:00 | ~08:00 (no change) |
| Cloudy, very low confidence | ~0.06 | ~14:00 | ~08:00 |

## Other notes

- Added an explicit `baseline_elapsed > 0` guard against division by zero in degenerate cases (zero baseline at every entry).
- ADR `docs/adr/0001-dynamic-pv-confidence.md` updated with the rationale (P50-gated activation, baseline-denominated ratio).

## Upgrade path

No configuration changes needed. Behavior changes silently: dynamic correction will start earlier on low-confidence days. If you want to keep activation conservative, increase the static `PV Forecast Confidence` slider — it still applies on top.

## Commits in this release

- `845a93e` — fix: gate dynamic-confidence activation on raw P50, not baseline
