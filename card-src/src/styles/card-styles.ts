/**
 * Card styles - exact match from original card
 */
import { css } from 'lit';

export const cardStyles = css`
  :host {
    --chart-height: 250px;
  }

  ha-card {
    overflow: hidden;
  }

  .card-content {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .card-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .schedule-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .toolbar-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    padding: 4px 12px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px;
    background: transparent;
    color: var(--primary-text-color);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .action-btn.primary:hover {
    opacity: 0.9;
  }

  .chart-section {
    margin-bottom: 16px;
  }

  .chart-container {
    position: relative;
    height: var(--chart-height);
    width: 100%;
  }

  #priceChart {
    width: 100% !important;
    height: 100% !important;
  }

  .chart-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--secondary-text-color);
    font-size: 13px;
  }

  .current-mode {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--secondary-background-color);
    border-radius: 6px;
    font-size: 13px;
  }

  .current-mode .label {
    color: var(--secondary-text-color);
  }

  .current-mode .value {
    font-weight: 600;
    color: var(--primary-color);
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
  }

  .loading-placeholder,
  .error-placeholder {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    color: var(--secondary-text-color);
    text-align: center;
    gap: 12px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .error-placeholder .error-icon {
    font-size: 32px;
  }

  .error-placeholder .error-message {
    font-size: 13px;
    max-width: 250px;
  }

  .retry-btn {
    padding: 8px 16px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }

  .retry-btn:hover {
    opacity: 0.9;
  }

  .day-separator {
    grid-column: 1 / -1;
    padding: 6px 0;
    font-weight: 600;
    font-size: 12px;
    color: var(--primary-color);
    border-bottom: 1px solid var(--divider-color);
    margin-top: 4px;
  }

  .day-separator:first-child {
    margin-top: 0;
  }

  .hour-slot {
    padding: 8px 4px;
    border-radius: 6px;
    background: var(--secondary-background-color);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    border: 2px solid transparent;
    font-size: 11px;
    position: relative;
  }

  .hour-slot:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .hour-slot.scheduled {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.1);
  }

  .hour-slot.scheduled.manual {
    border-color: var(--warning-color, #FF9800);
    background: rgba(255, 152, 0, 0.1);
  }

  .hour-slot.current {
    border-color: var(--success-color, #4CAF50);
    background: rgba(76, 175, 80, 0.1);
  }

  .hour-slot .lock-indicator {
    font-size: 8px;
    position: absolute;
    top: 2px;
    right: 2px;
  }

  .hour-slot .time {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 2px;
  }

  .hour-slot .prices {
    font-size: 9px;
    color: var(--secondary-text-color);
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .hour-slot .prices .buy {
    color: #2196F3;
  }

  .hour-slot .prices .sell {
    color: #4CAF50;
  }

  .hour-slot .action {
    font-size: 9px;
    margin-top: 2px;
    color: var(--primary-color);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Modal Dialog */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    justify-content: center;
    align-items: center;
  }

  .modal-overlay.open {
    display: flex;
  }

  .modal {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    padding: 20px;
    max-width: 360px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 4px;
    line-height: 1;
  }

  .price-info {
    background: var(--secondary-background-color);
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 12px;
  }

  .price-info .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .price-info .row:last-child {
    margin-bottom: 0;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 13px;
    color: var(--primary-text-color);
  }

  .form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-divider {
    height: 1px;
    background: var(--divider-color);
    margin: 16px 0;
  }

  /* Toggle switch */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
  }

  .toggle-row .toggle-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .toggle-row .toggle-hint {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--divider-color);
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: var(--primary-color);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  /* Range slider */
  .range-group {
    padding: 8px 0;
  }

  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .range-header .range-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .range-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
    min-width: 40px;
    text-align: right;
  }

  .range-input {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--divider-color);
    outline: none;
    -webkit-appearance: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .btn {
    flex: 1;
    padding: 10px 12px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn-primary {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .btn-secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .btn-danger {
    background: var(--error-color, #F44336);
    color: white;
  }

  .btn-warning {
    background: var(--warning-color, #FF9800);
    color: white;
    flex: 0 0 auto;
  }

  .notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-radius: 6px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .notification.show {
    opacity: 1;
  }

  .notification.error {
    background: var(--error-color, #F44336);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    color: var(--secondary-text-color);
    font-size: 13px;
  }
`;
