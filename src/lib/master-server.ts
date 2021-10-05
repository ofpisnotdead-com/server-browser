import OfpServer from "./ofp-server";

export default class MasterServer {
  masterServerUrl: string;
  servers: OfpServer[] = [];

  constructor(masterServerUrl: string) {
    this.masterServerUrl = masterServerUrl;
  }

  async loadServers() {
    try {
      let serversResponse = await fetch(this.masterServerUrl);

      let loadedServers = await serversResponse.text();
      this.servers = loadedServers
        .split("\n")
        .filter((address) => address.length > 0)
        .map((address) => new OfpServer(address));
    } catch {}

    return this.servers;
  }
}
