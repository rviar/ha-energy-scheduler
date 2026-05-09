# План: Умный оптимизатор энергии для HACS Energy Scheduler

## Обзор

Добавление автоматического оптимизатора, который анализирует цены, прогноз PV и состояние батареи для автоматического создания оптимального расписания зарядки/разрядки.

## Входные данные для оптимизации

### Конфигурация (новые настройки устройства)

#### Батарея

| Параметр                   | Тип    | Описание                                   |
| -------------------------- | ------ | ------------------------------------------ |
| `battery_soc_sensor`       | entity | Сенсор SOC батареи (уже есть в интеграции) |
| `battery_capacity`         | float  | Ёмкость батареи (кВт·ч), например 15       |
| `battery_min_soc`          | int    | Минимальный SOC резерв (%), например 20    |
| `battery_max_charge_power` | float  | Макс. мощность зарядки (кВт), например 6   |
| `battery_cost`             | float  | Стоимость батареи (€)                      |
| `battery_cycles`           | int    | Количество циклов (например 6000)          |

#### Электромобиль (ПОЛНОСТЬЮ ОПЦИОНАЛЬНО)

> ⚠️ Все параметры EV опциональны. Если EV не настроен - алгоритм работает только с батареей.

| Параметр              | Тип    | Обязательный | Описание                                          |
| --------------------- | ------ | ------------ | ------------------------------------------------- |
| `ev_enabled`          | bool   | Нет          | Включить поддержку EV (по умолчанию false)        |
| `ev_soc_sensor`       | entity | Нет\*        | Сенсор SOC электромобиля                          |
| `ev_battery_capacity` | float  | Нет\*        | Ёмкость батареи EV (кВт·ч)                        |
| `ev_max_charge_power` | float  | Нет\*        | Макс. мощность зарядки EV (кВт), например 11      |
| `ev_target_soc`       | int    | Нет\*        | Целевой SOC для EV (%), например 80               |
| `ev_ready_by`         | time   | Нет          | Время готовности EV (опционально), например 07:00 |
| `ev_connected_sensor` | entity | Нет\*        | Сенсор подключения EV                             |

> \*Обязательны только если `ev_enabled = true`

#### Прогноз и потребление

| Параметр             | Тип    | Описание                                |
| -------------------- | ------ | --------------------------------------- |
| `pv_forecast_sensor` | entity | Сенсор Solcast прогноза                 |
| `avg_consumption`    | float  | Среднее потребление (кВт), например 0.6 |

#### Маппинг режимов инвертора

| Параметр                     | Тип    | Описание                                   |
| ---------------------------- | ------ | ------------------------------------------ |
| `mode_charge_battery`        | string | Режим "Зарядка батареи от сети"            |
| `mode_charge_ev`             | string | Режим "Зарядка EV"                         |
| `mode_charge_ev_and_battery` | string | Режим "Зарядка EV + батареи"               |
| `mode_sell`                  | string | Режим "Продажа в сеть" (разряд батареи)    |
| `mode_sell_solar_only`       | string | Режим "Продажа только с панелей"           |
| `mode_grid_only`             | string | Режим "Только сеть" (не разряжать батарею) |
| `mode_default`               | string | Режим по умолчанию                         |

#### Автоматизация

| Параметр            | Тип    | Описание                                             |
| ------------------- | ------ | ---------------------------------------------------- |
| `auto_optimize`     | bool   | Автоматически запускать оптимизацию                  |
| `optimize_interval` | select | Интервал: "manual" / "hourly" / "every_6h" / "daily" |

### Данные в реальном времени

- Цены покупки/продажи (уже есть в интеграции)
- Текущий SOC батареи (уже есть)
- Прогноз PV из Solcast (почасовой или дневной)
- SOC электромобиля (если подключен)

## Алгоритм оптимизации

### Этап 1: Сбор данных

