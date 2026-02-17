import { vi, describe, test, expect } from "vitest";

import type { Plugin } from "unified";
import { VFile } from "vfile";
import dedent from "dedent";
import remarkEmoji from "remark-emoji";
import remarkFlexibleMarkers from "remark-flexible-markers";
import recmaMdxChangeProps from "recma-mdx-change-props";
import recmaMdxEscapeMissingComponents from "recma-mdx-escape-missing-components";

import { MDXRemote, type MDXRemoteOptions, type MDXComponents } from "../src/rsc";
import { compile } from "../src/lib/compile";

import { renderToStringFromStream } from "./utils";

describe("MDXRemote", () => {
  test("simple", async () => {
    const source = "foo **bar**";

    const element = <MDXRemote source={source} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`"<p>foo <strong>bar</strong></p>"`);
  });

  test("with component 1", async () => {
    const source = 'foo <Test name="test" />';

    const element = (
      <MDXRemote
        source={source}
        components={{
          Test: ({ name }: { name: string }) => <span>hello {name}</span>,
        }}
      />
    );

    // React inserts a <!-- --> comment in streaming SSR to separate adjacent text nodes.
    const content = await renderToStringFromStream(element);
    expect(content).toMatchInlineSnapshot(`"<p>foo <span>hello <!-- -->test</span></p>"`);

    const contentStrippedComments = await renderToStringFromStream(element, {
      stripReactSSRComments: true,
    });

    expect(contentStrippedComments).toMatchInlineSnapshot(
      `"<p>foo <span>hello test</span></p>"`,
    );
  });

  test("with component 2", async () => {
    const source = 'foo <Test name="test" />';

    const element = (
      <MDXRemote
        source={source}
        components={{
          Test: ({ name }: { name: string }) => <span>{`hello ${name}`}</span>,
        }}
      />
    );

    // strpping comment is NOT needed because the text is concatenated into a single node.
    const content = await renderToStringFromStream(element);
    expect(content).toMatchInlineSnapshot(`"<p>foo <span>hello test</span></p>"`);
  });

  test("with some remarkPlugins in mdxOptions", async () => {
    const source = "==hello :tada: Talat Kuyuk==";

    const options: MDXRemoteOptions = {
      mdxOptions: {
        remarkPlugins: [remarkFlexibleMarkers, remarkEmoji],
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(
      `"<p><mark class="flexible-marker flexible-marker-default">hello 🎉 Talat Kuyuk</mark></p>"`,
    );
  });

  test("with scope", async () => {
    const source = "hi {bar}";

    const options: MDXRemoteOptions = {
      scope: {
        bar: "ipikuka",
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<p>hi ipikuka</p>"`);
  });

  test("with scope and component", async () => {
    const source = "hi <Test name={bar} />";

    const options: MDXRemoteOptions = {
      scope: {
        bar: "ipikuka",
      },
    };

    const components = {
      Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    };

    const element = <MDXRemote source={source} options={options} components={components} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`"<p>hi <strong>ipikuka</strong></p>"`);
  });

  test("with scope in which consists props key escaped with no reason", async () => {
    const source = dedent`
      Hi {props.bar}
      <Test name={props.foo} />
    `;

    const options: MDXRemoteOptions = {
      scope: {
        props: {
          bar: "barbar",
          foo: "foofoo",
        },
      },
    };

    const components = {
      Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    };

    const element = <MDXRemote source={source} options={options} components={components} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<p>Hi </p>
      <strong></strong>"
    `);
  });

  test("with scope in which consists props key works as expected using a recma plugin", async () => {
    const source = dedent`
      Hi {props.bar}
      <Test name={props.foo} />
    `;

    const options: MDXRemoteOptions = {
      scope: {
        props: {
          bar: "barbar",
          foo: "foofoo",
        },
      },
      mdxOptions: {
        recmaPlugins: [recmaMdxChangeProps],
      },
    };

    const components = {
      Test: ({ name }: { name: string }) => <strong>{name}</strong>,
    };

    const element = <MDXRemote source={source} options={options} components={components} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`
      "<p>Hi barbar</p>
      <strong>foofoo</strong>"
    `);
  });

  test("with frontmatter supplying frontmatter's type argument", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      ## {frontmatter.title}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<h2>My Article</h2>"
    `);
  });

  test("with frontmatter and scope", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title}
      Hi *{name}*
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      scope: { name: "Talat Kuyuk" },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<h1>My Article</h1>
      <p>Hi <em>Talat Kuyuk</em></p>"
    `);
  });

  test("strips any undefined frontmatters without giving an error", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      The title is {frontmatter.title} and {frontmatter.subtitle}.
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`
      "<p>The title is My Article and .</p>"
    `);
  });

  test("supports component names with a dot(.)", async () => {
    const source = "<motion.p />";

    const components: MDXComponents = {
      // @ts-ignore no match for the signature
      motion: { p: () => <p>Hello world</p> },
    };

    const element = <MDXRemote source={source} components={components} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<p>Hello world</p>"
    `);
  });

  test("renders fragments", async () => {
    const source = "<Test content={<>Renders fragments</>} />";

    const components = {
      Test: ({ content }: { content: string }) => <>{content}</>,
    };

    const element = <MDXRemote source={source} components={components} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "Renders fragments"
    `);
  });

  test("supports VFile", async () => {
    const source = new VFile("foo **bar**");

    const element = <MDXRemote source={source} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<p>foo <strong>bar</strong></p>"
    `);
  });

  test("supports Buffer", async () => {
    const source = Buffer.from("foo **bar**");

    const element = <MDXRemote source={source} />;
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`
      "<p>foo <strong>bar</strong></p>"
    `);
  });

  test("debug compiled source", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await compile(new VFile("Hi"));

    await renderToStringFromStream(
      <MDXRemote source="Hi" options={{ debug: { compiledSource: true } }} />,
    );

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(String(result.compiledSource));

    logSpy.mockRestore(); // Restore original console.log behavior
  });
});

