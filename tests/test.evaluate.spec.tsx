import { vi, describe, test, expect } from "vitest";

import React from "react";
import ReactDOMServer from "react-dom/server";
import { VFile } from "vfile";
import dedent from "dedent";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkEmoji from "remark-emoji";
import recmaMdxEscapeMissingComponents from "recma-mdx-escape-missing-components";
import recmaMdxChangeProps from "recma-mdx-change-props";

import { evaluate, type EvaluateOptions } from "../src/rsc";
import { compile } from "../src/lib/compile";

type Frontmatter = { title: string };

describe("evaluate", () => {
  test("simple", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "foo **bar**",
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });

  test("with component", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: 'foo <Test name="test" />',
      components: {
        Test: ({ name }: { name: string }) => <span>hello {name}</span>,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <span>hello test</span></p>"`,
    );
  });

  test("with some remarkPlugins in mdxOptions", async () => {
    const options: EvaluateOptions = {
      mdxOptions: {
        remarkPlugins: [remarkFlexibleMarkers, remarkEmoji],
      },
    };

    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "==hello :tada: Talat Kuyuk==",
      options,
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p><mark class="flexible-marker flexible-marker-default">hello 🎉 Talat Kuyuk</mark></p>"`,
    );

    expect(options.mdxOptions?.remarkPlugins?.length).toBe(2);
  });

  test("with scope", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "hi {bar}",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope.bar).toBe("ipikuka");
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>hi ipikuka</p>"`,
    );
  });

  test("with scope and component", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "hi <Test name={bar} />",
      options: {
        scope: {
          bar: "ipikuka",
        },
      },
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope.bar).toBe("ipikuka");
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
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source,
      options: {
        scope: {
          props: {
            bar: "barbar",
            foo: "foofoo",
          },
        },
      },
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope.props.bar).toBe("barbar");
    expect(scope.props.foo).toBe("foofoo");
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
    const { content, mod, frontmatter, scope, error } = await evaluate({
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
      components: {
        Test: ({ name }: { name: string }) => <strong>{name}</strong>,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope.props.bar).toBe("barbar");
    expect(scope.props.foo).toBe("foofoo");
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

    // there is a type argument for evaluate
    const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter.title).toEqual("My Article");
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    // @ts-expect-error Property 'blah' does not exist on type 'Frontmatter'.
    expect(frontmatter.blah).toBeUndefined();

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

    // there is no type argument for evaluate
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter.title).toEqual("My Article");
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    // it doesn't give any Typescript error
    expect(frontmatter.blah).toBeUndefined();

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

    const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
        scope: { name: "Talat Kuyuk" },
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter.title).toEqual("My Article");
    expect(scope.name).toBe("Talat Kuyuk");
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

    const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter.title).toEqual("My Article");
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>The title is My Article and .</p>"`,
    );
  });

  test("supports component names with a dot(.)", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "<motion.p />",
      components: {
        // @ts-ignore
        motion: { p: () => <p>Hello world</p> },
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>Hello world</p>"`,
    );
  });

  test("renders fragments", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "<Test content={<>Renders fragments</>} />",
      components: {
        Test: ({ content }: { content: string }) => <>{content}</>,
      },
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"Renders fragments"`,
    );
  });

  test("supports VFile", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: new VFile("foo **bar**"),
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });

  test("supports Buffer", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: Buffer.from("foo **bar**"),
    });

    expect(mod).toEqual({});
    expect(frontmatter).toEqual({});
    expect(scope).toEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>foo <strong>bar</strong></p>"`,
    );
  });

  test("debug compiled source", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await compile(new VFile("Hi"));

    await evaluate({
      source: "Hi",
      options: { debug: { compiledSource: true } },
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(String(result.compiledSource));

    logSpy.mockRestore(); // Restore original console.log behavior
  });
});

describe("vfileDataIntoScope in evaluate function", () => {
  test("works with no option 'vfileDataIntoScope'", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      Hello
    `;

    const { scope } = await evaluate({
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

    const { scope } = await evaluate({
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

    const { scope } = await evaluate({
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

    const { scope } = await evaluate({
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

    const { scope } = await evaluate({
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

    const { scope } = await evaluate({
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

describe("error handling in evaluate", () => {
  test("prints helpful message from compile MDX error", async () => {
    const source = dedent`
      ---
      title: 'My Article'
      ---
      This is very bad syntax <GITHUB_USER>
    `;

    const { content, mod, frontmatter, scope, error } = await evaluate({
      source,
      options: {
        parseFrontmatter: true,
        scope: { foo: "foofoo" },
      },
    });

    if (!error) throw new Error("should have an error !");

    expect(frontmatter).toStrictEqual({ title: "My Article" });
    expect(scope).toStrictEqual({ foo: "foofoo" });
    expect(mod).toStrictEqual({});

    expect(error).toMatchInlineSnapshot(`
      [Error: [next-mdx-remote-client] error compiling MDX:
      Expected a closing tag for \`<GITHUB_USER>\` (1:25-1:38) before the end of \`paragraph\`

      > 1 | This is very bad syntax <GITHUB_USER>
          |                         ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx]
    `);

    expect(content).toMatchInlineSnapshot(`
      <div
        className="mdx-empty"
      />
    `);
  });

  test("missing a scope value causes runtime error during render", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "hi {bar}",
    });

    expect(frontmatter).toStrictEqual({});
    expect(scope).toStrictEqual({});
    expect(mod).toStrictEqual({});
    expect(error).toBeUndefined();

    expect(() => {
      ReactDOMServer.renderToStaticMarkup(content);
    }).toThrow("bar is not defined");
  });

  test("missing a component causes runtime error during render", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "hi <Test />",
    });

    expect(frontmatter).toStrictEqual({});
    expect(scope).toStrictEqual({});
    expect(mod).toStrictEqual({});
    expect(error).toBeUndefined();

    expect(() => {
      ReactDOMServer.renderToStaticMarkup(content);
    }).toThrow(
      "Expected component `Test` to be defined: you likely forgot to import, pass, or provide it.",
    );
  });

  test("missing components can be escaped via a recma plugin without giving runtime error", async () => {
    const { content, mod, frontmatter, scope, error } = await evaluate({
      source: "hi <Test />",
      options: {
        mdxOptions: {
          recmaPlugins: [[recmaMdxEscapeMissingComponents, "Test"]],
        },
      },
    });

    expect(frontmatter).toStrictEqual({});
    expect(scope).toStrictEqual({});
    expect(mod).toStrictEqual({});
    expect(error).toBeUndefined();

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`"<p>hi </p>"`);
  });
});