```python
def collect_optimization_data():
    # Цены на весь доступный горизонт (24-48ч)
    buy_prices = get_hourly_prices("buy")  # [{hour, price}, ...]
    sell_prices = get_hourly_prices("sell")

    # Прогноз PV (почасовой)
    pv_forecast = get_pv_forecast()  # [{hour, kwh}, ...]

    # Текущее состояние
    current_soc = get_battery_soc()  # %
    ev_soc = get_ev_soc() if ev_connected() else None

    return {buy_prices, sell_prices, pv_forecast, current_soc, ev_soc}
```

### Этап 2: Расчёт энергобаланса

```python
def calculate_energy_balance(hours_ahead):
    # Сколько энергии нужно
    consumption = hours_ahead * avg_consumption  # кВт·ч

    # Сколько будет от солнца
    solar_production = sum(pv_forecast[0:hours_ahead])  # кВт·ч

    # Сколько доступно в батарее
    usable_battery = battery_capacity * (current_soc - min_soc) / 100  # кВт·ч

    # Дефицит (нужно купить)
    deficit = max(0, consumption - solar_production - usable_battery)

    # Если EV включен в настройках И подключен - добавить его потребность
    if ev_enabled and ev_connected():
        ev_need = ev_capacity * (target_ev_soc - ev_soc) / 100
        deficit += ev_need

    return deficit
```

### Этап 3: Расчёт стоимости цикла

```python
def calculate_cycle_cost():
    # Стоимость одного полного цикла
    cost_per_cycle = battery_cost / battery_cycles

    # Стоимость на кВт·ч (цикл = 2 × ёмкость: заряд + разряд)
    cost_per_kwh = cost_per_cycle / (battery_capacity * 2)

    return cost_per_kwh  # €/кВт·ч
```

### Этап 4: Выбор оптимальных часов

```python
def optimize_schedule():
    cycle_cost = calculate_cycle_cost()
    deficit = calculate_energy_balance(planning_horizon)

    # Эффективная цена покупки = цена + стоимость цикла
    effective_buy_prices = [
        {"hour": h, "price": p + cycle_cost}
        for h, p in buy_prices
    ]

    # Сортируем по эффективной цене
    sorted_hours = sorted(effective_buy_prices, key=lambda x: x["price"])

    # Сколько часов нужно для покупки дефицита
    charge_power = battery_max_charge_power
    if ev_connected:
        charge_power += ev_max_charge_power  # Можно заряжать параллельно

    hours_needed = ceil(deficit / charge_power)

    # Выбираем самые дешёвые часы
    charge_hours = sorted_hours[0:hours_needed]

    # Определяем часы для продажи
    # Продавать выгодно если: цена_продажи > мин_цена_покупки + 2×cycle_cost
    min_buy_price = sorted_hours[0]["price"]
    discharge_threshold = min_buy_price + 2 * cycle_cost

    discharge_hours = [
        h for h in sell_prices
        if h["price"] > discharge_threshold
        and h["hour"] not in [c["hour"] for c in charge_hours]
        and pv_forecast[h["hour"]] == 0  # Не продавать когда есть солнце
    ]

    # Часы с солнцем - режим Solar Only
    solar_hours = [h for h in range(24) if pv_forecast[h] > 0.1]

    return {
        "charge_hours": charge_hours,      # Режим Charge
        "discharge_hours": discharge_hours, # Режим Discharge
        "solar_hours": solar_hours,         # Режим Solar Only
        # Остальные часы - Default
    }
```

### Этап 5: Выбор режима зарядки

```python
def select_charge_mode(hour):
    """
    Логика выбора режима для часа зарядки:

    Если EV НЕ настроен (ev_enabled = false):
        → mode_charge_battery (только батарея)

    Если EV настроен (ev_enabled = true):
        1. EV подключен + батарея не полная → mode_charge_ev_and_battery
        2. EV подключен + батарея полная   → mode_charge_ev
        3. EV не подключен                 → mode_charge_battery (только батарея)
    """
    battery_soc = get_sensor_state(battery_soc_sensor)
    battery_full = battery_soc >= 100  # или target_battery_soc

    # Если EV не настроен - всегда заряжаем только батарею
    if not ev_enabled:
        return mode_charge_battery

    # EV настроен - проверяем подключение
    ev_connected = get_sensor_state(ev_connected_sensor)

    if ev_connected:
        if battery_full:
            return mode_charge_ev          # Только EV
        else:
            return mode_charge_ev_and_battery  # EV + Батарея
    else:
        return mode_charge_battery         # Только батарея
```

