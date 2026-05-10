/**
 * Single source of truth for the card bundle version. Bumped on every release
 * alongside the Python manifest. The card compares this with the integration
 * version reported over WebSocket and prompts the user to reload if they
 * diverge (e.g. after an update when the browser is still running a stale
 * cached bundle).
 */
export const CARD_VERSION = '4.7.2';
