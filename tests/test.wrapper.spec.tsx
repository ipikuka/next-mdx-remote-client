import { describe, test, expect } from "vitest";

import React from "react";
import ReactDOMServer from "react-dom/server";

import { evaluate } from "../src/rsc";

describe("evaluate function with wrapper", () => {
  test("wrapper component - 1", async () => {
    const { content } = await evaluate({
      source: "foo **bar**",
      components: {
        wrapper: "div",
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div components="[object Object]"><p>foo <strong>bar</strong></p></div>"`,
    );
  });

  test("wrapper component - 2", async () => {
    const { content } = await evaluate({
      source: "foo **bar**",
      components: {
        wrapper(props) {
          return <div id="layout" {...props} />;
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div id="layout" components="[object Object]"><p>foo <strong>bar</strong></p></div>"`,
    );
  });

  test("wrapper component - 3 - extract the prop 'components'", async () => {
    const { content } = await evaluate({
      source: "foo **bar**",
      components: {
        wrapper(props) {
          const { components, ...rest } = props; // eslint-disable-line @typescript-eslint/no-unused-vars
          return React.createElement("article", { id: "custom-article", ...rest });
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<article id="custom-article"><p>foo <strong>bar</strong></p></article>"`,
    );
  });

  test("wrapper component without supplying props", async () => {
    const { content } = await evaluate({
      source: "foo **bar**",
      components: {
        wrapper() {
          return <div id="layout" />;
        },
      },
    });

    // it didn't render the mdx
    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div id="layout"></div>"`,
    );
  });
});