### Этап 6: Применение расписания

```python
def apply_optimized_schedule():
    schedule = optimize_schedule()

    for hour_data in schedule["charge_hours"]:
        hour = hour_data["hour"]
        date = hour_data["date"]

        # Режим определяется динамически при выполнении расписания
        # Сохраняем флаг "это час зарядки" и определяем режим в момент выполнения
        set_schedule(
            date, hour,
            action="CHARGE",  # Специальный флаг, режим выберется динамически
            soc_limit=100,
            soc_limit_type="max"
        )

    for hour_data in schedule["discharge_hours"]:
        set_schedule(date, hour, mode_discharge, soc_limit=min_soc, soc_limit_type="min")

    for hour in schedule["solar_hours"]:
        set_schedule(date, hour, mode_solar_only)
```

### Динамическое определение режима (в coordinator.py)

```python
async def _async_apply_scheduled_action(self, schedule_entry):
    """
    При выполнении расписания проверяем текущее состояние
    и выбираем правильный режим
    """
    action = schedule_entry.get("action")

    if action == "CHARGE":
        # Динамически определяем режим зарядки
        mode = self._select_charge_mode()
    else:
        mode = action

    await self._async_apply_mode(mode)
```

## Обработка edge cases

### Экстренная зарядка (батарея разряжена, дешёвые часы далеко)

```python
def check_emergency_charge():
    """
    Проверяем: хватит ли энергии дожить до ближайшего дешёвого часа?

    Пример:
    - Текущий SOC: 25%, мин. SOC: 20% → доступно 5% = 0.75 кВт·ч
    - Потребление: 0.6 кВт/ч
    - Ближайший дешёвый час через 7 часов
    - Нужно: 7ч × 0.6 = 4.2 кВт·ч
    - Дефицит: 4.2 - 0.75 = 3.45 кВт·ч → НУЖНА ЭКСТРЕННАЯ ЗАРЯДКА
    """

    current_soc = get_battery_soc()
    available_energy = battery_capacity * (current_soc - min_soc) / 100

    # Найти ближайший запланированный час зарядки
    next_charge_hour = get_next_scheduled_charge()
    hours_until_charge = next_charge_hour - current_hour

    # Учесть прогноз PV до этого часа
    pv_until_charge = sum(pv_forecast[current_hour:next_charge_hour])

    # Сколько энергии нужно чтобы дожить
    energy_needed = hours_until_charge * avg_consumption
    energy_available = available_energy + pv_until_charge

    if energy_needed > energy_available:
        # ЭКСТРЕННАЯ ЗАРЯДКА - заряжаем СЕЙЧАС несмотря на цену
        emergency_hours_needed = ceil((energy_needed - energy_available) / battery_max_charge_power)

        # Выбираем самые дешёвые часы ДО следующего запланированного заряда
        immediate_hours = range(current_hour, next_charge_hour)
        cheapest_immediate = sorted(immediate_hours, key=get_price)[:emergency_hours_needed]

        return {
            "emergency": True,
            "hours": cheapest_immediate,
            "reason": f"SOC {current_soc}% недостаточен для {hours_until_charge}ч ожидания"
        }

    return {"emergency": False}
```

### Логика в основном алгоритме

```python
def optimize_schedule():
    # Сначала проверяем экстренную ситуацию
    emergency = check_emergency_charge()

    if emergency["emergency"]:
        # Добавляем экстренные часы к зарядке
        charge_hours = emergency["hours"] + normal_cheap_hours
        # Логировать причину
        log_warning(f"Экстренная зарядка: {emergency['reason']}")
    else:
        charge_hours = normal_cheap_hours

    # ... остальная логика
```

### Пример сценария

