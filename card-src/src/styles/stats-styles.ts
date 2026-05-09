import { css } from 'lit';

export const statsStyles = css`
  :host { display: block; }
  .stats-tab { padding: 12px 16px 16px; }

  .stats-block {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .stats-block:last-child { margin-bottom: 0; }
  .stats-block h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .profit-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--success-color, #43A047);
    margin-bottom: 14px;
    letter-spacing: -0.02em;
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
  }
  .stats-row .label { color: var(--secondary-text-color); }
  .stats-row .value { font-weight: 600; color: var(--primary-text-color); }

  .hours-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; }
  .hour-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  .hour-chip.charge {
    background: rgba(67, 160, 71, 0.12);
    color: #43A047;
  }
  .hour-chip.discharge {
    background: rgba(230, 74, 25, 0.12);
    color: #E64A19;
  }

  .consumption-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .consumption-header select {
    padding: 6px 10px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 10px;
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
    padding-right: 24px;
  }
  .consumption-header select:focus { outline: none; border-color: var(--primary-color); }

  .consumption-chart {
    height: 120px;
    position: relative;
    background: var(--card-background-color, rgba(255, 255, 255, 0.5));
    border-radius: 12px;
    padding: 8px;
  }
  .consumption-source {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 8px;
    font-style: italic;
  }

  .warning-item {
    padding: 8px 12px;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 10px;
    font-size: 12px;
    color: var(--warning-color, #FB8C00);
    margin-bottom: 6px;
    font-weight: 500;
    border-left: 3px solid var(--warning-color, #FB8C00);
  }
  .warning-item:last-child { margin-bottom: 0; }

  .optimization-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.5));
    border-radius: 12px;
  }
  .meta-item .meta-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }
  .meta-item .meta-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--primary-text-color);
  }
`;
