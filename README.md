# Energy Scheduler Pstryk

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/rviar/energy_scheduler_pstryk.svg)](https://github.com/rviar/energy_scheduler_pstryk/releases)

A Home Assistant integration for scheduling energy actions based on hourly electricity prices from the Pstryk API.

## Features

- **Real-time Price Visualization**: Interactive line chart showing buy and sell electricity prices
- **Hourly Action Scheduling**: Click on any hour to schedule specific inverter modes
- **Flexible Action Parameters**:
  - SOC (State of Charge) limits - action stops when battery reaches target
  - Full hour execution
  - Custom minute duration
- **Automatic Mode Switching**: Returns to default mode after scheduled actions complete
- **Persistent Storage**: Schedules are saved and survive restarts
- **Responsive UI**: Works on desktop and mobile devices

## Prerequisites

Before installing, ensure you have:

1. **Pstryk sensors configured** with `data` attributes containing hourly prices:
   - `sensor.energy_price_buy` - Buy prices
   - `sensor.energy_price_sell` - Sell prices

2. **Inverter mode input_select** (e.g., `input_select.inverter_mode`) with your available modes

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on "Integrations"
3. Click the three dots menu (⋮) → "Custom repositories"
4. Add `https://github.com/rviar/energy_scheduler_pstryk` with category "Integration"
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download the latest release
2. Copy `custom_components/energy_scheduler_pstryk` to your `config/custom_components/` directory
3. Copy `www/energy_scheduler_pstryk` to your `config/www/` directory
4. Restart Home Assistant

## Configuration

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Energy Scheduler Pstryk"
4. Configure the integration:
   - **Buy Price Sensor**: Sensor with buy prices (default: `sensor.energy_price_buy`)
   - **Sell Price Sensor**: Sensor with sell prices (default: `sensor.energy_price_sell`)
   - **Inverter Mode Entity**: Input select controlling inverter modes
   - **SOC Sensor** (optional): Battery state of charge sensor
5. Select your **Default Mode** - the mode to return to after scheduled actions

## Usage

### Option 1: Sidebar Panel

After installation, a new **Energy Scheduler** item appears in the sidebar. Click it to open the full scheduling interface.

### Option 2: Lovelace Card

You can also add the scheduler as a card on any dashboard:

1. Go to **Settings** → **Dashboards** → **Resources**
2. Add resource: `/api/energy_scheduler_pstryk/static/energy-scheduler-card.js` (type: JavaScript Module)
3. Add card to your dashboard:

```yaml
type: custom:energy-scheduler-card
title: Energy Scheduler
show_chart: true
show_schedule: true
chart_height: 250
```

**Card Configuration Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `title` | Energy Scheduler | Card title |
| `show_chart` | true | Show price chart |
| `show_schedule` | true | Show hourly schedule grid |
| `chart_height` | 250 | Chart height in pixels |

### Scheduling Actions

1. **View prices** on the chart - blue line for buy prices, green for sell prices
2. **Click on any hour** (on the chart or in the grid below) to open the scheduling dialog
3. **Select an action/mode** from the dropdown
4. **Configure parameters** (if action is not the default mode):
   - **SOC Limit**: Action stops when battery reaches this percentage
   - **Full Hour**: Run for the entire hour
   - **Minutes**: Run for a specific number of minutes
5. **Save** your schedule

### Understanding the Schedule Logic

- **SOC Limit**: If battery SOC reaches the limit before the hour ends, the system automatically switches to the default mode
- **Minutes**: Action runs for the specified duration, then switches to default mode
- **No Schedule for Hour**: If the current hour has no schedule and the previous hour had an action, the system switches to default mode

## Services

The integration provides the following services:

### `energy_scheduler_pstryk.set_schedule`

Set a scheduled action for a specific hour.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `date` | Yes | Date in YYYY-MM-DD format |
| `hour` | Yes | Hour (0-23) |
| `action` | Yes | Mode/action name |
| `soc_limit` | No | SOC limit (0-100%) |
| `full_hour` | No | Run for full hour (boolean) |
| `minutes` | No | Minutes to run (1-60) |

### `energy_scheduler_pstryk.clear_schedule`

Clear scheduled actions.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `date` | Yes | Date in YYYY-MM-DD format |
| `hour` | No | Specific hour to clear (clears entire day if not specified) |

### `energy_scheduler_pstryk.apply_mode`

Immediately apply an inverter mode.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `mode` | Yes | Mode name to apply |

## Sensor Data Format

The price sensors must have a `data` attribute with the following structure:

```yaml
data:
  - end: '2025-11-26T00:00:00Z'
    start: '2025-11-25T23:00:00Z'
    value: 0.52
  - end: '2025-11-26T01:00:00Z'
    start: '2025-11-26T00:00:00Z'
    value: 0.52
```

Times are in UTC and will be automatically converted to your Home Assistant timezone.

## Storage

Schedules are stored in `.storage/energy_scheduler_pstryk_schedule` and automatically cleaned up after 7 days.

## Troubleshooting

### No data on chart
- Check that your price sensors exist and have the `data` attribute
- Verify the sensors have data for the selected date

### Panel not showing
- Clear your browser cache
- Check Home Assistant logs for errors
- Ensure `www/energy_scheduler_pstryk` directory exists

### Actions not applying
- Verify your `input_select` entity exists and has the correct options
- Check that the selected action matches an available option

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Pstryk](https://pstryk.pl) for providing the energy price API
- Home Assistant community for inspiration and support
# ha-energy-scheduler