| Время | Цена  | SOC | Действие                                                                |
| ----- | ----- | --- | ----------------------------------------------------------------------- |
| 18:00 | 0.25€ | 25% | Проверка: до 02:00 (дешёвый час) = 8ч, нужно 4.8 кВт·ч, есть 0.75 кВт·ч |
| 18:00 | 0.25€ | 25% | **ЭКСТРЕННАЯ ЗАРЯДКА** - выбираем самый дешёвый час до 02:00            |
| 19:00 | 0.22€ | 25% | ← Это самый дешёвый час из ближайших, заряжаем здесь                    |
| 20:00 | 0.28€ | 35% | Default (уже зарядили достаточно чтобы дожить)                          |
| ...   | ...   | ... | ...                                                                     |
| 02:00 | 0.03€ | 22% | Плановая зарядка (дешёвый час)                                          |

### Если нет прогноза PV (сенсор недоступен)

```python
def get_pv_forecast():
    if pv_forecast_sensor is None or unavailable:
        return [0] * 24  # Считаем что генерации не будет
    # ... нормальная логика
```

### Если задано время готовности EV

```python
def optimize_ev_charging():
    if ev_ready_by:
        # Ограничить часы зарядки EV только до времени отъезда
        available_hours = [h for h in all_hours if h < ev_ready_by_hour]
        # Рассчитать сколько часов нужно для зарядки EV
        ev_energy_needed = ev_capacity * (target_soc - current_soc) / 100
        hours_needed = ceil(ev_energy_needed / ev_max_charge_power)
        # Выбрать самые дешёвые часы ДО времени отъезда
        ev_charge_hours = sorted(available_hours, key=price)[:hours_needed]
```

## Симуляция суточной работы

### Исходные данные для симуляции

```
Батарея: 15 кВт·ч, текущий SOC: 40%, мин. SOC: 20%
Мощность зарядки: 6 кВт/ч
Потребление: 0.6 кВт/ч
Стоимость цикла: 0.02€/кВт·ч (батарея 3000€, 6000 циклов)
EV: подключен с 18:00, SOC 30%, ёмкость 60 кВт·ч, цель 80%, мощность 11 кВт
Время готовности EV: 07:00
```

### Симуляция: Пасмурный зимний день

| Час   | Цена Buy  | Цена Sell | PV прогноз | SOC бат | EV SOC | Действие        | Результат            |
| ----- | --------- | --------- | ---------- | ------- | ------ | --------------- | -------------------- |
| 00:00 | 0.08€     | 0.06€     | 0          | 40%     | -      | Default         | SOC → 36%            |
| 01:00 | 0.05€     | 0.03€     | 0          | 36%     | -      | Default         | SOC → 32%            |
| 02:00 | **0.02€** | 0.01€     | 0          | 32%     | -      | **CHARGE**      | SOC → 72% (+6кВт)    |
| 03:00 | **0.03€** | 0.02€     | 0          | 72%     | -      | **CHARGE**      | SOC → 100% (+4.2кВт) |
| 04:00 | 0.04€     | 0.03€     | 0          | 100%    | -      | Default         | SOC → 96%            |
| 05:00 | 0.06€     | 0.04€     | 0          | 96%     | -      | Default         | SOC → 92%            |
| 06:00 | 0.10€     | 0.08€     | 0          | 92%     | -      | Default         | SOC → 88%            |
| 07:00 | 0.15€     | 0.12€     | 0.1        | 88%     | -      | Default         | SOC → 84.7%          |
| 08:00 | 0.18€     | 0.15€     | 0.3        | 84.7%   | -      | sell_solar_only | SOC → 82%            |
| 09:00 | 0.20€     | 0.17€     | 0.5        | 82%     | -      | sell_solar_only | SOC → 79.3%          |
| 10:00 | 0.22€     | 0.19€     | 0.6        | 79.3%   | -      | sell_solar_only | SOC → 76.6%          |
| 11:00 | 0.25€     | 0.22€     | 0.5        | 76.6%   | -      | sell_solar_only | SOC → 74%            |
| 12:00 | 0.23€     | 0.20€     | 0.4        | 74%     | -      | sell_solar_only | SOC → 71.3%          |
| 13:00 | 0.20€     | 0.17€     | 0.3        | 71.3%   | -      | Default         | SOC → 68.6%          |
| 14:00 | 0.18€     | 0.15€     | 0.2        | 68.6%   | -      | Default         | SOC → 66%            |
| 15:00 | 0.16€     | 0.13€     | 0.1        | 66%     | -      | Default         | SOC → 63.3%          |
| 16:00 | 0.20€     | 0.17€     | 0          | 63.3%   | -      | Default         | SOC → 59.3%          |
| 17:00 | **0.28€** | **0.25€** | 0          | 59.3%   | -      | **SELL**        | SOC → 20% (-5.9кВт)  |
| 18:00 | **0.30€** | **0.27€** | 0          | 20%     | 30%    | **GRID_ONLY**   | EV подключен!        |
| 19:00 | 0.25€     | 0.22€     | 0          | 20%     | 30%    | Default         | Берём из сети        |
| 20:00 | 0.20€     | 0.17€     | 0          | 20%     | 30%    | Default         | Берём из сети        |
| 21:00 | 0.15€     | 0.12€     | 0          | 20%     | 30%    | Default         | Берём из сети        |
| 22:00 | 0.10€     | 0.08€     | 0          | 20%     | 30%    | Default         | Берём из сети        |
| 23:00 | 0.08€     | 0.06€     | 0          | 20%     | 30%    | Default         | Берём из сети        |

