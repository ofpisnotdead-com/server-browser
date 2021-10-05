import { expect } from "@esm-bundle/chai";
import { OfpMonitorPlayers } from "./ofp-monitor-players";

describe("ofp-monitor-players", () => {
  it('is a component', () => {
    let el = document.createElement('ofp-monitor-players');
    expect(el).to.be.an.instanceOf(OfpMonitorPlayers);
  });
});

