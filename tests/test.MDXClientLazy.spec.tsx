import { vi, describe, expect, test } from "vitest";

import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { MDXClientLazy, type MDXComponents } from "../src/csr";
import { serialize } from "../src/csr/serialize.js";

import { ErrorBoundary } from "./ErrorBoundaryForTests.js";

describe("MDXClientLazy", () => {
  const ErrorComponent = ({ error }: { error: Error }) => {
    return <div data-testid="mdx-error">{error.message}</div>;
  };

  const mdxComponents = {
    Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    wrapper: (props: ComponentProps<"div"> & { components: MDXComponents }) => {
      const { components, children, ...rest } = props; // eslint-disable-line @typescript-eslint/no-unused-vars
      return (
        <div data-testid="mdx-layout" {...rest}>
          {children}
        </div>
      );
    },
  };

  test("works as expected", async () => {
    const mdxSource = await serialize({
      source: "hi <Test name={bar} />",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <MDXClientLazy components={mdxComponents} {...mdxSource} onError={ErrorComponent} />,
    );

    await waitFor(() => {
      const layoutDiv = screen.queryByTestId("mdx-layout");
      expect(layoutDiv?.innerHTML).toContain("<p>hi <strong>ipikuka</strong></p>");
    });
  });

  test("works with catchable errors", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <MDXClientLazy components={mdxComponents} {...mdxSource} onError={ErrorComponent} />,
    );

    const errorDiv = await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

    expect(errorDiv).toMatchInlineSnapshot(`
      <div
        data-testid="mdx-error"
      >
        await is only valid in async functions and the top level bodies of modules
      </div>
    `);
  });

  test("uncatchable runtime error", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const onError = vi.fn();

    render(
      <ErrorBoundary
        fallback={<div data-testid="mdx-error">Something went wrong</div>}
        onError={onError}
      >
        <MDXClientLazy components={mdxComponents} {...mdxSource} onError={ErrorComponent} />
      </ErrorBoundary>,
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "ReferenceError",
          message: expect.stringContaining("bar is not defined"),
        }),
        expect.objectContaining({
          componentStack: expect.stringContaining("_createMdxContent"),
        }),
      ),
    );

    const errorDiv = await screen.findByTestId("mdx-error");
    expect(errorDiv).toHaveTextContent("Something went wrong");

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