**Следующий день 00:00-07:00 (EV нужно зарядить до 07:00):**

| Час   | Цена      | Действие                  | Результат                 |
| ----- | --------- | ------------------------- | ------------------------- |
| 00:00 | 0.06€     | Default                   | -                         |
| 01:00 | 0.04€     | **CHARGE_EV_AND_BATTERY** | EV: 30→48%, Bat: 20→60%   |
| 02:00 | **0.02€** | **CHARGE_EV_AND_BATTERY** | EV: 48→66%, Bat: 60→100%  |
| 03:00 | **0.03€** | **CHARGE_EV**             | EV: 66→84% (>80% цель)    |
| 04:00 | 0.05€     | Default                   | EV готов!                 |
| 05:00 | 0.07€     | Default                   | -                         |
| 06:00 | 0.10€     | Default                   | -                         |
| 07:00 | -         | EV отключается            | EV SOC: 84%, Bat SOC: 96% |

### Выявленные Edge Cases

#### ❌ Edge Case 1: Батарея разряжена до мин. SOC, а дешёвые часы далеко

**Сценарий:** 18:00, SOC 20% (мин.), до дешёвого часа (02:00) 8 часов
**Проблема:** Нужно 8ч × 0.6кВт = 4.8 кВт·ч, но в батарее 0 доступно
**Решение:** ✅ Уже есть - экстренная зарядка

#### ❌ Edge Case 2: EV подключили в дорогой час

**Сценарий:** 18:00, цена 0.30€, EV подключен
**Проблема:** Алгоритм может начать заряжать EV сразу
**Решение:** Нужно добавить! EV ждёт дешёвых часов, если есть время до `ev_ready_by`

#### ❌ Edge Case 3: EV нужно зарядить срочно (мало времени)

**Сценарий:** EV подключен в 05:00, ready_by 07:00, SOC 20%, нужно 80%
**Проблема:** Только 2 часа, а нужно (60кВт×60%)/11кВт = 3.3 часа
**Решение:** Нужно добавить! Предупреждение + начать заряжать сразу

#### ❌ Edge Case 4: Солнечный день - батарея заряжается от PV

**Сценарий:** PV генерирует 5 кВт·ч, батарея заполняется
**Проблема:** Алгоритм может всё равно планировать ночную зарядку
**Решение:** Нужно добавить! Если PV хватит на завтра - не заряжать ночью

#### ❌ Edge Case 5: Цена продажи выше цены покупки

**Сценарий:** Buy 0.10€, Sell 0.15€ (редко, но бывает)
**Проблема:** Выгоднее купить и сразу продать
**Решение:** Добавить проверку на арбитраж (обычно это ошибка данных)

