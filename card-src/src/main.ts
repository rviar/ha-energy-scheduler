/**
 * Energy Scheduler Card v3 for Home Assistant
 * Built with Lit + TypeScript + Vite
 */

import { EnergySchedulerCard } from './components/energy-scheduler-card';
import { EnergySchedulerCardEditor } from './components/energy-scheduler-card-editor';
import { CARD_VERSION } from './utils/version';
const CARD_TYPE = 'energy-scheduler-card';
const EDITOR_TYPE = 'energy-scheduler-card-editor';

window.EnergySchedulerCard = EnergySchedulerCard;
window.EnergySchedulerCardEditor = EnergySchedulerCardEditor;

function registerElements(): boolean {
  try {
    if (!customElements.get(CARD_TYPE)) {
      customElements.define(CARD_TYPE, EnergySchedulerCard);
    }
    if (!customElements.get(EDITOR_TYPE)) {
      customElements.define(EDITOR_TYPE, EnergySchedulerCardEditor);
    }
    return true;
  } catch (e) {
    if (e instanceof Error && e.message.includes('already been defined')) {
      return true;
    }
    console.error('[Energy Scheduler] Registration error:', e);
    return false;
  }
}

registerElements();

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: 'Energy Scheduler Card',
    description: 'Manage energy schedule with prices, EV charging, and optimization',
    preview: true,
    documentationURL: 'https://github.com/your-repo/hacs-energy-scheduler',
  });
}

console.info(
  `%c ENERGY-SCHEDULER-CARD %c v${CARD_VERSION} %c`,
  'color: white; background: #4caf50; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: #4caf50; background: #e8f5e9; font-weight: bold;',
  'background: transparent;'
);

let registryCheckInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
  if (!customElements.get(CARD_TYPE) && window.EnergySchedulerCard) {
    console.warn('[Energy Scheduler] Registry cleared, re-registering...');
    registerElements();
  }
}, 50);

setTimeout(() => {
  if (registryCheckInterval) {
    clearInterval(registryCheckInterval);
    registryCheckInterval = null;
  }
}, 2000);

export { EnergySchedulerCard, EnergySchedulerCardEditor };
