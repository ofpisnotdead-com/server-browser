import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("ofp-monitor-players")
export class OfpMonitorPlayers extends LitElement {
  @property({ type: Array }) playerNames = [];
  @property({ type: Number }) numPlayers = 0;
  @property({ type: Number }) maxPlayers = 0;
  @state() expanded: boolean = false;

  renderDetail() {
    return html`<p>
      ${this.playerNames.map((player) => html`${player}<br />`)}
    </p>`;
  }

  static styles = css`
    div {
      cursor: help;
    }
  `;

  render() {
    return html`
      <div @click=${() => (this.expanded = !this.expanded)}>
        ${this.numPlayers}/${this.maxPlayers}
        ${this.expanded ? this.renderDetail() : null}
      </div>
    `;
  }
}