describe("vfileDataIntoScope in MDXRemote function, no scope but vfileDataIntoScope injects data into scope", () => {
  const remarkAddBarFoo: Plugin = () => (_, file) => {
    file.data["bar"] = "barbar";
    file.data["foo"] = "foofoo";
  };

  test("Throw error for missing expression in scope, no 'vfileDataIntoScope'", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {bar} {foo}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;

    try {
      await renderToStringFromStream(element);
    } catch (error) {
      // Because the first non-exist expression in scope is bar in the content
      expect(error).toMatchInlineSnapshot(`[ReferenceError: bar is not defined]`);
    }
  });

  test("Throw error for missing expression in scope, no cover 'vfileDataIntoScope' - string", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {bar} {foo}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      vfileDataIntoScope: "bar",
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;

    try {
      await renderToStringFromStream(element);
    } catch (error) {
      // Because, bar is in scope (thanks to vfileDataIntoScope), but foo
      expect(error).toMatchInlineSnapshot(`[ReferenceError: foo is not defined]`);
    }
  });

  test("works with the option 'vfileDataIntoScope' - string array", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {bar} {foo}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      vfileDataIntoScope: ["bar", "foo"],
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<h1>My Article barbar foofoo</h1>"`);
  });

  test("works with the option 'vfileDataIntoScope' - boolean true", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {bar} {foo}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      vfileDataIntoScope: true,
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<h1>My Article barbar foofoo</h1>"`);
  });

  test("works the option 'vfileDataIntoScope' - object", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {mymatter.title}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      vfileDataIntoScope: { name: "matter", as: "mymatter" },
    };

    // file.matter is created by `parseFrontmatter: true`
    // vfileDataIntoScope injects it as `mymatter` into scope

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<h1>My Article</h1>"`);
  });

  test("works the option 'vfileDataIntoScope' - object array", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {newbar} {newfoo}
    `;

    const options: MDXRemoteOptions = {
      scope: {},
      parseFrontmatter: true,
      vfileDataIntoScope: [
        { name: "bar", as: "newbar" },
        { name: "foo", as: "newfoo" },
      ],
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<h1>My Article barbar foofoo</h1>"`);
  });

  test("works the option 'vfileDataIntoScope' - mixed array", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title} {bar} {newfoo}
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
      vfileDataIntoScope: ["bar", { name: "foo", as: "newfoo" }],
      mdxOptions: {
        remarkPlugins: [remarkAddBarFoo],
      },
    };

    const element = <MDXRemote source={source} options={options} />;
    const content = await renderToStringFromStream(element, { stripReactSSRComments: true });

    expect(content).toMatchInlineSnapshot(`"<h1>My Article barbar foofoo</h1>"`);
  });
});

