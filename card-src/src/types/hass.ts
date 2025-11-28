/**
 * Home Assistant types for Lovelace cards
 */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  user?: {
    id: string;
    name: string;
    is_admin: boolean;
  };
  language: string;
  themes: {
    default_theme: string;
    themes: Record<string, unknown>;
  };
  connected: boolean;
  connection: {
    subscribeEvents: (callback: (event: unknown) => void, eventType: string) => Promise<() => void>;
  };
  callApi: <T>(method: string, path: string, data?: unknown) => Promise<T>;
  callService: (domain: string, service: string, data?: Record<string, unknown>) => Promise<void>;
  formatEntityState: (entity: HassEntity) => string;
  formatEntityAttributeValue: (entity: HassEntity, attribute: string) => string;
  locale: {
    language: string;
    number_format: string;
    time_format: string;
  };
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
  getCardSize?(): number | Promise<number>;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}
