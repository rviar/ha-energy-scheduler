import { css } from 'lit';

export const tabBarStyles = css`
  :host { display: block; }
  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 4px 12px 8px;
  }
  .tab {
    flex: 1;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }
  .tab:hover {
    color: var(--primary-text-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }
  .tab.active {
    color: var(--primary-color);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    font-weight: 500;
  }
`;