#### ❌ Edge Case 6: Нет данных о ценах

**Сценарий:** Сенсор цен недоступен или пустой
**Проблема:** Алгоритм не может работать
**Решение:** Нужно добавить! Fallback на mode_default

#### ❌ Edge Case 7: EV отключили раньше времени

**Сценарий:** EV был подключен, оптимизатор запланировал зарядку на 02:00-04:00, но EV отключили в 01:00
**Проблема:** Расписание устарело
**Решение:** Нужно добавить! Слушать событие отключения EV и пересчитывать расписание

#### ❌ Edge Case 8: Батарея уже полная, а час дешёвый

**Сценарий:** SOC 100%, дешёвый час 02:00
**Проблема:** Нет смысла "заряжать"
**Решение:** ✅ Уже есть - select_charge_mode проверяет battery_full

#### ❌ Edge Case 9: Переход через полночь

**Сценарий:** Оптимизация в 23:00, нужно запланировать на 00:00-03:00 следующего дня
**Проблема:** Даты меняются
**Решение:** Нужно проверить! Использовать datetime вместо просто hour

#### ❌ Edge Case 10: Мощность сети ограничена

**Сценарий:** EV 11кВт + батарея 6кВт = 17кВт, но сеть даёт макс 15кВт
**Проблема:** Нельзя заряжать оба на полную мощность одновременно
**Решение:** Нужно добавить! `max_grid_power` настройка

## Дополнения к алгоритму

### Добавить в конфигурацию

| Параметр         | Тип   | Описание                                  |
| ---------------- | ----- | ----------------------------------------- |
| `max_grid_power` | float | Макс. мощность от сети (кВт), например 15 |

### Добавить обработку edge cases

```python
def validate_optimization():
    """Проверки перед применением оптимизации"""

    # Edge Case 6: Нет данных о ценах
    if not buy_prices or len(buy_prices) == 0:
        log_error("Нет данных о ценах, используем mode_default")
        return None

    # Edge Case 5: Проверка на арбитраж
    for hour in range(24):
        if sell_price[hour] > buy_price[hour]:
            log_warning(f"Аномалия цен в {hour}:00 - sell > buy")

    return True


def check_ev_charging_feasibility():
    """Edge Case 3: Проверка возможности зарядить EV вовремя"""
    if not ev_connected or not ev_ready_by:
        return True

    hours_available = ev_ready_by_hour - current_hour
    if hours_available < 0:
        hours_available += 24  # Переход через полночь

    ev_energy_needed = ev_capacity * (ev_target_soc - ev_soc) / 100
    hours_needed = ev_energy_needed / ev_max_charge_power

    if hours_needed > hours_available:
        log_warning(f"EV: нужно {hours_needed:.1f}ч, доступно {hours_available}ч - срочная зарядка!")
        return False  # Начать заряжать сразу

    return True


def should_skip_night_charge():
    """Edge Case 4: Солнечный день - не нужна ночная зарядка"""
    tomorrow_pv = sum(pv_forecast[6:18])  # Прогноз на световой день
    tomorrow_consumption = 12 * avg_consumption  # 12 часов дня

    if tomorrow_pv > tomorrow_consumption * 1.2:  # 20% запас
        log_info(f"Достаточно PV ({tomorrow_pv:.1f} кВт·ч), ночная зарядка не нужна")
        return True

    return False


def handle_ev_disconnect():
    """Edge Case 7: EV отключили - пересчитать расписание"""
    # Вызывается при изменении ev_connected_sensor
    if was_connected and not is_connected:
        log_info("EV отключен, пересчитываем расписание")
        clear_ev_charging_hours()
        run_optimization()


def calculate_effective_charge_power():
    """Edge Case 10: Ограничение мощности сети"""
    total_needed = 0

    if need_charge_battery:
        total_needed += battery_max_charge_power

    if ev_connected and need_charge_ev:
        total_needed += ev_max_charge_power

    if total_needed > max_grid_power:
        # Приоритет: сначала батарея, потом EV (или наоборот?)
        # Или пропорционально
        battery_power = min(battery_max_charge_power, max_grid_power * 0.4)
        ev_power = max_grid_power - battery_power
        return battery_power, ev_power

    return battery_max_charge_power, ev_max_charge_power
```

