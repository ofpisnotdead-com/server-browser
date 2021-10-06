import { expect, fixture } from '@open-wc/testing';
import { html } from "lit/static-html.js";

import { OfpMonitorPlayers } from "./ofp-monitor-players";

let renderComponent = (async () => {
  let players = ["retro", "Tony"];

  let el = await fixture(html
    `<ofp-monitor-players numPlayers=2 maxPlayers=10 .playerNames=${players}>
    </ofp-monitor-players>
  `);

  return el;
});

describe("ofp-monitor-players", () => {

  it('is a component', () => {
    let el = document.createElement('ofp-monitor-players');
    expect(el).to.be.an.instanceOf(OfpMonitorPlayers);
  });

  it("is rendered without players and shows players on click", async () => {
    let el = await renderComponent() as OfpMonitorPlayers;
    let wrapper = el.shadowRoot!.querySelector('div') as HTMLElement;

    expect(el).shadowDom.to.equal(`
      <div>2/10</div>
    `);

    // open players
    wrapper.click();
    await el.updateComplete;

    expect(el).shadowDom.to.equal(`
      <div>
        2/10
        <p>
        retro
        <br>
        Tony
        <br>
      </div>
    `);

    // close players again
    wrapper.click();
    await el.updateComplete;

    expect(el).shadowDom.to.equal(`
      <div>2/10</div>
    `);
  });
});

