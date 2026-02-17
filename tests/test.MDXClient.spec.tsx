import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, test } from "vitest";
import { MDXClient } from "../src/csr";
import { serialize } from "../src/csr/serialize.js";

import { ErrorBoundary } from "./ErrorBoundaryForTests.js";

describe("MDXClient", () => {
  test("works", async () => {
    const mdxSource = await serialize({
      source: "hi <Test name={bar} />",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    const components = {
      Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    };

    expect(
      ReactDOMServer.renderToStaticMarkup(<MDXClient components={components} {...mdxSource} />),
    ).toMatchInlineSnapshot(`"<p>hi <strong>ipikuka</strong></p>"`);
  });

  test("works with catchable errors", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    const onError = ({ error }: { error: Error }) => {
      return <div>{error.message}</div>;
    };

    expect(() =>
      ReactDOMServer.renderToStaticMarkup(<MDXClient {...mdxSource} />),
    ).toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: await is only valid in async functions and the top level bodies of modules]`,
    );

    expect(
      ReactDOMServer.renderToStaticMarkup(<MDXClient {...mdxSource} onError={onError} />),
    ).toMatchInlineSnapshot(
      `"<div>await is only valid in async functions and the top level bodies of modules</div>"`,
    );
  });

  test("has problem working with uncatchable errors", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    const onError = ({ error }: { error: Error }) => {
      return <div>{error.message}</div>;
    };

    // throws error only during render
    expect(() =>
      ReactDOMServer.renderToStaticMarkup(<MDXClient {...mdxSource} />),
    ).toThrowErrorMatchingInlineSnapshot(`[ReferenceError: bar is not defined]`);

    // even the ErrorBoundary couldn't catch the error, don't know why?
    expect(() =>
      ReactDOMServer.renderToStaticMarkup(
        <ErrorBoundary
          fallback={<div data-testid="mdx-error">Something went wrong</div>}
          onError={(error) => {
            console.log(error);
          }}
        >
          <MDXClient {...mdxSource} onError={onError} />
        </ErrorBoundary>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[ReferenceError: bar is not defined]`);
  });
});
