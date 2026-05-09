import { css } from 'lit';

export const controlStyles = css`
  :host { display: block; }
  .control-tab { padding: 12px 16px 16px; }

  .control-block {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .control-block:last-child { margin-bottom: 0; }
  .control-block h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
  }
  .control-row + .control-row {
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .control-row label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .control-row select {
    padding: 8px 12px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }
  .control-row select:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--secondary-text-color);
    font-weight: 500;
  }
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

  .control-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .control-actions .btn { flex: 1; }

  .apply-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .apply-row select {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }
  .apply-row select:focus { outline: none; border-color: var(--primary-color); }

  .ev-control-actions { display: flex; gap: 8px; }
  .ev-control-actions .btn { flex: 1; }
`;
