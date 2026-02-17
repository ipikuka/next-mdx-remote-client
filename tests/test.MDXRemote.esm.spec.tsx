import { describe, expect, test } from "vitest";

import React from "react";
import ReactDOMServer from "react-dom/server";
import { render, screen } from "@testing-library/react";

import { MDXRemote, type MDXRemoteOptions, type MDXComponents } from "../src/rsc";

describe("MDXRemote", () => {
  // const LoadingComponent = () => {
  //   return <div data-testid="mdx-loading">loading</div>;
  // };

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

  test("works (as func)", async () => {
    const source = "hi <Test name={bar} />";

    const options: MDXRemoteOptions = {
      scope: {
        bar: "ipikuka",
      },
    };

    const content = await MDXRemote({
      source,
      options,
      components: mdxComponents,
      onError: ErrorComponent,
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div data-testid="mdx-layout"><p>hi <strong>ipikuka</strong></p></div>"`,
    );
  });

  test("works with catchable error but no Error Component (as func)", async () => {
    const source = "import x from 'y'";

    try {
      await MDXRemote({
        source,
        components: mdxComponents,
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[Error: Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`]`,
      );
    }

    // second way

    await expect(
      MDXRemote({
        source,
        components: mdxComponents,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`]`,
    );
  });

  test("works with catchable error, with Error component (as func)", async () => {
    const source = "import x from 'y'";

    const content = await MDXRemote({
      source,
      components: mdxComponents,
      onError: ErrorComponent,
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div data-testid="mdx-error">Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`</div>"`,
    );
  });

  test("catchable error (as func)", async () => {
    const source = "import x from 'y'";

    const options: MDXRemoteOptions = {
      mdxOptions: {
        baseUrl: import.meta.url,
      },
    };

    const content = await MDXRemote({
      source,
      options,
      components: mdxComponents,
      onError: ErrorComponent,
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toContain("Cannot find package");
    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatch(/Cannot find package/);

    // just for testing it with @testing-library
    render(content);
    expect(screen.getByTestId("mdx-error")).toHaveTextContent("Cannot find package 'y'");
  });

  test("uncatchable error (as func)", async () => {
    const source = "hi {bar}";

    const content = await MDXRemote({
      source,
      components: mdxComponents,
      onError: ErrorComponent,
    });

    expect(() =>
      ReactDOMServer.renderToStaticMarkup(content),
    ).toThrowErrorMatchingInlineSnapshot(`[ReferenceError: bar is not defined]`);
  });
});
