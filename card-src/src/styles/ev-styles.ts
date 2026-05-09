import { css } from 'lit';

export const evStyles = css`
  :host { display: block; }
  .ev-tab { padding: 12px 16px 16px; }

  .ev-status {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .ev-status h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .status-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .status-field .field-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }
  .status-field .field-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .status-field .field-value.connected { color: var(--success-color, #43A047); }
  .status-field .field-value.disconnected { color: var(--error-color, #E53935); }
  .status-field .field-value.charging { color: var(--primary-color); }

  .session-block {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    border: 1.5px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .session-block h3 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ev-schedule-list {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
  }
  .ev-schedule-list h3 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ev-hour-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .ev-hour-item:last-child { border-bottom: none; }
  .ev-hour-time { font-weight: 600; font-size: 14px; color: var(--primary-text-color); }
  .ev-hour-reason {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding: 3px 10px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.6));
    border-radius: 12px;
  }
  .ev-hour-amps { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }

  .ev-control-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ev-control-bar .btn { flex: 1; }

  .empty-ev {
    text-align: center;
    padding: 24px 16px;
    color: var(--secondary-text-color);
    font-size: 14px;
  }
`;
