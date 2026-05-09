import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tabBarStyles } from '@/styles';

@customElement('es-tab-bar')
export class EsTabBar extends LitElement {
  static styles = tabBarStyles;

  @property({ type: String }) activeTab = 'schedule';
  @property({ type: Boolean }) showEvTab = false;

  private _tabs = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'ev', label: 'EV' },
    { id: 'stats', label: 'Stats' },
  ];

  render() {
    const visibleTabs = this._tabs.filter(
      (t) => t.id !== 'ev' || this.showEvTab
    );

    return html`
      <div class="tab-bar">
        ${visibleTabs.map(
          (tab) => html`
            <button
              class="tab ${tab.id === this.activeTab ? 'active' : ''}"
              @click=${() => this._selectTab(tab.id)}
            >
              ${tab.label}
            </button>
          `
        )}
      </div>
    `;
  }

  private _selectTab(tabId: string) {
    this.dispatchEvent(
      new CustomEvent('tab-changed', {
        detail: { tab: tabId },
        bubbles: true,
        composed: true,
      })
    );
  }
}
