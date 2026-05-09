# Follow-ups

Open questions, deferred work, and watch-list items. Each entry should
say *what to look for* and *what to do if it shows up*. When an item is
addressed, link the commit/PR and remove it from the list.

## Watch: DP coverage after emergency-charge removal

**Context.** Commit `2107ec9` removed `check_emergency_charge` because
the DP already handles low-SOC scenarios via `min_end_usable` reserve
and the natural cycle-cost weighted optimization. See ADR
`docs/adr/0001-dynamic-pv-confidence.md` (architectural rationale lives
alongside the dynamic-confidence design).

**What to watch for in real-world logs:**

- Days when DP plans an unusually deep mid-horizon SOC dip with no
  cheap recovery window before consumption resumes. Symptom in DP debug
  dump: long stretch of `IDL`/`SOL` with `usable=0` followed by
  expensive grid imports for several hours.
- Markets where the only affordable charging window is **before** a long
  expensive stretch but DP skips it because cycle cost makes it
  unattractive — even though missing it forces high-priced consumption
  later.
- Hardware quirks: inverters that drain battery during `IDL`/`SOL`
  despite our model assuming the battery stays put. SOC trajectory
  diverges from the planned schedule.

**Targeted fix if needed.** Introduce a `min_intra_horizon_soc`
constraint inside `dp_engine.run_unified_dp` so each slot's exit state
must remain at or above some floor (e.g. `battery_min_soc + safety
margin`, or a per-slot lookahead based on hours-until-next-charge). This
generalizes the existing end-of-horizon `min_end_usable` to apply
slot-by-slot.

Concretely: in the DP loop (`dp_engine.py`), reject transitions whose
`new_state` index falls below the per-slot floor. Floor can be passed in
via `DPConfig` or computed per slot.

**Do NOT** re-introduce a separate `check_emergency_charge` path — that
collides with DP's plan. Any new safety net belongs inside the DP itself
so the optimizer has a single source of truth.

## Watch: dynamic-confidence baseline calibration

**Context.** ADR `0001-dynamic-pv-confidence.md` chose a linear
`baseline = P10 + confidence * (P50 - P10)` blend. On low-confidence
days (e.g. `analysis.confidence: 0.057`) this collapses baseline to
nearly P10 — by design, but possibly over-conservative in practice.

**What to watch for:**

- Days where Solcast `analysis.confidence < 0.15` but actual production
  ends near or above P50, and the optimizer planned excessively
  pessimistic charging (missing cheap PV-charge or PV-export
  opportunities).
- Pattern of `today_factor` spending most of the day clamped at the
  upper bound `1.5` (configured in `const.py:PV_DYNAMIC_FACTOR_MAX`).

**Targeted fix if needed.** Replace the linear blend with `sqrt(conf)`
or introduce a floor `max(P10, climatology)` so very-low-confidence days
don't flatten baseline all the way to P10. One-line change in
`pv_forecast.baseline_kwh()`.
