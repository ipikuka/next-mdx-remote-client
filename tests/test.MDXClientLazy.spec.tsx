import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { MDXClientLazy, serialize } from "../src/csr";
import ErrorBoundary from "./ErrorBoundarySimple";

describe("MDXClientLazy", () => {
  const ErrorComponent = ({ error }: { error: Error }) => {
    return <div data-testid="mdx-error">{error.message}</div>;
  };

  const components = {
    Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    wrapper: (props: { children: any }) => {
      return <div data-testid="mdx-layout">{props.children}</div>;
    },
  };

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

    render(<MDXClientLazy components={components} {...mdxSource} onError={ErrorComponent} />);

    await waitFor(() =>
      // @ts-expect-error
      expect(screen.queryByTestId("mdx-layout")).toContainHTML(
        "<p>hi <strong>ipikuka</strong></p>",
      ),
    );
  });

  test("works with catchable errors", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(<MDXClientLazy components={components} {...mdxSource} onError={ErrorComponent} />);

    await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-error")).toMatchInlineSnapshot(`
      <div
        data-testid="mdx-error"
      >
        await is only valid in async functions and the top level bodies of modules
      </div>
    `);
  });

  test("has problem working with uncatchable errors", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <ErrorBoundary fallback={<div data-testid="mdx-error">Something went wrong</div>}>
        <MDXClientLazy components={components} {...mdxSource} onError={ErrorComponent} />
      </ErrorBoundary>,
    );

    try {
      await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

      // it doesn't catch expected error "bar is not defined"
      expect(screen.queryByTestId("mdx-error")).toBeUndefined();
    } catch (error) {
      // it doesn't catch expected error "bar is not defined"
      expect(error).toMatchInlineSnapshot(
        `[AssertionError: expected <div data-testid="mdx-error"></div> to be undefined]`,
      );
    }
  });
});
