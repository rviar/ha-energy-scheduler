import { css } from 'lit';

export const statusBarStyles = css`
  :host { display: block; }
  .status-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 16px 12px;
  }
  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    font-size: 13px;
    transition: background 0.2s ease;
    min-width: 0;
  }
  .status-item .status-icon {
    flex-shrink: 0;
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    display: flex;
  }
  .status-item .status-value {
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
  .status-item .status-value.mode {
    max-width: 100px;
    font-size: 12px;
    font-weight: 500;
  }
  .status-item.profit {
    background: rgba(76, 175, 80, 0.1);
  }
  .status-item.profit .status-value {
    color: var(--success-color, #43A047);
  }
  .status-item.paused {
    background: rgba(255, 152, 0, 0.12);
  }
  .status-item.paused .status-value {
    color: var(--warning-color, #FB8C00);
  }
`;
