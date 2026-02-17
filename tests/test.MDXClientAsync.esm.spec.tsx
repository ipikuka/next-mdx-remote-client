import { vi, describe, expect, test } from "vitest";

import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { MDXClientAsync, type MDXComponents } from "../src/csr";
import { serialize } from "../src/csr/serialize.js";

import { ErrorBoundary } from "./ErrorBoundaryForTests.js";

describe("MDXClientAsync", () => {
  const LoadingComponent = () => {
    return <div data-testid="mdx-loading">loading</div>;
  };

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
      <MDXClientAsync
        components={mdxComponents}
        {...mdxSource}
        loading={LoadingComponent}
        onError={ErrorComponent}
      />,
    );

    const loadingDiv = screen.queryByTestId("mdx-loading");
    expect(loadingDiv?.innerHTML).toEqual("loading");

    await waitFor(() => {
      const layoutDiv = screen.queryByTestId("mdx-layout");
      expect(layoutDiv?.innerHTML).toContain("<p>hi <strong>ipikuka</strong></p>");
    });
  });

  test("works with catchable errors 1", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <MDXClientAsync
        components={mdxComponents}
        {...mdxSource}
        loading={LoadingComponent}
        onError={ErrorComponent}
      />,
    );

    const loadingDiv = screen.queryByTestId("mdx-loading");
    expect(loadingDiv?.innerHTML).toEqual("loading");

    await screen.findByTestId("mdx-error", {}, { timeout: 2000 });
    expect(screen.queryByTestId("mdx-error")).toMatchInlineSnapshot(`
      <div
        data-testid="mdx-error"
      >
        Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`
      </div>
    `);
  });

  test("works with catchable errors 2", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <MDXClientAsync
        components={mdxComponents}
        {...mdxSource}
        loading={LoadingComponent}
        onError={ErrorComponent}
        options={{ baseUrl: "https://gist.githubusercontent.com/Bar.mjs" }}
      />,
    );

    const loadingDiv = screen.queryByTestId("mdx-loading");
    expect(loadingDiv?.innerHTML).toEqual("loading");

    await screen.findByTestId("mdx-error", {}, { timeout: 2000 });
    expect(screen.queryByTestId("mdx-error")?.innerHTML).toContain(
      "Cannot find package 'y' imported from",
    );
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
        <MDXClientAsync
          components={mdxComponents}
          {...mdxSource}
          loading={LoadingComponent}
          onError={ErrorComponent}
        />
      </ErrorBoundary>,
    );

    const loadingDiv = screen.queryByTestId("mdx-loading");
    expect(loadingDiv).toHaveTextContent("loading");
    expect(loadingDiv?.innerHTML).toEqual("loading");

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

    const errorDiv = await screen.findByTestId("mdx-error", {}, { timeout: 2000 });
    expect(errorDiv).toHaveTextContent("Something went wrong");
    expect(errorDiv.innerHTML).toEqual("Something went wrong");

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
