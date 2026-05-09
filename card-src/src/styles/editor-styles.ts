import { css } from 'lit';

export const editorStyles = css`
  :host { display: block; }
  .editor { padding: 16px; }

  .form-group { margin-bottom: 16px; }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 14px;
    font-size: 14px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
  }
  .checkbox-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-color);
    border-radius: 4px;
  }
  .checkbox-row label {
    margin-bottom: 0;
    cursor: pointer;
    font-weight: 500;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin: 20px 0 12px 0;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section-title:first-child { margin-top: 0; }
`;
