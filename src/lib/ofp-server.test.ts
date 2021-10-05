import { expect } from "@esm-bundle/chai";
import fetchMock from "fetch-mock";
import OfpServer from "./ofp-server";

describe("OfpServer", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it("assigns IP, port", () => {
    let server = new OfpServer("1.2.3.4:10");
    expect(server.ip).to.eq("1.2.3.4");
    expect(server.port).to.eq(10);
  });

  it("assigns payload", () => {
    fetchMock.mock("https://ofp-api.herokuapp.com/1.2.3.4:1000", {
      body: {
        gamename: "opflashr",
        gamever: "1.99",
        groupid: "261",
        hostname: "EASY_WW2   |   https://silion.ru/@WW2_MP_V3.7z",
        hostport: "2338",
        mapname: "",
        gametype: "",
        numplayers: "0",
        maxplayers: "79",
        gamemode: "openplaying",
        timeleft: "0",
        param1: "0",
        param2: "0",
        actver: "199",
        reqver: "199",
        mod: "RES;@WW2_MP_V3",
        equalModRequired: "1",
        password: "0",
        gstate: "2",
        impl: "sockets",
        platform: "win",
        players: [],
        replied_in: 0.04664288298226893
      },
      status: 200
    });

    let server = new OfpServer("1.2.3.4:1000");
    server.refresh().then(() => {
      expect(server.payload["gamename"]).to.eq("opflashr");
      expect(server.loaded).to.eq(true);
      expect(server.error).to.eq(false);
      expect(server.players).to.eq(0);
    });
  });
});