describe("error handling in MDXRemote", () => {
  const ErrorComponent = ({ error }: { error: Error }) => {
    return <div data-testid="mdx-error">{error.message}</div>;
  };

  test("prints helpful message from compile MDX error, no Error component", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      This is very bad syntax <GITHUB_USER>
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
    };

    const element = <MDXRemote source={source} options={options} />;

    try {
      const content = await renderToStringFromStream(element);
      expect(content).toMatchInlineSnapshot(); // above render throwed error, so no content
    } catch (error) {
      // The error is thrown as a raw Error object (not rendered to HTML)
      expect(error).toMatchInlineSnapshot(`
        [Error: [next-mdx-remote-client] error compiling MDX:
        Expected a closing tag for \`<GITHUB_USER>\` (1:25-1:38) before the end of \`paragraph\`

        > 1 | This is very bad syntax <GITHUB_USER>
            |                         ^

        More information: https://mdxjs.com/docs/troubleshooting-mdx]
      `);
    }

    // the second way of testing
    await expect(renderToStringFromStream(element)).rejects.toMatchInlineSnapshot(`
      [Error: [next-mdx-remote-client] error compiling MDX:
      Expected a closing tag for \`<GITHUB_USER>\` (1:25-1:38) before the end of \`paragraph\`

      > 1 | This is very bad syntax <GITHUB_USER>
          |                         ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx]
    `);
  });

  test("prints helpful message from compile MDX error, with Error component", async () => {
    // This test shows that MDX syntax errors are catched by `next-mdx-remote-client`

    const source = dedent`
      ---
      title: 'My Article'
      ---
      This is very bad syntax <GITHUB_USER>
    `;

    const options: MDXRemoteOptions = {
      parseFrontmatter: true,
    };

    const element = <MDXRemote source={source} options={options} onError={ErrorComponent} />;
    const content = await renderToStringFromStream(element);

    // The error is rendered inside a React component (ErrorComponent) and thus HTML-escaped by React
    expect(content).toMatchInlineSnapshot(`
      "<div data-testid="mdx-error">[next-mdx-remote-client] error compiling MDX:
      Expected a closing tag for \`&lt;GITHUB_USER&gt;\` (1:25-1:38) before the end of \`paragraph\`

      &gt; 1 | This is very bad syntax &lt;GITHUB_USER&gt;
          |                         ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx</div>"
    `);
  });

  test("missing a scope value causes runtime error during render, no Error component", async () => {
    const source = "hi {bar}";
    const element = <MDXRemote source={source} />;

    try {
      const content = await renderToStringFromStream(element); // the render throws an error
      expect(content).toMatchInlineSnapshot(); // so no content
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`[ReferenceError: bar is not defined]`);
    }

    // the second way of testing
    await expect(renderToStringFromStream(element)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ReferenceError: bar is not defined]`,
    );
  });

  test("missing a scope value causes runtime error during render, with Error component", async () => {
    // This test shows that a runtime error can not be catched by `next-mdx-remote-client`

    const source = "hi {bar}";
    const element = <MDXRemote source={source} onError={ErrorComponent} />;

    try {
      const content = await renderToStringFromStream(element); // the render throws an error
      expect(content).toMatchInlineSnapshot(); // so no content
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`[ReferenceError: bar is not defined]`);
    }

    // the second way of testing
    await expect(renderToStringFromStream(element)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ReferenceError: bar is not defined]`,
    );
  });

  test("missing a component causes runtime error during render, no Error component", async () => {
    const source = "hi <Test />";
    const element = <MDXRemote source={source} />;

    try {
      const content = await renderToStringFromStream(element); // the render throws an error
      expect(content).toMatchInlineSnapshot(); // so no content
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[Error: Expected component \`Test\` to be defined: you likely forgot to import, pass, or provide it.]`,
      );
    }

    // the second way of testing
    await expect(renderToStringFromStream(element)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected component \`Test\` to be defined: you likely forgot to import, pass, or provide it.]`,
    );
  });

  test("missing a component causes runtime error during render, with Error component", async () => {
    // This test shows that a runtime error can not be catched by `next-mdx-remote-client`

    const source = "hi <Test />";
    const element = <MDXRemote source={source} onError={ErrorComponent} />;

    try {
      const content = await renderToStringFromStream(element); // the render throws an error
      expect(content).toMatchInlineSnapshot(); // so no content
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[Error: Expected component \`Test\` to be defined: you likely forgot to import, pass, or provide it.]`,
      );
    }

    // the second way of testing
    await expect(renderToStringFromStream(element)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected component \`Test\` to be defined: you likely forgot to import, pass, or provide it.]`,
    );
  });

  test("missing components can be escaped via a recma plugin without giving runtime error", async () => {
    const source = "hi <Test />";

    const element = (
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            recmaPlugins: [recmaMdxEscapeMissingComponents],
          },
        }}
      />
    );
    const content = await renderToStringFromStream(element);

    expect(content).toMatchInlineSnapshot(`"<p>hi </p>"`);
  });
});
