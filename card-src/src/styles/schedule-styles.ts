import { css } from 'lit';

export const scheduleStyles = css`
  :host { display: block; }
  .schedule-tab { padding: 12px 16px 16px; }

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
    gap: 8px;
    margin-bottom: 12px;
  }
  .controls-bar .btn,
  .controls-bar .controls-select {
    height: 34px;
    box-sizing: border-box;
  }
  .controls-spacer { flex: 1; min-width: 4px; }

  /* Split button for Optimize — main action + chevron submenu */
  .btn-split {
    display: inline-flex;
    align-items: stretch;
    position: relative;
  }
  .btn-split .btn-split-main {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .btn-split .btn-split-chev {
    padding: 0 8px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.18);
    --mdc-icon-size: 16px;
    min-width: 0;
  }
  .optimize-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 50;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    padding: 4px;
    min-width: 140px;
    animation: es-fade-in 0.15s ease;
  }
  .optimize-menu-header {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    padding: 6px 10px 4px;
  }
  .optimize-menu-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    line-height: 1;
  }
  .optimize-menu-option:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }
  .optimize-menu-option ha-icon {
    --mdc-icon-size: 16px;
    color: var(--primary-color);
    visibility: hidden;
  }
  .optimize-menu-option.active ha-icon { visibility: visible; }
  .optimize-menu-option.active {
    color: var(--primary-color);
    font-weight: 600;
  }
  @keyframes es-fade-in { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }

  /* Auto-apply toggle on the right of controls bar */
  .auto-apply {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    -webkit-tap-highlight-color: transparent;
  }
  .auto-apply-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .toggle-switch {
    position: relative;
    width: 38px;
    height: 22px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: var(--divider-color, rgba(0, 0, 0, 0.18));
    transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 22px;
  }
  .toggle-slider:before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    bottom: 3px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .toggle-switch input:checked + .toggle-slider { background: var(--primary-color); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(16px); }

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
