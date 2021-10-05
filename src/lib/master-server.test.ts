import { expect } from "@esm-bundle/chai";
import fetchMock from "fetch-mock";
import MasterServer from "./master-server";
import OfpServer from "./ofp-server";

describe("MasterServer", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it("stores master url", () => {
    let masterServer = new MasterServer("http://myurl");
    expect(masterServer.masterServerUrl).to.equal("http://myurl");
  });

  it("loads the servers", () => {
    fetchMock.mock("http://myurl/servers.txt", {
      body: "89.163.140.196:4500\n89.163.140.196:5000\n",
      status: 200
    });

    let masterServer = new MasterServer("http://myurl/servers.txt");

    masterServer.loadServers().then((loadedServers: OfpServer[]) => {
      expect(loadedServers.length).to.eq(2);
    });
  });
});