## Архитектура реализации

### Новые файлы

```
custom_components/energy_scheduler_pstryk/
├── optimizer.py          # Класс EnergyOptimizer с алгоритмом
├── pv_forecast.py        # Парсер данных Solcast
```

### Изменения в существующих файлах

| Файл             | Изменения                              |
| ---------------- | -------------------------------------- |
| `const.py`       | Добавить константы для новых настроек  |
| `config_flow.py` | Добавить шаг конфигурации оптимизатора |
| `coordinator.py` | Интегрировать вызов оптимизатора       |
| `__init__.py`    | Добавить сервис `run_optimization`     |
| `services.yaml`  | Описание нового сервиса                |

### Новый сервис

```yaml
run_optimization:
  name: Run Energy Optimization
  description: Анализирует цены и прогноз, создаёт оптимальное расписание
  fields:
    hours_ahead:
      name: Planning horizon
      description: Количество часов для планирования
      default: 24
      selector:
        number:
          min: 12
          max: 48
```

## План реализации

### Фаза 1: Конфигурация

1. Добавить новые константы в `const.py`
2. Расширить `config_flow.py` для настройки параметров оптимизатора
3. Добавить валидацию entity selectors для PV и EV сенсоров

### Фаза 2: Парсер PV прогноза

1. Создать `pv_forecast.py` для работы с Solcast
2. Поддержка почасового прогноза из атрибутов сенсора
3. Fallback на равномерное распределение если нет почасовых данных

### Фаза 3: Оптимизатор

1. Создать `optimizer.py` с классом `EnergyOptimizer`
2. Реализовать алгоритм расчёта энергобаланса
3. Реализовать выбор оптимальных часов
4. Добавить расчёт стоимости цикла батареи

### Фаза 4: Интеграция

1. Добавить сервис `run_optimization` в `__init__.py`
2. Интегрировать с `coordinator.py` для автоматического запуска
3. Опционально: автозапуск при появлении новых цен (13:00-14:00)

### Фаза 5: UI (опционально)

1. Добавить визуализацию оптимизации в карточку
2. Показать прогноз PV на графике
3. Отметить часы покупки/продажи разными цветами

## Критические файлы для модификации

1. **const.py** - новые константы конфигурации
2. **config_flow.py** - UI настройки оптимизатора
3. **coordinator.py** - интеграция оптимизатора в цикл обновления
4. ****init**.py** - регистрация нового сервиса
5. **services.yaml** - описание сервиса

## Пример работы оптимизатора

**Входные данные:**

- Батарея: 15 кВт·ч, SOC 30%, мин. SOC 20%
- Прогноз PV на завтра: 2 кВт·ч (пасмурно)
- Потребление: 0.6 кВт × 24ч = 14.4 кВт·ч
- EV: подключен, SOC 40%, нужно до 80%

**Расчёт:**

- Доступно в батарее: 15 × (30-20)/100 = 1.5 кВт·ч
- Нужно для дома: 14.4 - 2 - 1.5 = 10.9 кВт·ч
- Нужно для EV: 60 × (80-40)/100 = 24 кВт·ч
- **Итого дефицит: 34.9 кВт·ч**

**Часы зарядки (6 кВт бат + 11 кВт EV = 17 кВт):**

- Нужно: 34.9 ÷ 17 ≈ 2.1 часа → 3 часа
- Выбираем 3 самых дешёвых часа → 02:00, 03:00, 04:00

**Результат расписания:**
| Час | Режим | Причина |
|-----|-------|---------|
| 02:00-05:00 | EV+Battery Charge | Самые дешёвые часы |
| 10:00-16:00 | Solar Only | Есть генерация PV |
| 18:00-21:00 | Discharge | Дорогие часы, выгодно продать |
| Остальные | Default | Самопотребление |
