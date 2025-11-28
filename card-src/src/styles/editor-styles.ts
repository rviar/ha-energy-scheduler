import { css } from 'lit';

export const editorStyles = css`
  :host {
    display: block;
  }

  .editor {
    padding: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }

  .form-group input[type="text"],
  .form-group input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    font-size: 1em;
    background: var(--card-background-color, white);
    color: var(--primary-text-color);
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkbox-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .checkbox-row label {
    margin-bottom: 0;
    cursor: pointer;
  }
`;
