enum Status {
  Creating = 2,
  Waiting = 6,
  Debriefing = 9,
  "Setting Up" = 12,
  Briefing = 13,
  Playing = 14
}

interface Player {
  player: string;
  team: string;
  score: string;
  deaths: string;
}

interface ServerStatus {
  gamename: string;
  gamever: string;
  groupid: string;
  hostname: string;
  hostport: string;
  mapname: string;
  gametype: string;
  numplayers: string;
  maxplayers: string;
  gamemode: string;
  timeleft: string;
  param1: string;
  param2: string;
  actver: string;
  reqver: string;
  mod: string;
  equalModReqired: string;
  password: string;
  gstate: string;
  impl: string;
  platform: string;
  players: Array<Player>;
}

const apiUrl = "https://ofp-api.herokuapp.com/";

export default class OfpServer {
  ip: string;
  port: number;
  payload: ServerStatus | null = null;
  loaded: boolean = false;
  error: boolean = false;
  players: number = 0;

  get serverApiUrl() {
    return `${apiUrl}${this.ip}:${this.port}`;
  }

  get humanStatus() {
    if (this.payload && !this.error) {
      let state = parseInt(this.payload.gstate, 10);
      return Status[state];
    } else {
      return "Error";
    }
  }

  get playerNames() {
    if (this.payload && !this.error) {
      let players = this.payload.players.map((player) => player.player);
      return players.sort();
    } else {
      return [];
    }
  }

  constructor(address: string) {
    let addressParts = address.split(":");
    this.ip = addressParts[0];
    this.port = parseInt(addressParts[1], 10);
  }

  async refresh() {
    this.loaded = false;
    let response = await fetch(this.serverApiUrl);
    if (response.status === 200) {
      let json = await response.json();
      this.payload = json;
      if (this.payload) {
        this.players = parseInt(this.payload.numplayers, 10);
      }
      this.error = false;
    } else {
      this.payload = null;
      this.error = true;
    }

    this.loaded = true;

    return this;
  }
}
