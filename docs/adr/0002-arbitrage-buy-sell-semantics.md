# Семантика «Buy hours» и «Sell hours» в Arbitrage-панели карточки

## Контекст

`stats-tab` карточки рендерит блок «Arbitrage» с двумя списками — слоты-покупки (`_getChargeHours()`) и слоты-продажи (`_getDischargeHours()`). Текущая фильтрация:

```ts
// _getChargeHours
if (e.action === 'CHARGE' || e.action === this.integrationConfig?.mode_charge_battery) { ... }

// _getDischargeHours
if ((entry as ScheduleEntry).action === sellMode) { ... }   // sellMode = mode_sell
```

То есть в списки попадают только слоты, где явно заряжается **battery** или явно идёт **battery → grid** через `mode_sell`. Из учёта молча выпадают:

- `mode_charge_ev` — грид заряжает только EV;
- `mode_charge_ev_and_battery` — грид заряжает EV и батарею;
- `mode_sell_solar_only` — экспорт солнечной выработки в грид без участия батареи;
- `ACTION_PAID_IMPORT` — отрицательная цена, грид платит за приём (доходная статья импорта).

Это не задокументировано как осознанный выбор — больше похоже на копипаст-омиссию. Параллельно та же логика «что это за слот» уже централизована в `helpers.ts:resolveActionType`, который stats-tab не использует, а инлайнит свой собственный string-match. Это та же история дублирования, что и `_resolveAction` в `hour-modal.ts`, только в другой проекции.

Семантика «арбитража» с точки зрения юзера: «в какие часы я заплатил гриду» (расходная сторона) и «в какие часы грид заплатил мне» (доходная сторона) — независимо от того, куда конкретно ушли электроны (battery / EV / direct self-consume / curtailment). Эта семантика согласуется с расчётом `estimated_profit`, который бэк уже делает на полном наборе режимов.

## Решение

`stats-tab` перестаёт держать собственный string-match. Вместо этого в `helpers.ts` появляются два предиката, и stats-tab вызывает только их:

```ts
// helpers.ts (новые публичные функции)
export function isBuyHour(entry: ScheduleEntry, config: IntegrationConfig): boolean;
export function isSellHour(entry: ScheduleEntry, config: IntegrationConfig): boolean;
```

**`isBuyHour` = true**, если действие слота приводит к платному (или платящему) импорту с грида:

- `ACTION_CHARGE` (placeholder, резолвится в `mode_charge_battery`)
- `config.mode_charge_battery`
- `config.mode_charge_ev`
- `config.mode_charge_ev_and_battery`
- `ACTION_PAID_IMPORT` (отрицательная цена — грид *платит* за приём; знак учитывается в цене, не в фильтре)

**`isSellHour` = true**, если действие слота приводит к экспорту в грид:

- `config.mode_sell` (battery → grid)
- `config.mode_sell_solar_only` (PV → grid без батареи)

**Не попадают ни в одну категорию:**

- `ACTION_PV_CHARGE` / `ACTION_SELF_CONSUME_FIRST` / `ACTION_SELF_CONSUME_ONLY` / `config.mode_self_consume` — нет обмена с гридом (или несущественный остаточный self-consume).
- `config.mode_grid_only` (без `ACTION_PAID_IMPORT`-контекста) — нейтральный режим: дом ест с грида, но это не «целевая» покупка ради хранения.
- `config.default_mode` без явного действия — idle.

Цена для отображения берётся как и сейчас: `buy_prices` для buy-часов, `sell_prices` для sell-часов. Поля `last_optimization.charge_hours` / `discharge_hours` (числовые), приходящие с бэка, не меняются — это отдельная метрика и её ADR не трогает.

Placeholder-строки (`ACTION_CHARGE`, `ACTION_PV_CHARGE`, …) импортируются из единого TS-модуля `src/utils/action-constants.ts`, который вручную синкается с `custom_components/hacs_energy_scheduler/const.py:144-149` (см. CLAUDE.md, release-чеклист).

## Рассмотренные альтернативы

- **Оставить текущее поведение, только подменить голый литерал `'CHARGE'` на константу.** Отклонено: мажет фасад, но не лечит домен-дыру (EV-only и solar-only продолжают выпадать). Юзер с активным EV-flow или без батареи буквально не видит свою экономику в карточке.
- **Считать арбитраж исключительно `battery_charge` ↔ `battery_discharge` (вариант B на грилинге).** Технически согласованно — арбитраж = «купить дёшево, продать дорого тем же активом». Отклонено: (а) `mode_sell_solar_only` всё равно даёт доход и юзер ожидает его увидеть; (б) `mode_charge_ev` использует ту же дешёвую цену, что и `mode_charge_battery` — для целей «когда я тратился» это симметрично; (в) разделение «арбитраж» / «не арбитраж» по типу хранилища требовало бы ещё одной отдельной панели «EV cost / Solar revenue», что усложняет UI без явного запроса.
- **Перенести расчёт списков на бэк** (`last_optimization.buy_hours: [{date, hour, price}, …]`). Отложено: расширение payload, миграция формата, версионирование на стороне бэка. Двух предикатов в `helpers.ts` достаточно, пока списки нужны только карточке. Если в будущем появится экспорт CSV / репорт по email — пересмотреть.
- **Использовать `resolveActionType(...) === 'charge'` / `=== 'discharge'`.** Отклонено: `resolveActionType` возвращает `charge_ev` для EV-зарядки, и попытка добавить `charge_ev` в buy-список ломает семантику самой функции (она про **визуальную категорию**, не про **экономический поток**). Двух разных функций для двух разных вопросов — корректнее, чем перегружать одну.

## Последствия

- **Поведение меняется для пользователей.** После релиза в панели «Arbitrage» появляются часы, которых раньше не было видно (EV-only charge, solar-only export, paid-import). Это видимое UI-изменение → версия должна быть **minor** (по правилам CLAUDE.md для pre-1.0).
- Релиз-нотес фиксирует: «Arbitrage panel now reflects EV charge hours, solar-only export hours, and negative-price import hours».
- `helpers.ts` обзаводится двумя новыми экспортами; `stats-tab.ts:_getChargeHours/_getDischargeHours` сокращаются до фильтра через эти предикаты + сортировки/маппинга.
- Голый литерал `'CHARGE'` в `stats-tab.ts:169` исчезает — заменяется импортом константы из `action-constants.ts` (используется внутри `isBuyHour`).
- Бэк не меняется. `estimated_profit` и `cycle_cost` остаются как есть; они уже считаются на полном наборе режимов.
- Появление нового inverter mode на бэке требует обновления списков внутри `isBuyHour`/`isSellHour` (одно место, рядом с `resolveActionType`). Конфигурационные имена режимов (`config.mode_*`) остаются конфигурируемыми; placeholder-строки — нет.
