import { describe, test, expect } from "vitest";

import React from "react";
import ReactDOMServer from "react-dom/server";
import { VFile } from "vfile";
import dedent from "dedent";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkEmoji from "remark-emoji";
import recmaMdxEscapeMissingComponents from "recma-mdx-escape-missing-components";
import recmaMdxChangeProps from "recma-mdx-change-props";

import { serialize, hydrate, type SerializeOptions } from "../src/csr";

type Frontmatter = { title: string };

describe("serialize & hydrate", () => {
  test("simple", async () => {
    const mdxSource = await serialize({
      source: "foo **bar**",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });

  test("with component", async () => {
    const mdxSource = await serialize({
      source: 'foo <Test name="test" />',
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        Test: ({ name }: { name: string }) => <span>hello {name}</span>,
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <span>hello test</span></p>"`,
    );
  });

  test("with some remarkPlugins in mdxOptions", async () => {
    const serializeOptions: SerializeOptions = {
      mdxOptions: {
        remarkPlugins: [remarkFlexibleMarkers, remarkEmoji],
      },
    };

    const mdxSource = await serialize({
      source: "==hello :tada: Talat Kuyuk==",
      options: serializeOptions,
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p><mark class="flexible-marker flexible-marker-default">hello 🎉 Talat Kuyuk</mark></p>"`,
    );
  });

  test("with scope", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({ bar: "ipikuka" });

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>hi ipikuka</p>"`,
    );
  });

  test("with scope and component", async () => {
    const mdxSource = await serialize({
      source: "hi <Test name={bar} />",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({ bar: "ipikuka" });

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>hi <strong>ipikuka</strong></p>"`,
    );
  });

  test("with scope in which consists props key escaped with no reason", async () => {
    const source = dedent`
      Hi {props.bar}
      <Test name={props.foo} />
    `;
    const mdxSource = await serialize({
      source,
      options: {
        scope: {
          props: {
            bar: "barbar",
            foo: "foofoo",
          },
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope.props.bar).toEqual("barbar");
    expect(mdxSource.scope.props.foo).toEqual("foofoo");

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
      "<p>Hi </p>
      <strong></strong>"
    `);
  });

  test("with scope in which consists props key works as expected using a recma plugin", async () => {
    const source = dedent`
      Hi {props.bar}
      <Test name={props.foo} />
    `;
    const mdxSource = await serialize({
      source,
      options: {
        scope: {
          props: {
            bar: "barbar",
            foo: "foofoo",
          },
        },
        mdxOptions: {
          recmaPlugins: [recmaMdxChangeProps],
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope.props.bar).toEqual("barbar");
    expect(mdxSource.scope.props.foo).toEqual("foofoo");

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
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

    // there is a type argument for serialize
    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter.title).toEqual("My Article");
    expect(mdxSource.scope).toEqual({});

    // @ts-expect-error
    expect(mdxSource.frontmatter.blah).toBeUndefined();

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<h2>My Article</h2>"`,
    );
  });

  test("with frontmatter without supplying frontmatter's type argument", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      ## {frontmatter.title}
    `;

    // there is no type argument for serialize
    const mdxSource = await serialize({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter.title).toEqual("My Article");
    expect(mdxSource.scope).toEqual({});

    // it doesn't give any Typescript error
    expect(mdxSource.frontmatter.blah).toBeUndefined();

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<h2>My Article</h2>"`,
    );
  });

  test("with frontmatter and scope", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      # {frontmatter.title}
      Hi *{name}*
    `;

    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
        scope: { name: "Talat Kuyuk" },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter.title).toEqual("My Article");
    expect(mdxSource.scope).toEqual({ name: "Talat Kuyuk" });

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
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

    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter.title).toEqual("My Article");
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>The title is My Article and .</p>"`,
    );
  });

  test("parsed frontmatter should be supplied on the client side", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      The title is {frontmatter.title}
    `;

    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter.title).toEqual("My Article");
    expect(mdxSource.scope).toEqual({});

    const {
      content: content,
      mod,
      error,
    } = hydrate({
      compiledSource: mdxSource.compiledSource,
      frontmatter: mdxSource.frontmatter,
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>The title is My Article</p>"`,
    );

    const {
      content: content_,
      mod: mod_,
      error: error_,
    } = hydrate({
      compiledSource: mdxSource.compiledSource,
    });

    expect(mod_).toEqual({});
    expect(error_).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content_)).toMatchInlineSnapshot(
      `"<p>The title is </p>"`,
    );
  });

  test("supports component names with a dot(.)", async () => {
    const mdxSource = await serialize({
      source: "<motion.p />",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        motion: { p: () => <p>Hello world</p> },
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>Hello world</p>"`,
    );
  });

  test("renders fragments", async () => {
    const mdxSource = await serialize({
      source: "<Test content={<>Renders fragments</>} />",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate({
      ...mdxSource,
      components: {
        Test: ({ content }: { content: string }) => <>{content}</>,
      },
    });

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"Renders fragments"`,
    );
  });

  test("supports VFile", async () => {
    const mdxSource = await serialize({
      source: new VFile("foo **bar**"),
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });

  test("supports Buffer", async () => {
    const mdxSource = await serialize({
      source: Buffer.from("foo **bar**"),
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });
});

describe("serialize & hydrate function with ESM exports", () => {
  test("works with `export` statements", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      export const num = 1
      export let str = 'foo';
      export var bool = true
      export function Component() {
        return 'from component'
      }

      # {num} {str} {String(bool)} <Component />
    `;
    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({ title: "My Article" });
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(error).toBeUndefined();

    expect(mod).toMatchObject({
      Component: expect.any(Function),
      bool: true,
      num: 1,
      str: "foo",
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<h1>1 foo true from component</h1>"`,
    );
  });

  test("remove all `export` statements", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      export const num = 1
      export let str = 'foo';
      export var bool = true

      # Hi

      export function Component() {
        return 'from component'
      }
    `;

    const mdxSource = await serialize<Frontmatter>({
      source,
      options: {
        disableExports: true,
        parseFrontmatter: true,
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({ title: "My Article" });
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`"<h1>Hi</h1>"`);
  });
});

describe("vfileDataIntoScope in serialize function", () => {
  test("works with no option 'vfileDataIntoScope'", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toStrictEqual({});
  });

  test("works the option 'vfileDataIntoScope' - true", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        vfileDataIntoScope: true,
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toEqual({
      matter: { title: "My Article" },
      foo: "foofoo",
      bar: "barbar",
    });
  });

  test("works the option 'vfileDataIntoScope' - string", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        vfileDataIntoScope: "foo",
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toEqual({ foo: "foofoo" });
  });

  test("works the option 'vfileDataIntoScope' - object", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        vfileDataIntoScope: { name: "bar", as: "zig" },
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toEqual({ zig: "barbar" });
  });

  test("works the option 'vfileDataIntoScope' - array", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        vfileDataIntoScope: ["foo", { name: "bar", as: "zig" }],
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toEqual({ foo: "foofoo", zig: "barbar" });
  });

  test("works the option 'vfileDataIntoScope' - frontmatter hack", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await serialize<Frontmatter>({
      source,
      options: {
        scope: {},
        parseFrontmatter: true,
        vfileDataIntoScope: { name: "matter", as: "fronmatter" },
        mdxOptions: {
          remarkPlugins: [
            () => (_, file) => {
              file.data["foo"] = "foofoo";
              file.data["bar"] = "barbar";
            },
          ],
        },
      },
    });

    expect(scope).toEqual({ fronmatter: { title: "My Article" } });
  });
});

describe("error handling in serialize & hydrate", () => {
  test("prints helpful message from compile error", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      This is very bad <GITHUB_USER>
    `;

    const mdxSource = await serialize({
      source,
      options: {
        parseFrontmatter: true,
        scope: { foo: "foofoo" },
      },
    });

    if ("compiledSource" in mdxSource) throw new Error("should have an error !");

    expect(mdxSource.frontmatter).toStrictEqual({ title: "My Article" });
    expect(mdxSource.scope).toStrictEqual({ foo: "foofoo" });

    expect(mdxSource.error.message).toMatchInlineSnapshot(`
      "[next-mdx-remote-client] error compiling MDX:
      Expected a closing tag for \`<GITHUB_USER>\` (1:18-1:31) before the end of \`paragraph\`

      > 1 | This is very bad <GITHUB_USER>
          |                  ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx"
    `);
  });

  test("missing a scope value causes runtime error during render", async () => {
    const mdxSource = await serialize({
      source: "hi {bar}",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`<MDXContent />`);

    expect(() => {
      ReactDOMServer.renderToStaticMarkup(content);
    }).toThrow("bar is not defined");
  });

  test("missing a component causes runtime error during render", async () => {
    const mdxSource = await serialize({
      source: "hi <Test />",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`<MDXContent />`);

    expect(() => {
      ReactDOMServer.renderToStaticMarkup(content);
    }).toThrow(
      "Expected component `Test` to be defined: you likely forgot to import, pass, or provide it.",
    );
  });

  test("missing components can be escaped via a recma plugin without giving runtime error", async () => {
    const mdxSource = await serialize({
      source: "hi <Test />",
      options: {
        mdxOptions: {
          recmaPlugins: [[recmaMdxEscapeMissingComponents, "Test"]],
        },
      },
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});
    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`<MDXContent />`);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`"<p>hi </p>"`);
  });

  test("syntax error in compiled source can be catched in hydrate", async () => {
    const mdxSource = await serialize({
      source: "import x from 'y'",
    });

    if ("error" in mdxSource) throw new Error("shouldn't have any MDX syntax error");

    expect(mdxSource.frontmatter).toEqual({});
    expect(mdxSource.scope).toEqual({});

    const { content, mod, error } = hydrate(mdxSource);

    expect(mod).toEqual({});

    expect(error).toMatchInlineSnapshot(
      `[SyntaxError: await is only valid in async functions and the top level bodies of modules]`,
    );

    expect(content).toMatchInlineSnapshot(`
      <div
        className="mdx-empty"
      />
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div class="mdx-empty"></div>"`,
    );
  });
});
