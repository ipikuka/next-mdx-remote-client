import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import { MDXClientAsync, type MDXComponents } from "../src/csr";
import { serialize } from "../src/csr/serialize.js";
import ErrorBoundary from "./ErrorBoundarySimple.jsx";

describe("MDXClientAsync", () => {
  const LoadingComponent = () => {
    return <div data-testid="mdx-loading">loading</div>;
  };

  const ErrorComponent = ({ error }: { error: Error }) => {
    return <div data-testid="mdx-error">{error.message}</div>;
  };

  const mdxComponents = {
    Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    wrapper: (props: React.ComponentProps<"div"> & { components: MDXComponents }) => {
      const { components, children, ...rest } = props; // eslint-disable-line @typescript-eslint/no-unused-vars
      return (
        <div data-testid="mdx-layout" {...rest}>
          {children}
        </div>
      );
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

    render(
      <MDXClientAsync
        components={mdxComponents}
        {...mdxSource}
        loading={LoadingComponent}
        onError={ErrorComponent}
      />,
    );

    await screen.findByTestId("mdx-loading", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-loading")?.innerHTML).toEqual("loading");

    await screen.findByTestId("mdx-layout", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-layout")?.innerHTML).toContain(
      "<p>hi <strong>ipikuka</strong></p>",
    );
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

    await screen.findByTestId("mdx-loading", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-loading")?.innerHTML).toEqual("loading");

    await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-error")).toMatchInlineSnapshot(`
      <div
        data-testid="mdx-error"
      >
        Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`
      </div>
    `);
  });

  test.skip("works with catchable errors 2", async () => {
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

    await screen.findByTestId("mdx-loading", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-loading")?.innerHTML).toEqual("loading");

    await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-error")?.innerHTML).toContain(
      "Cannot find package 'y' imported from",
    );
  });

  test.skip("has problem working with uncatchable errors", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    render(
      <ErrorBoundary fallback={<div data-testid="mdx-error">Something went wrong</div>}>
        render(
        <MDXClientAsync
          components={mdxComponents}
          {...mdxSource}
          loading={LoadingComponent}
          onError={ErrorComponent}
        />
        , );
      </ErrorBoundary>,
    );

    await screen.findByTestId("mdx-loading", {}, { timeout: 2000 });

    expect(screen.queryByTestId("mdx-loading")?.innerHTML).toEqual("loading");

    try {
      await screen.findByTestId("mdx-error", {}, { timeout: 2000 });

      // it doesn't catch expected error "bar is not defined"
      expect(screen.queryByTestId("mdx-error")).toBeUndefined();
    } catch (error) {
      // it doesn't catch expected error "bar is not defined"
      expect(error).toMatchInlineSnapshot();
    }
  });
});
