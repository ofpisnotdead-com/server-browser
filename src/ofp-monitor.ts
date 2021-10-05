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

  connectedCallback() {
    super.connectedCallback();

    if (this.isDebug) {
      this.autoRefresh = false;
    }

    this.masterServer = new MasterServer(this.masterServerUrl);
    this.reloadServers();
  }

  scheduleRefresh() {
    if (this.autoRefresh) {
      setTimeout(() => {
        this.refreshServers();
      }, 5000);
    }
  }

  reloadServers() {
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
    return html`
      <h1>
        <a href="https://ofpisnotdead.com" target="_blank">ofpisnotdead.com</a>
        server browser BETA
        <a
          href="https://github.com/ofpisnotdead-com/server-browser"
          target="_blank"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="green"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>
      </h1>
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

      <h3>
        Found ${this.servers.length} servers.
        <br /><i
          >TIP: Click on players column to see list of players on server.</i
        >
      </h3>

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

      <div class="Credits">
        <p>
          based on original
          <a href="http://kondor.armagame.pl/" target="_blank"
            >online browser</a
          >
          by
          <a
            target="_blank"
            href="https://forums.bohemia.net/profile/749525-przemek_kondor/"
            >Przemek_kondor</a
          >
        </p>
        <p>
          using
          <a target="_blank" href="https://github.com/ofpisnotdead-com/ofp-api"
            >ofp-api</a
          >
          and
          <a target="_blank" href="https://github.com/simi/PowerServer"
            >PowerServer</a
          >
          based on code by
          <a
            target="_blank"
            href="https://forums.bohemia.net/profile/734396-poweruser/"
            >Poweruser</a
          >
          &amp; Luigi Auriemma
        </p>
      </div>
    `;
  }

  static styles = css`
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
    td.Players {
      cursor: help;
    }

    .Credits {
      text-align: center;
      font-size: 11px;
      line-height: 10px;
      padding: 10px;
    }
    .IP {
      font-size: 10px;
      display: inline;
    }

    a {
      color: inherit;
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
