/**
 * Energy Scheduler Card for Home Assistant
 * Built with Lit + TypeScript + Vite
 */

import { EnergySchedulerCard } from './components/energy-scheduler-card';
import { EnergySchedulerCardEditor } from './components/energy-scheduler-card-editor';

const CARD_VERSION = '3.0.3';
const CARD_TYPE = 'energy-scheduler-card';
const EDITOR_TYPE = 'energy-scheduler-card-editor';

// Store classes globally for registry recovery
window.EnergySchedulerCard = EnergySchedulerCard;
window.EnergySchedulerCardEditor = EnergySchedulerCardEditor;

// Registration function that handles re-registration after hard reload
function registerElements(): boolean {
  try {
    // Note: With Lit's @customElement decorator, elements are already registered
    // This function is for manual registration if needed
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

// Register with card picker
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: 'Energy Scheduler Card',
    description: 'Schedule energy actions based on electricity prices',
    preview: true,
    documentationURL: 'https://github.com/your-repo/hacs-energy-scheduler',
  });
}

// Log version
console.info(
  `%c ENERGY-SCHEDULER-CARD %c v${CARD_VERSION} %c`,
  'color: white; background: #4caf50; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: #4caf50; background: #e8f5e9; font-weight: bold;',
  'background: transparent;'
);

// Monitor for registry clearing (handles HA frontend reload)
let registryCheckInterval: ReturnType<typeof setInterval> | null = setInterval(
  () => {
    if (!customElements.get(CARD_TYPE) && window.EnergySchedulerCard) {
      console.warn('[Energy Scheduler] Registry cleared, re-registering...');
      registerElements();
    }
  },
  50
);

// Stop monitoring after 2 seconds
setTimeout(() => {
  if (registryCheckInterval) {
    clearInterval(registryCheckInterval);
    registryCheckInterval = null;
  }
}, 2000);

export { EnergySchedulerCard, EnergySchedulerCardEditor };
