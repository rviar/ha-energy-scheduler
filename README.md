# HACS Energy Scheduler

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/rviar/ha-energy-scheduler.svg)](https://github.com/rviar/ha-energy-scheduler/releases)

See [CHANGELOG.md](CHANGELOG.md) for release history.

Home Assistant integration for hour-by-hour battery, PV, grid, and EV scheduling based on electricity prices.

It can work in two modes:
- manual scheduling from the card or services
- automatic optimization with battery/PV/EV-aware planning

## What It Does

The integration combines:
- hourly buy prices
- hourly sell prices
- inverter mode switching through an `input_select`
- optional battery SOC
- optional PV forecast
- optional consumption history
- optional EV charging constraints

From that it can:
- build an hourly schedule for the next `12-48` hours
- switch inverter modes automatically every hour
- return to a neutral idle mode when no action is scheduled
- keep manual hours if the optimizer rewrites the rest of the plan
- adapt the PV forecast in real time to actual production and Solcast's own confidence intervals
- show the plan on a Lovelace card

## Installation

### HACS

1. Open HACS.
2. Go to `Integrations`.
3. Open the three-dot menu and choose `Custom repositories`.
4. Add `https://github.com/rviar/ha-energy-scheduler` as `Integration`.
5. Install `HACS Energy Scheduler`.
6. Restart Home Assistant.

### Manual

1. Download the latest release.
2. Copy `custom_components/hacs_energy_scheduler` into `config/custom_components/`.
3. Restart Home Assistant.

## What You Need Before Setup

### Required inputs

You need these 3 things at minimum:

1. A buy price sensor.
2. A sell price sensor.
3. An inverter mode entity of type `input_select`.

### Optional but strongly recommended inputs

For useful optimization you usually also want:
- battery SOC sensor
- battery capacity and power limits
- PV forecast sensor
  Recommended default: `Solcast PV Forecast` — unlocks probabilistic baseline (P10/P50/P90 + per-period confidence)
- a today-energy sensor for actual PV production (e.g. `inverter_today_production`) — unlocks intra-day reactive correction
- household consumption history sensor

For EV support you also want:
- EV connected sensor
- EV SOC sensor
- EV battery capacity
- EV max charge power

## Required Data Formats

### Price sensors

Both buy and sell price sensors must expose a `data` attribute.  
Each item must look like this:

```yaml
data:
  - start: "2026-04-15T22:00:00Z"
    end: "2026-04-15T23:00:00Z"
    value: 0.81
  - start: "2026-04-15T23:00:00Z"
    end: "2026-04-16T00:00:00Z"
    value: 0.79
```

Notes:
- `start` and `end` must be ISO timestamps.
- `value` must be numeric.
- timestamps may be UTC with `Z`; the integration converts them to Home Assistant local time.
- the optimizer expects hourly entries.

### PV forecast sensors

By default, the integration is designed to work well with `Solcast PV Forecast` sensors.

The PV forecast parser accepts several common formats:

- Solcast `forecasts`
- Solcast `detailedHourly`
- Forecast.Solar `forecast`
- generic `data`
- generic `hourly`
- fallback numeric daily total in the sensor state

Supported generic examples:

```yaml
data:
  - start: "2026-04-16T10:00:00Z"
    value: 3.4
  - start: "2026-04-16T11:00:00Z"
    value: 4.2
```

or:

```yaml
hourly:
  "10": 3.4
  "11": 4.2
```

Values are interpreted as `kWh` per hour.

### Consumption sensor

If you configure a consumption sensor, it should be a cumulative energy sensor in `kWh`.  
The integration builds an hourly profile from history.

If you do not have one, the optimizer falls back to `Average Consumption`.

### Inverter mode entity

The inverter mode entity must be an `input_select` whose options are the exact mode names your inverter automation expects.

Example:

```yaml
input_select:
  inverter_mode:
    options:
      - Default
      - Grid Only
      - Self Consume
      - Buy
      - Sell (All)
      - Sell (Surplus only)
```

## Configuration

After installation:

1. Go to `Settings -> Devices & Services`.
2. Add `HACS Energy Scheduler`.
3. Complete the basic onboarding flow.
4. Open integration options to fill battery, PV, EV, and mode mapping details.

## Configuration Fields

### Basic Settings

These fields identify the main entities:

| Field | Required | Meaning |
| --- | --- | --- |
| `Buy Price Sensor` | Yes | Sensor with hourly import prices in `data` |
| `Sell Price Sensor` | Yes | Sensor with hourly export prices in `data` |
| `Inverter Mode Entity` | Yes | `input_select` used to switch inverter modes |
| `Inverter Export Surplus Switch` | No | Optional `switch`/`input_boolean` that physically enables grid export on the inverter. The integration toggles it OFF for hours where `sell_price ≤ Minimum Sell Price` so that free PV surplus is not given away |
| `EV Stop Condition` | No | HA condition list for stopping EV charging schedules |
| `Currency` | No | Display currency for card and stats |

> ⚠️ **If you set `Inverter Export Surplus Switch`, remove any Export-Surplus toggling from your inverter mode-mapping scripts or automations.** The integration becomes the sole authority over that switch — toggling it elsewhere (e.g. from a `Self-Consume`/`Sell` mode script) will race with the scheduler and lead to unpredictable export behavior. Mode scripts should only set the inverter mode; the Export Surplus switch is driven automatically per hour based on sell price.

### Battery Optimizer

These fields tell the optimizer what the home battery can do:

| Field | Required for optimization | Meaning |
| --- | --- | --- |
| `Battery SOC Sensor` | Recommended | Current battery SOC in `%` |
| `Battery Capacity` | Recommended | Total battery capacity in `kWh` |
| `Minimum SOC Reserve` | Recommended | Battery floor the optimizer should not cross |
| `Max Charge Power` | Recommended | Max grid charge power in `kW` |
| `Max Discharge Power` | Recommended | Max battery discharge power in `kW` |
| `Battery Cost` | Optional | Used for cycle-cost estimation |
| `Battery Cycle Count` | Optional | Used for cycle-cost estimation |
| `Minimum Sell Price` | Optional | Do not sell below this price |
| `Min Discharge Energy` | Optional | Filters tiny discharge slots |

### PV Forecast and Consumption

These fields improve planning quality:

| Field | Required | Meaning |
| --- | --- | --- |
| `PV Forecast Today Sensor` | No | Forecast for today, typically a `Solcast PV Forecast` sensor |
| `PV Forecast Tomorrow Sensor` | No | Forecast for tomorrow; enables better longer horizon planning |
| `Average Consumption` | Yes if no history sensor | Fallback hourly home consumption |
| `Max Grid Power` | Recommended | Limits concurrent charging from grid |
| `Consumption Sensor` | Strongly recommended | Historical home energy profile source |
| `EV Charger Sensor` | Optional | Lets the profile separate EV load from house load |
| `PV Production Today Sensor` | Optional | Today-energy sensor in `kWh` (resets at midnight). Enables intra-day reactive correction by comparing actual production to the forecast for already-elapsed hours |
| `Dynamic intra-day PV correction` | Optional | Toggle for the reactive correction layer. Default ON when a production sensor is configured |
| `PV Forecast Confidence` | Optional | Manual multiplier on top of the forecast (50–100%, default 100%). Useful as a fallback for non-Solcast providers or as extra conservatism. **If you have already configured Solcast's own `dampening`, leave this at 100% to avoid compound reduction.** |

### Dynamic PV confidence

When a Solcast forecast sensor and a `today_production` sensor are both configured, the integration runs two adaptive layers on top of the raw forecast:

**Layer 1 — Probabilistic baseline (preventive, from sunrise).** Reads `pv_estimate10` / `pv_estimate` / `pv_estimate90` and the per-period `confidence` from Solcast's `analysis.intervals[]` and blends `baseline = P10 + confidence × (P50 − P10)`. High Solcast confidence → baseline ≈ P50 (median); low confidence → baseline approaches P10 (pessimistic).

**Layer 2 — Intra-day reactive correction.** On every optimization run, computes `factor = clamp(actual_today / baseline_for_elapsed_pv_on_hours, 0.3, 1.5)` and applies it to the remaining hours of today. Hours where the inverter PV input switch was OFF (negative-price grid charge or `paid_import`) are excluded from the denominator using HA recorder state history. Activates after ≥ 2 kWh of baseline has accumulated.

Tomorrow always uses the pure baseline — today's anomalies don't poison the next day's plan. Forecast.Solar and other point-estimate providers automatically degrade to `baseline = raw forecast`; layer 2 still works.

The current factor and breakdown are visible on the card status bar and in the stats tab.

### EV Settings

Enable only if the optimizer should plan around EV charging:

| Field | Required when EV enabled | Meaning |
| --- | --- | --- |
| `Enable EV Support` | Yes | Turns on EV-aware optimization |
| `EV SOC Sensor` | Recommended | EV state of charge in `%` |
| `EV Battery Capacity` | Recommended | EV battery size |
| `EV Max Charge Power` | Recommended | Maximum EV charge power in `kW` |
| `EV Target SOC` | Recommended | Target charge level |
| `EV Connected Sensor` | Recommended | Whether the EV is plugged in |
| `EV Ready By Time` | Optional | Deadline by which EV should be ready |
| `Home Battery Low Threshold` | Optional | Below this, home battery gets priority |
| `Home Battery High Threshold` | Optional | Above this, EV may charge alongside battery |
| `EV Sufficient Threshold` | Optional | Above this, EV is treated as sufficiently charged |
| `EV Charge Switch` | Optional | Direct start/stop control |
| `EV Charge Amps Entity` | Optional | Direct current control |
| `EV Max Charge Amps` | Optional | Used for fallback/manual EV control |
| `Grid Voltage` | Optional | Used for power/current conversion |

### Inverter Mode Mapping

This is the most important part to get right.

The optimizer does not know your inverter brand.  
It only knows abstract actions and needs you to map them to real inverter modes.

| Mapping field | Meaning in the scheduler |
| --- | --- |
| `Default Mode` | Used for `PV Charge` and `Self-Consume First` |
| `Charge Battery Mode` | Charge battery from grid |
| `Charge EV Mode` | Charge EV only |
| `Charge EV + Battery Mode` | Charge both EV and battery |
| `Sell/Discharge Mode` | Export battery energy to the grid |
| `Sell Solar Only Mode` | Export PV surplus only |
| `Grid Only Mode` | Neutral idle mode, used when no scheduled action should discharge the battery |
| `Self-Consume Mode` | Use energy locally, do not export |

### Recommended mapping philosophy

For profit-first operation:

- `Grid Only Mode` should be a truly neutral mode.
- `Default Mode` should be the mode you want for `PV_CHARGE` and `SELF_CONSUME_FIRST`.
- `Self-Consume Mode` should disable export.

In the current scheduler logic:
- `PV_CHARGE` -> `Default Mode`
- `SELF_CONSUME_FIRST` -> `Default Mode`
- `SELF_CONSUME_ONLY` -> `Self-Consume Mode`
- idle / no schedule -> `Grid Only Mode`

If your inverter uses different semantics, map carefully.  
A bad neutral mode can make the real battery SOC diverge from the optimizer's model.

## Lovelace Card

The card is registered automatically after startup.

Example:

```yaml
type: custom:energy-scheduler-card
title: Energy Scheduler
show_chart: true
show_status_bar: true
chart_height: 250
default_tab: schedule
```

Available card options:

| Option | Default | Meaning |
| --- | --- | --- |
| `title` | `Energy Scheduler` | Card title |
| `show_chart` | `true` | Show price chart |
| `show_status_bar` | `true` | Show optimization/pause controls |
| `chart_height` | `250` | Chart height in pixels |
| `default_tab` | `schedule` | Initial tab |
| `show_ev_tab` | `auto` | Show EV tab always, never, or automatically |
| `price_decimals` | `2` | Decimal precision on the card |

What the card shows:
- hourly buy and sell prices
- PV forecast
- scheduled actions for each hour
- optimization summary
- EV tab when enabled
- consumption profile statistics tab

## Scheduler Actions

The optimizer and manual schedule use these action concepts:

| Action | Meaning |
| --- | --- |
| `CHARGE` | Charge battery from grid |
| `DIS` | Discharge battery / sell to grid |
| `PV_CHARGE` | Cover home with PV and charge battery from PV |
| `SELF_CONSUME_FIRST` | Use energy locally first, export allowed by mapped inverter mode |
| `SELF_CONSUME_ONLY` | Use energy locally, no export |
| `IDL` | Idle / neutral mode, typically `Grid Only` |
| `SOL` | Solar-only export behavior |

On the card, hours are stored as actual schedule entries, so popup editing should show the selected mode for every scheduled hour, including idle hours.

## What the Optimizer Uses as Input

At optimization time it combines:
- hourly buy prices
- hourly sell prices
- current battery SOC
- battery capacity and min SOC
- battery charge/discharge power limits
- PV forecast for today and optionally tomorrow
- home consumption profile or fallback average consumption
- EV demand and EV ready-by constraints, if enabled
- mode mappings

## What the Optimizer Produces

The optimizer produces a plan made of:
- `charge_hours`
- `discharge_hours`
- `idle_hours`
- `solar_hours`
- `pv_charge_hours`
- `self_consume_first_hours`
- `self_consume_only_hours`

It also calculates:
- `estimated_profit`
- `net_plan_profit`
- `gross_discharge_margin`
- `cycle_cost`
- warnings

Notes:
- `estimated_profit` is currently the same as `net_plan_profit`
- `gross_discharge_margin` is the discharge-side margin only

## Entities Created by the Integration

Base scheduling data is exposed through the card/API, not as many standalone entities.

When EV support is enabled, the integration may create:

- `sensor.<name>_ev_charge_reason`
- `sensor.<name>_ev_charge_amps`
- `binary_sensor.<name>_ev_charge_requested`

The amps and requested entities are fallback entities and are only created when direct EV control entities are not configured.

## Services

### `hacs_energy_scheduler.set_schedule`

Create or overwrite one scheduled hour.

| Parameter | Required | Format |
| --- | --- | --- |
| `date` | Yes | `YYYY-MM-DD` |
| `hour` | Yes | `0-23` |
| `action` | Yes | Mode/action string |
| `soc_limit` | No | `0-100` |
| `soc_limit_type` | No | `auto`, `max`, `min` |
| `full_hour` | No | `true` / `false` |
| `minutes` | No | `1-60` |
| `ev_charging` | No | `true` / `false` |

Example:

```yaml
service: hacs_energy_scheduler.set_schedule
data:
  date: "2026-04-16"
  hour: 3
  action: "Buy"
  full_hour: true
```

### `hacs_energy_scheduler.clear_schedule`

Clear one hour or a whole day.

| Parameter | Required | Format |
| --- | --- | --- |
| `date` | Yes | `YYYY-MM-DD` |
| `hour` | No | `0-23` |

### `hacs_energy_scheduler.apply_mode`

Apply one inverter mode immediately.

| Parameter | Required | Format |
| --- | --- | --- |
| `mode` | Yes | Exact inverter mode string |

### `hacs_energy_scheduler.run_optimization`

Run optimizer and write the resulting schedule.

| Parameter | Required | Format |
| --- | --- | --- |
| `hours_ahead` | No | `12-48` |

Example:

```yaml
service: hacs_energy_scheduler.run_optimization
data:
  hours_ahead: 36
```

### `hacs_energy_scheduler.ev_charge_now`

Starts manual EV charging at the configured maximum current.

### `hacs_energy_scheduler.ev_charge_stop`

Stops manual EV charging.

## Automation Modes

The integration has two optimization modes, configurable from the card:

- **`auto`** (default) — optimization re-runs automatically on:
  - price data updates (e.g. Nord Pool publishes tomorrow's prices)
  - PV forecast changes > 10% over the 36h horizon
  - battery SOC changes ≥ 5%
  - EV SOC changes ≥ 5%
  - EV connect/disconnect
  - 1-hour fallback timer (guarantees the schedule is never older than an hour even if no event fires)

  A 60-second debounce prevents event storms from triggering multiple back-to-back runs.

- **`manual`** — no automatic runs. Trigger optimization yourself via the `hacs_energy_scheduler.run_optimization` service (useful when driving the integration from your own automations).

Most users should leave this on `auto`.

## Manual vs Optimized Hours

Hours created manually through the card/API are stored as manual entries.  
When the optimizer writes a new schedule, it preserves those manual hours and only rewrites the rest.

## Storage

Schedule data is stored in Home Assistant storage and survives restarts.

The integration also stores:
- pause state
- optimization interval
- manual flags on hours

## Troubleshooting

### The chart is empty

Check:
- buy/sell sensors exist
- both sensors have a `data` attribute
- the `data` attribute contains future hourly entries

### The optimizer does nothing useful

Check:
- battery SOC sensor is configured and numeric
- battery capacity and min SOC are set correctly
- `Grid Only Mode` is configured if you want neutral idle hours
- `Default Mode` really matches your inverter behavior for `PV_CHARGE` and `SELF_CONSUME_FIRST`
- PV forecast sensor returns future hourly data

### The real inverter behavior does not match the schedule

Check your mode mapping first.  
The most common cause is using a non-neutral inverter mode as idle mode.

For example:
- if idle hours should not drain the battery, map `Grid Only Mode` to a true grid-only inverter mode
- if your default inverter mode secretly discharges the battery, do not use it as idle mode

### The card does not appear

Try:
- full browser refresh
- clearing browser cache
- checking Home Assistant logs for `hacs_energy_scheduler`

## Recommended Minimum Setup

If you want a good first install without EV:

1. Configure buy and sell price sensors.
2. Configure inverter `input_select`.
3. Configure battery SOC, capacity, min SOC, charge/discharge power.
4. Configure `Grid Only Mode`, `Default Mode`, `Sell`, and `Sell Solar Only`.
5. Add a PV forecast sensor.
6. Add a consumption sensor if you have one.
7. Add a `today_production` sensor to enable intra-day reactive correction (recommended).
8. Run a manual optimization for `24` or `36` hours.

## License

MIT. See [LICENSE](LICENSE).
