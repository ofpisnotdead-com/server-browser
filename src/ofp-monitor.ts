import "regenerator-runtime/runtime";

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import MasterServer from "./lib/master-server";
import OfpServer from "./lib/ofp-server";
import { urlify } from "./lib/urlify-directive";
import "./ofp-monitor-players";

@customElement("ofp-monitor")
export default class extends LitElement {
  @property({ attribute: "master-server-url" }) masterServerUrl!: string;
  @state() masterServer!: MasterServer;
  @state() servers: OfpServer[] = [];
  @state() loading: boolean = false;
  @state() autoRefresh: boolean = true;
  @state() online: boolean = true;

  connectedCallback() {
    super.connectedCallback();

    if (this.isDebug) {
      this.autoRefresh = false;
    }

    if (navigator.connection) {
      this.updateConnection();
      navigator.connection.addEventListener('change', () => this.updateConnection());
    }

    this.masterServer = new MasterServer(this.masterServerUrl);
    this.reloadServers();
  }

  updateConnection() {
    if(this.online != navigator.onLine) {
      this.online = navigator.onLine;
      if(this.online) this.scheduleRefresh(0);
    }
  }

  scheduleRefresh(delay = 5000) {
    if (this.autoRefresh) {
      setTimeout(() => {
        this.refreshServers();
      }, delay);
    }
  }

  reloadServers() {
    if (!this.online) return;

    this.servers = [];
    this.loading = true;
    this.masterServer.loadServers().then((servers) => {
      let loaders = servers.map((server) => server.refresh());
      loaders.forEach((loader) => {
        loader.then((server) => {
          this.servers = [...this.servers, server];
        });
      });

      Promise.all(loaders).then(() => {
        this.loading = false;
        this.scheduleRefresh();
      });
    });
  }

  refreshServers() {
    if (!this.online) return;

    this.loading = true;
    let loaders = this.servers.map((server) => server.refresh());
    loaders.forEach((loader) => {
      loader.then(() => this.requestUpdate());
    });

    Promise.all(loaders).then(() => {
      this.loading = false;
      this.scheduleRefresh();
    });
  }

  get isDebug() {
    return window.location.search === "?debug";
  }

  get readyServers() {
    return this.servers.filter((server) => server.loaded);
  }

  get respondingServers() {
    let servers = this.servers.filter(
      (server) => server.payload && !server.error
    );
    return servers.sort((s1, s2) => {
      if (s1.players > s2.players) return -1;
      if (s1.players < s2.players) return 1;
      return 0;
    });
  }

  render() {
    if(!this.online) {
      return html`<center><h1>You're offline</h1></center>`;
    }

    return html`
      <progress
        max="${this.masterServer.servers.length}"
        value="${this.readyServers.length}"
        class="loading-${this.loading}"
      ></progress>

      ${this.isDebug
        ? html`
            <button ?disabled=${this.loading} @click=${this.reloadServers}>
              reload server list
            </button>
            <button ?disabled=${this.loading} @click=${this.refreshServers}>
              refresh
            </button>
          `
        : ""}

      <aside class="info">
        Found ${this.servers.length} servers.
        <br /><i
          >TIP: Click on players column to see list of players on server.</i
        >
      </aside>

      <table>
        <thead>
          <tr>
            <th class="ColumnNr">ID</th>
            <th class="ColumnServer">
              Server
            </th>
            <th class="ColumnMission">
              Mission / Mods
            </th>
            <th class="ColumnStatus">
              Status
            </th>
            <th class="ColumnPlayers">
              Players ▼
            </th>
            <th class="ColumnPing">
              API ping
            </th>
          </tr>
        </thead>
        <tbody>
          ${this.respondingServers.map(
            (server, i) =>
              html`<tr>
                <td data-label="ID">${i + 1}</td>
                <td data-label="Server">
                  ${urlify(server.payload["hostname"])}
                  <br />
                  <div class="IP">${server.ip}:${server.port}</div>
                  Version: ${server.payload["gamever"]}
                </td>
                <td data-label="Mission / Mods">
                  ${server.payload["gametype"]}<br />
                  ${server.payload["mod"]}
                </td>
                <td data-label="Status">
                  <p class=${server.humanStatus}>${server.humanStatus}</p>
                </td>
                <td data-label="Players" class="Players">
                  <ofp-monitor-players
                    numPlayers=${server.payload["numplayers"]}
                    maxPlayers=${server.payload["maxplayers"]}
                    .playerNames=${server.playerNames}
                  ></ofp-monitor-players>
                </td>
                <td data-label="API ping">
                  ${Math.round(server.payload["replied_in"] * 1000)} ms
                </td>
              </tr>`
          )}
        </tbody>
      </table>

    `;
  }

  static styles = css`
    .info {
      font-size: 1.17em;
      margin-top: 1em;
      margin-bottom: 1em;
    }

    a {
      color: inherit;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      border: 1px solid #0af00a;
    }

    tbody td {
      animation: fadeIn 2s;
    }
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    tbody tr:nth-child(odd) {
      background-color: #030f03;
    }
    th {
      border: 1px solid #0af00a;
    }
    td,
    th {
      border-left: 1px solid #0af00a;
      max-width: 25%;
      vertical-align: top;
      word-wrap: break-word;
      padding: 4px 8px;
    }
    th.ColumnNr {
      width: 25px;
    }
    th.ColumnServer {
      width: 30%;
    }
    th.ColumnMission {
      width: 30%;
    }
    th.ColumnStatus {
      width: 70px;
    }
    th.ColumnPlayers {
      width: 55px;
    }
    th.ColumnSteam {
      width: 10%;
    }
    th.ColumnPing {
      width: 8%;
    }

    .IP {
      font-size: 10px;
      display: inline;
    }

    table {
      font: bold 14px courier;
      text-align: left;
      color: #0e9b0e;
      background-color: #000;
    }

    progress {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 100%;
      box-sizing: border-box;
      height: 6px;
      margin: 8px 0px;

      color: #0af00a;
      border: 1px solid;
      background-color: #006699;
    }
    progress::-moz-progress-bar {
      background-color: #0af00a !important;
    }
    progress::-webkit-progress-value {
      background: #0af00a;
    }
    progress::-webkit-progress-bar {
      background-color: #053805;
      width: 100%;
    }

    progress.loading-false {
      visibility: hidden;
    }

    .Playing {
      color: red;
    }

    @media screen and (max-width: 600px) {
      table {
        border: 0;
      }

      td,
      th {
        max-width: 100%;
      }

      table caption {
        font-size: 1.3em;
      }

      table thead {
        border: none;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
      }

      table tr {
        border-bottom: 1px solid #0af00a;
        border-top: 1px solid #0af00a;
        border-right: 1px solid #0af00a;
        display: block;
        margin-bottom: 0.625em;
      }

      table td {
        border-bottom: 1px solid #0af00a;
        display: block;
        font-size: 0.8em;
        text-align: right;
      }

      table td::before {
        /*
    * aria-label has no advantage, it won't be read inside a table
    content: attr(aria-label);
    */
        content: attr(data-label);
        float: left;
        font-weight: bold;
        text-transform: uppercase;
      }

      table td:last-child {
        border-bottom: 0;
      }

    }
  `;
}
