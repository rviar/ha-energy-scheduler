/**
 * WIRE PROTOCOL — must match
 * `custom_components/hacs_energy_scheduler/const.py:144-149`.
 *
 * These are optimizer-emitted placeholder actions, resolved to real inverter
 * modes at runtime by the backend (`schedule_executor.py:210-227`). The card
 * MUST NOT try to resolve them — placeholders carry presentation semantics
 * (color / icon / label) that real modes lack.
 *
 * When adding a new placeholder on the backend, sync it here AND update the
 * release checklist in CLAUDE.md.
 */
export const PLACEHOLDER_ACTIONS = {
  CHARGE: 'CHARGE',
  PV_CHARGE: 'PV_CHARGE',
  SELF_CONSUME_FIRST: 'SELF_CONSUME_FIRST',
  SELF_CONSUME_ONLY: 'SELF_CONSUME_ONLY',
  PAID_IMPORT: 'PAID_IMPORT',
} as const;

export type PlaceholderAction = (typeof PLACEHOLDER_ACTIONS)[keyof typeof PLACEHOLDER_ACTIONS];

const PLACEHOLDER_SET = new Set<string>(Object.values(PLACEHOLDER_ACTIONS));

export function isPlaceholderAction(action: string | undefined): action is PlaceholderAction {
  return !!action && PLACEHOLDER_SET.has(action);
}

/**
 * Human label for a placeholder, shown in the modal banner when the optimizer
 * chose this slot. Distinct from the ActionType label (which is a display
 * category — e.g. PV_CHARGE and SELF_CONSUME_FIRST both map to category
 * 'pv_charge'/'self_consume' but read differently in the banner).
 */
export const PLACEHOLDER_LABELS: Record<PlaceholderAction, string> = {
  CHARGE: 'Charge (dynamic)',
  PV_CHARGE: 'PV Charge',
  SELF_CONSUME_FIRST: 'Self-Consume First',
  SELF_CONSUME_ONLY: 'Self-Consume Only',
  PAID_IMPORT: 'Paid Import',
};
