/*eslint no-cond-assign: "error"*/

import { Directive, directive } from "lit/directive.js";
import { html } from "lit";

const urlRegex = /(https?:\/\/)?[a-zA-Z][-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/g;

// Define directive
class UrlifyDirective extends Directive {
  linkifyUrl(url: string) {
    let link = url;
    if (!link.match("^https?://")) {
      link = "http://" + link;
    }

    return html`<a href=${link} target="_blank" rel="noopener noreferrer"
      >${url}</a
    >`;
  }

  getSegments(rex: RegExp, str: string) {
    let segments = [];
    let lastIndex = 0;
    let match;
    rex.lastIndex = 0; // In case there's a dangling previous search

    while ((match = rex.exec(str))) {
      if (match.index > lastIndex) {
        segments.push(str.substring(lastIndex, match.index));
      }

      segments.push(this.linkifyUrl(match[0]));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < str.length) {
      segments.push(str.substring(lastIndex));
    }

    return segments;
  }

  render(title: string) {
    return this.getSegments(urlRegex, title);
  }
}
// Create the directive function
export const urlify = directive(UrlifyDirective);
