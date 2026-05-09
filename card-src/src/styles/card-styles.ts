import { css } from 'lit';

export const cardStyles = css`
  :host {
    --es-color-charge: #43A047;
    --es-color-charge-ev: #1E88E5;
    --es-color-force-charge: #8E24AA;
    --es-color-discharge: #E64A19;
    --es-color-solar: #FB8C00;
    --es-color-self-consume: #FDD835;
    --es-color-idle: #78909C;
    --es-color-manual: #FB8C00;
    --es-color-current: #43A047;
    --es-radius-card: var(--ha-card-border-radius, 12px);
    --es-radius-lg: 16px;
    --es-radius-md: 12px;
    --es-radius-sm: 8px;
    --es-radius-pill: 20px;
    --es-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ha-card {
    overflow: hidden;
    border-radius: var(--es-radius-card);
  }

  .card-content { padding: 0; }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
  }
  .card-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--es-radius-md);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    color: var(--primary-color);
    --mdc-icon-size: 22px;
    flex-shrink: 0;
  }
  .card-header-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    letter-spacing: -0.01em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    line-height: 1;
    --mdc-icon-size: 18px;
  }
  .btn ha-icon { display: flex; }
  .btn:hover { filter: brightness(0.93); }
  .btn:active { transform: scale(0.96); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; filter: none; }
  .btn-primary {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .btn-secondary {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
    color: var(--primary-color);
  }
  .btn-secondary:hover {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
  }
  .btn-danger {
    background: rgba(229, 57, 53, 0.1);
    color: var(--error-color, #E53935);
  }
  .btn-warning {
    background: rgba(251, 140, 0, 0.1);
    color: var(--warning-color, #FB8C00);
  }
  .btn-icon-only {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 10px;
  }

  .notification {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    padding: 12px 24px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-radius: var(--es-radius-md);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
  .notification.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .notification.error { background: var(--error-color, #E53935); }

  .section-block {
    background: var(--card-background-color, #fff);
    border-radius: var(--es-radius-lg);
    padding: 16px;
    margin-bottom: 12px;
  }
  .section-block:last-child { margin-bottom: 0; }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 0 12px 0;
  }

  /* Loading state */
  .card-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    gap: 16px;
  }
  .card-loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: es-spin 0.8s linear infinite;
  }
  .card-loading-text {
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  /* Error state */
  .card-error {
    text-align: center;
    padding: 40px 16px;
  }
  .card-error-icon {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.7;
  }
  .card-error-message {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  @keyframes es-spin { to { transform: rotate(360deg); } }
`;
