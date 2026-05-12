import { css } from 'lit';

export const chartStyles = css`
  :host { display: block; }

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
`;
