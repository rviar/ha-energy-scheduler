import { css } from 'lit';

export const scheduleStyles = css`
  :host { display: block; }
  .schedule-tab { padding: 12px 16px 16px; }

  .chart-section {
    margin-bottom: 16px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 12px;
  }
  .chart-container {
    position: relative;
    height: var(--chart-height, 250px);
    width: 100%;
  }
  .chart-container canvas { width: 100% !important; height: 100% !important; }
  .chart-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  .schedule-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .toolbar-actions { display: flex; gap: 8px; }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 6px;
  }
  .day-separator {
    grid-column: 1 / -1;
    padding: 8px 4px 6px;
    font-weight: 600;
    font-size: 12px;
    color: var(--primary-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    margin-top: 4px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .day-separator:first-child { margin-top: 0; }

  .hour-slot {
    padding: 8px 6px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    border: 1.5px solid transparent;
    font-size: 11px;
    position: relative;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    -webkit-tap-highlight-color: transparent;
  }
  .hour-slot:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .hour-slot:active {
    transform: translateY(0);
  }
  .hour-slot.current {
    border-color: var(--es-color-current);
    box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.2);
  }
  .hour-slot .time {
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 2px;
    color: var(--primary-text-color);
  }
  .hour-slot .prices {
    font-size: 9px;
    color: var(--secondary-text-color);
    display: flex;
    justify-content: center;
    gap: 4px;
  }
  .hour-slot .prices .buy { color: #1E88E5; font-weight: 500; }
  .hour-slot .prices .sell { color: #43A047; font-weight: 500; }
  .hour-slot .action-label {
    font-size: 9px;
    margin-top: 3px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
  .hour-slot .slot-icon {
    position: absolute;
    top: 3px;
    right: 4px;
    font-size: 10px;
    line-height: 1;
  }
  .hour-slot .hour-badges {
    position: absolute;
    top: 3px;
    left: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
  }
  .hour-slot .hour-badges .lock-badge {
    font-size: 9px;
    opacity: 0.7;
  }
  .hour-slot .hour-badges .no-export-badge {
    --mdc-icon-size: 12px;
    width: 12px;
    height: 12px;
    color: var(--error-color, #e53935);
    opacity: 0.85;
  }
  .hour-slot .hour-badges .no-pv-badge {
    --mdc-icon-size: 12px;
    width: 12px;
    height: 12px;
    color: var(--warning-color, #FB8C00);
    opacity: 0.85;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 32px 16px;
    color: var(--secondary-text-color);
    font-size: 14px;
  }
  .loading-placeholder {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 12px;
  }
  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Controls bar */
  .controls-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .controls-bar .btn,
  .controls-bar .status-chip,
  .controls-bar .controls-select {
    height: 34px;
    box-sizing: border-box;
  }
  .controls-spacer { flex: 1; min-width: 4px; }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    border-radius: 17px;
    border: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    --mdc-icon-size: 16px;
    white-space: nowrap;
  }
  .status-chip ha-icon { display: flex; }
  .status-chip.active {
    background: rgba(67, 160, 71, 0.12);
    color: #43A047;
  }
  .status-chip.active:hover { background: rgba(67, 160, 71, 0.2); }
  .status-chip.paused {
    background: rgba(255, 152, 0, 0.12);
    color: #FB8C00;
  }
  .status-chip.paused:hover { background: rgba(255, 152, 0, 0.2); }

  .controls-select {
    padding: 0 28px 0 10px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.15s ease;
    flex: 1;
    min-width: 0;
  }
  .controls-select:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;
