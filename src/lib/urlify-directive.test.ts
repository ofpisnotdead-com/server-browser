import { expect } from "@esm-bundle/chai";
import { urlify } from "./urlify-directive";
import { html, render } from "lit-html";

describe("urlify", () => {
  function replaceUrl(text: string) {
    let el = document.createElement("div");
    render(html`${urlify(text)}`, el);
    return el.innerHTML;
  }

  it("recognizes link", () => {
    expect(replaceUrl("http://ryba.cz")).to.include("href");
    expect(replaceUrl("https://ryba.cz")).to.include("href");
    expect(replaceUrl("www.ryba.cz")).to.include("href");
    expect(replaceUrl("WWW.RYBA.CZ")).to.include("href");
    expect(replaceUrl("ryba.cz")).to.include("href");
  });

  it("recognizes multiple links within text", () => {
    let urls = replaceUrl("abc http://ryba.cz abc salam.cz");
    expect(urls).to.include('href="http://ryba.cz"');
    expect(urls).to.include('href="http://salam.cz"');
  });

  it("recognizes plain string", () => {
    expect(replaceUrl("1.99")).to.not.include("href");
    expect(replaceUrl("ryba s máslem")).to.not.include("href");
    expect(replaceUrl("TZK_4.0.5")).to.not.include("href");
  });
});
