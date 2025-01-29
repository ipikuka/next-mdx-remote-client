import React from "react";
import { describe, expect, test } from "vitest";
import { MDXRemote, type MDXRemoteOptions, type MDXComponents } from "../src/rsc";
// import { render, screen } from "@testing-library/react";
import ReactDOMServer from "react-dom/server";

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
      const { components, children, ...rest } = props;
      return (
        <div data-testid="mdx-layout" {...rest}>
          {children}
        </div>
      );
    },
  };

  test("works", async () => {
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

  test("works with catchable error but no Error Component", async () => {
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
  });

  test("works with catchable errors 1", async () => {
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

  test("works with catchable errors 2", async () => {
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
  });

  test("has problem working with uncatchable errors", async () => {
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
