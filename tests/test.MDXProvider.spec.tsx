import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, test } from "vitest";
import { serialize } from "../src/csr/serialize.js";
import { MDXClient, MDXProvider } from "../src/csr/index.js";

// the test cases are taken from `@mdx-js/react`for reference
describe("MDXProvider", () => {
  test("should support `components` with `MDXProvider`", async () => {
    const mdxSource = await serialize({
      source: "# hi",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            h1(properties) {
              return <h1 style={{ color: "tomato" }} {...properties} />;
            },
          }}
        >
          <MDXClient {...mdxSource} />
        </MDXProvider>,
      ),
      '<h1 style="color:tomato">hi</h1>',
    );
  });

  test("should support `wrapper` in `components`", async () => {
    const mdxSource = await serialize({
      source: "# hi",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    const CustomWrapper: React.FC<React.PropsWithChildren> = (properties) => {
      return <div id="layout" {...properties} />;
    };

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            wrapper: CustomWrapper,
          }}
        >
          <MDXClient {...mdxSource} />
        </MDXProvider>,
      ),
      '<div id="layout"><h1>hi</h1></div>',
    );
  });

  test("should combine components in nested `MDXProvider`s", async () => {
    const mdxSource = await serialize({
      source: "# hi\n## hello",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            h1(properties) {
              return <h1 style={{ color: "tomato" }} {...properties} />;
            },
            h2(properties) {
              return <h2 style={{ color: "rebeccapurple" }} {...properties} />;
            },
          }}
        >
          <MDXProvider
            components={{
              h2(properties) {
                return <h2 style={{ color: "papayawhip" }} {...properties} />;
              },
            }}
          >
            <MDXClient {...mdxSource} />
          </MDXProvider>
        </MDXProvider>,
      ),
      '<h1 style="color:tomato">hi</h1>\n<h2 style="color:papayawhip">hello</h2>',
    );
  });

  test("should support components as a function", async () => {
    const mdxSource = await serialize({
      source: "# hi\n## hello",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            h1(properties) {
              return <h1 style={{ color: "tomato" }} {...properties} />;
            },
            h2(properties) {
              return <h2 style={{ color: "rebeccapurple" }} {...properties} />;
            },
          }}
        >
          <MDXProvider
            components={function () {
              return {
                h2(properties) {
                  return <h2 style={{ color: "papayawhip" }} {...properties} />;
                },
              };
            }}
          >
            <MDXClient {...mdxSource} />
          </MDXProvider>
        </MDXProvider>,
      ),
      '<h1>hi</h1>\n<h2 style="color:papayawhip">hello</h2>',
    );
  });

  test("should support a `disableParentContext` prop (sandbox)", async () => {
    const mdxSource = await serialize({
      source: "# hi",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            h1(properties) {
              return <h1 style={{ color: "tomato" }} {...properties} />;
            },
          }}
        >
          <MDXClient {...mdxSource} disableParentContext />
        </MDXProvider>,
      ),
      "<h1>hi</h1>",
    );
  });

  test("should support a `disableParentContext` *and* `components` as a function", async () => {
    const mdxSource = await serialize({
      source: "# hi\n## hello",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <MDXProvider
          components={{
            h1(properties) {
              return <h1 style={{ color: "tomato" }} {...properties} />;
            },
          }}
        >
          <MDXProvider
            disableParentContext
            components={function () {
              return {
                h2(properties) {
                  return <h2 style={{ color: "papayawhip" }} {...properties} />;
                },
              };
            }}
          >
            <MDXClient {...mdxSource} />
          </MDXProvider>
        </MDXProvider>,
      ),
      '<h1>hi</h1>\n<h2 style="color:papayawhip">hello</h2>',
    );
  });
});
