import { css } from 'lit';

export const modalStyles = css`
  :host { display: block; }

  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
    justify-content: center;
    align-items: center;
    animation: es-fade-in 0.2s ease;
  }
  .modal-overlay.open { display: flex; }

  .modal {
    background: var(--card-background-color, #fff);
    border-radius: 20px;
    padding: 24px;
    max-width: 380px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    animation: es-slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--primary-text-color);
    letter-spacing: -0.01em;
  }
  .modal-close {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--secondary-text-color);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    line-height: 1;
  }
  .modal-close:hover {
    background: var(--divider-color, rgba(0, 0, 0, 0.1));
    color: var(--primary-text-color);
  }

  .price-info {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    padding: 14px 16px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
  }
  .price-info .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: var(--secondary-text-color);
  }
  .price-info .row:last-child { margin-bottom: 0; }
  .price-info .row span:last-child {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .form-group { margin-bottom: 16px; }
  .form-group:last-child { margin-bottom: 0; }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 14px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 14px;
    box-sizing: border-box;
    cursor: pointer;
    transition: border-color 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
  }

  .form-divider {
    height: 1px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    margin: 16px 0;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
  }
  .toggle-row .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* Reuse toggle styles from control */
  .toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--divider-color, rgba(0, 0, 0, 0.15));
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  .toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(20px); }

  .range-group { padding: 10px 0; }
  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .range-header .range-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .range-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--primary-color);
    min-width: 44px;
    text-align: right;
  }
  .range-input {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--divider-color, rgba(0, 0, 0, 0.1));
    outline: none;
    -webkit-appearance: none;
    transition: background 0.2s ease;
  }
  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease;
  }
  .range-input::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }
  .modal-actions .btn { flex: 1; padding: 12px 16px; }

  @keyframes es-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes es-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;
