import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { cardStyles, modalStyles } from '@/styles';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@customElement('es-confirm-modal')
export class EsConfirmModal extends LitElement {
  static styles = [cardStyles, modalStyles];

  @state() private _open = false;
  @state() private _options?: ConfirmOptions;
  private _resolve?: (confirmed: boolean) => void;

  private _escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close(false);
  };

  /**
   * Open the dialog and return a Promise that resolves with the user's choice.
   * If a previous confirm() call is still pending, it's resolved as `false`
   * (cancelled) before the new one starts — only one dialog can be live.
   */
  async confirm(options: ConfirmOptions): Promise<boolean> {
    if (this._resolve) {
      this._resolve(false);
      this._resolve = undefined;
    }
    this._options = options;
    this._open = true;
    document.addEventListener('keydown', this._escHandler);
    return new Promise<boolean>((resolve) => {
      this._resolve = resolve;
    });
  }

  private _close(confirmed: boolean) {
    if (this._resolve) {
      this._resolve(confirmed);
      this._resolve = undefined;
    }
    this._open = false;
    this._options = undefined;
    document.removeEventListener('keydown', this._escHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._escHandler);
    if (this._resolve) {
      this._resolve(false);
      this._resolve = undefined;
    }
  }

  render() {
    if (!this._open || !this._options) return nothing;
    const { title, message, confirmLabel, cancelLabel, destructive } = this._options;

    return html`
      <div class="modal-overlay open"
        @click=${(e: Event) => {
          if ((e.target as HTMLElement).classList.contains('modal-overlay')) this._close(false);
        }}>
        <div class="modal confirm-modal">
          ${title
            ? html`
                <div class="modal-header">
                  <h3 class="modal-title">${title}</h3>
                </div>
              `
            : nothing}
          <div class="confirm-message">${message}</div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click=${() => this._close(false)}>
              ${cancelLabel ?? 'Cancel'}
            </button>
            <button class="btn ${destructive ? 'btn-danger' : 'btn-primary'}"
              @click=${() => this._close(true)}>
              ${confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'es-confirm-modal': EsConfirmModal;
  }
}
