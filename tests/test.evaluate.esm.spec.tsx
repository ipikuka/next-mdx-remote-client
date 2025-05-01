import { describe, test, expect } from "vitest";

import ReactDOMServer from "react-dom/server";
import recmaMdxImportReact from "recma-mdx-import-react";
import dedent from "dedent";

import { evaluate } from "../src/rsc";

type Frontmatter = { title: string };

describe("evaluate function with ESM imports", () => {
  test("removes imports, if there is 'disableImports: true'", async () => {
    const source = dedent`
      import {Pill} from "./context/components.js"
      
      Hi {name}
    `;

    const { content } = await evaluate({
      source,
      options: {
        disableImports: true,
        scope: {
          name: "foo",
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<p>Hi foo</p>"`,
    );
  });

  test("works with imported modules", async () => {
    const source = dedent`
      import {Pill} from "./context/components.js"
      
      Hi {name}

      <Pill>!</Pill>
    `;
    const { content } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url, // should be provided, finds the 'components.js' in relative path
        },
        scope: {
          name: "foo",
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
      "<p>Hi foo</p>
      <span style="color:blue">!</span>"
    `);
  });

  test("should support importing data w/ ESM", async () => {
    const source = dedent`
      import {number} from "./context/data.js"
      
      {number}
    `;

    const { content } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`"3.14"`);
  });

  test("should support exporting w/ ESM", async () => {
    const source = dedent`
      export const number = Math.PI
    `;

    const { content, mod } = await evaluate({ source });

    expect(mod.number).toBe(Math.PI);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("disabling exports is lead to 'mod' is empty object", async () => {
    const source = dedent`
      export const number = Math.PI
    `;

    const { content, mod } = await evaluate({ source, options: { disableExports: true } });

    expect(mod).toStrictEqual({});

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support exporting an identifier w/o a value", async () => {
    const source = dedent`
      export var a
    `;

    const { content, mod } = await evaluate({ source });

    expect(mod).toHaveProperty("a");

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support exporting an object pattern", async () => {
    const source = dedent`
      import {object} from "./context/data.js"
      export var {a} = object
    `;

    const { content, mod } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(mod.a).toBe(1);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support exporting a rest element in an object pattern", async () => {
    const source = dedent`
      import {object} from "./context/data.js"
      export var {a, ...rest} = object
    `;

    const { content, mod } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(mod.a).toBe(1);
    expect(mod.rest).toStrictEqual({ b: 2 });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support exporting an assignment pattern in an object pattern", async () => {
    const source = dedent`
      import {object} from "./context/data.js"
      export var {c = 3} = object
    `;

    const { content, mod } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(mod.c).toBe(3);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support exporting an array pattern", async () => {
    const source = dedent`
      import {array} from "./context/data.js"
      export var [a] = array
    `;

    const { content, mod } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(mod.a).toBe(1);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support `export as` w/ ESM", async () => {
    const source = dedent`
      export const number = Math.PI
      export {number as pi}
    `;

    const { content, mod } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(mod.pi).toBe(Math.PI);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe("");
  });

  test("should support default export to define a layout", async () => {
    const source = dedent`
      export default function Layout(props) { return <div {...props} /> }

      Hi
    `;

    const { content } = await evaluate({ source });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div components="[object Object]"><p>Hi</p></div>"`,
    );
  });

  test("should support default export from a source", async () => {
    const source = dedent`
      export {Layout as default} from "./context/components.js"

      Hi
    `;

    const { content } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div components="[object Object]" style="color:red"><p>Hi</p></div>"`,
    );
  });

  test("should support rexporting something as a default export from a source", async () => {
    const source = dedent`
      export {default} from "./context/components.js"

      Hi
    `;

    const { content } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div components="[object Object]" style="color:red"><p>Hi</p></div>"`,
    );
  });

  test("should support rexporting the default export, and other things, from a source", async () => {
    const source = dedent`
      export {default, Pill} from "./context/components.js"

      <Pill>!</Pill>
    `;

    const { content } = await evaluate({
      source,
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div components="[object Object]" style="color:red"><span style="color:blue">!</span></div>"`,
    );
  });
});

describe("evaluate function with ESM exports", () => {
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

      export function Thing() {
        return 'hello'
      }
      
      <p><Thing /></p>
    `;

    const { content, mod } = await evaluate<Frontmatter>({
      source,
      options: {
        parseFrontmatter: true,
      },
    });

    expect(mod).toMatchObject({
      Component: expect.any(Function),
      Thing: expect.any(Function),
      bool: true,
      num: 1,
      str: "foo",
    });

    const expected = dedent`
      <h1>1 foo true from component</h1>

      <p>hello</p>
    `;

    expect(ReactDOMServer.renderToStaticMarkup(content)).toEqual(expected);
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

    const { content, mod } = await evaluate<Frontmatter>({
      source,
      options: {
        disableExports: true,
        parseFrontmatter: true,
      },
    });

    expect(mod).toStrictEqual({});

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`"<h1>Hi</h1>"`);
  });
});

describe("error handling in evaluate related with ESM", () => {
  test("throws an error if the imported module is used after removing imports", async () => {
    const source = dedent`
      import {Pill} from "./context/components.js"
      
      Hi {name}

      <Pill>!</Pill>
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        disableImports: true,
        scope: {
          name: "foo",
        },
      },
    });

    // The "evaluate" can't catch the error, because the missing component is not syntax error in the compiled source
    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`
      <MDXContent
        components={{}}
      />
    `);

    // But throws error during render
    expect(() =>
      ReactDOMServer.renderToStaticMarkup(content),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected component \`Pill\` to be defined: you likely forgot to import, pass, or provide it.]`,
    );
  });

  test("throws an error if the option 'baseURL' is not provided for imports", async () => {
    const source = dedent`
      import {Pill} from "./context/components.js"
      
      Hi {name}

      <Pill>!</Pill>
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        scope: {
          name: "foo",
        },
      },
    });

    expect(error).toMatchInlineSnapshot(
      `[Error: Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`]`,
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

  test("syntax error in compiled source can be catched in evaluate", async () => {
    const { content, error } = await evaluate({
      source: "import x from 'y'",
    });

    expect(error).toMatchInlineSnapshot(
      `[Error: Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`]`,
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

  // don't know why this test causes an segmentation error in coverage but not in normal test
  test("syntax error in compiled source can be catched in evaluate", async () => {
    const { content, error } = await evaluate({
      source: "import x from 'y'",
      options: {
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(error?.message).toContain(`Cannot find package 'y' imported from`);

    expect(content).toMatchInlineSnapshot(`
      <div
        className="mdx-empty"
      /> 
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div class="mdx-empty"></div>"`,
    );
  });

  test("import .mjs React component with jsx syntax", async () => {
    const source = dedent`
      import ExampleForm from "./context/ExampleForm.mjs"
      
      Hi {name}

      <ExampleForm />
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        scope: {
          name: "ipikuka",
        },
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(error).toMatchInlineSnapshot(`[SyntaxError: Unexpected token '<']`);

    expect(content).toMatchInlineSnapshot(`
      <div
        className="mdx-empty"
      />
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(
      `"<div class="mdx-empty"></div>"`,
    );
  });

  test("import .mjs React component transformed to classic runtime", async () => {
    const source = dedent`
      import ExampleForm from "./context/ExampleFormTransformedClassic.mjs"
      
      Hi {name}

      <ExampleForm />
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        scope: {
          name: "ipikuka",
        },
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`
      <MDXContent
        components={{}}
      />
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
      "<p>Hi ipikuka</p>
      <div><label for=":R3:-name">Enter your name:</label><input id=":R3:-name" type="text" value=""/><p>Hello, stranger!</p></div>"
    `);
  });

  test("import .mjs React component transformed to automatic runtime", async () => {
    const source = dedent`
      import ExampleForm from "./context/ExampleFormTransformedAutomatic.mjs"
      
      Hi {name}

      <ExampleForm />
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        scope: {
          name: "ipikuka",
        },
        mdxOptions: {
          baseUrl: import.meta.url,
        },
      },
    });

    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`
      <MDXContent
        components={{}}
      />
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toMatchInlineSnapshot(`
      "<p>Hi ipikuka</p>
      <div><label for=":R3:-name">Enter your name:</label><input id=":R3:-name" type="text" value=""/><p>Hello, stranger!</p></div>"
    `);
  });

  test("import .mjs React component in which the React instance injected", async () => {
    const source = dedent`
      import HelloDave from "./context/HelloDave.mjs"

      <HelloDave />
    `;

    const { content, error } = await evaluate({
      source,
      options: {
        scope: {
          name: "ipikuka",
        },
        mdxOptions: {
          baseUrl: import.meta.url,
          // without recma plugin, it throws an error
          // TypeError: Cannot read properties of undefined (reading 'useId')
          recmaPlugins: [recmaMdxImportReact],
        },
      },
    });

    expect(error).toBeUndefined();

    expect(content).toMatchInlineSnapshot(`
      <MDXContent
        components={{}}
      />
    `);

    expect(ReactDOMServer.renderToStaticMarkup(content)).toBe(
      "<div>Hello, Dave! Your id is :R0:</div>",
    );
  });
});
