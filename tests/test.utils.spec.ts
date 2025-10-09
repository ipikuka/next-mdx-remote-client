import { describe, test, expect } from "vitest";

import dedent from "dedent";

import { getFrontmatter } from "../src/utils";
import { createFormattedMDXError, passVfileDataIntoScope } from "../src/lib/util";

describe("getFrontmatter", () => {
  type Frontmatter = { title: string };

  test("works as expected without generic type", async () => {
    const source = dedent`
      ---
	    title: 'my title'
	    ---
	    Hi
    `;

    const { frontmatter, strippedSource } = getFrontmatter(source);

    expect(frontmatter.title).toEqual("my title");

    // don't need to put @ts-expect-error since it is Record<string, unknown>
    expect(frontmatter.blah).toBeUndefined();

    expect(strippedSource).toEqual("Hi");
  });

  test("works as expected with generic type", async () => {
    const source = dedent`
      ---
      title: 'my title'
      ---
      Hi
    `;

    const { frontmatter } = getFrontmatter<Frontmatter>(source);

    // @ts-expect-error
    expect(frontmatter.blah).toBeUndefined();
  });

  test("returns empty object if no frontmatter", async () => {
    const source = "Hi";

    const { frontmatter } = getFrontmatter<Frontmatter>(source);

    expect(frontmatter).toStrictEqual({});
  });
});

describe("passVfileDataIntoScope", () => {
  test("works as expected via 'true'", () => {
    const data = {
      toc: [1, 2, 3],
      mog: "mogmog",
    };

    const scope: Record<string, unknown> = {};

    passVfileDataIntoScope(data, true, scope);

    expect(scope).toHaveProperty("toc");
    expect(scope["toc"]).toEqual([1, 2, 3]);
    expect(scope).toHaveProperty("mog");
    expect(scope["mog"]).toEqual("mogmog");

    (scope.toc as Array<number>).push(4);
    expect(data.toc).toEqual([1, 2, 3, 4]);
  });

  test("works as expected via 'string'", () => {
    const data = {
      toc: [1, 2, 3],
      mog: "mogmog",
    };

    const scope: Record<string, unknown> = {};

    passVfileDataIntoScope(data, "toc", scope);

    expect(scope).toHaveProperty("toc");
    expect(scope["toc"]).toEqual([1, 2, 3]);
    expect(scope).not.toHaveProperty("mog");

    (scope.toc as Array<number>).push(4);
    expect(data.toc).toEqual([1, 2, 3, 4]);
  });

  test("works as expected via 'name' and 'as'", () => {
    const data = {
      toc: [1, 2, 3],
      mog: "mogmog",
    };

    const scope: Record<string, unknown> = {};

    passVfileDataIntoScope(data, { name: "toc", as: "heading" }, scope);

    expect(scope).not.haveOwnProperty("toc");
    expect(scope).toHaveProperty("heading");
    expect(scope["heading"]).toEqual([1, 2, 3]);
    expect(scope).not.toHaveProperty("mog");

    (scope.heading as Array<number>).push(4);
    expect(data.toc).toEqual([1, 2, 3, 4]);
  });

  test("works as expected via 'array'", () => {
    const data = {
      toc: [1, 2, 3],
      mog: "mogmog",
    };

    const scope: Record<string, unknown> = {};

    passVfileDataIntoScope(data, ["mog", { name: "toc", as: "heading" }], scope);

    expect(scope).not.haveOwnProperty("toc");
    expect(scope).toHaveProperty("heading");
    expect(scope["heading"]).toEqual([1, 2, 3]);
    expect(scope).toHaveProperty("mog");
    expect(scope["mog"]).toEqual("mogmog");

    (scope.heading as Array<number>).push(4);
    expect(data.toc).toEqual([1, 2, 3, 4]);
  });
});

describe("createFormattedMDXError", () => {
  test("with standart error", async () => {
    const source = dedent`
      ---
      title: 'my title'
      ---
      Hi <GITHUB_USER>
    `;

    const myError = new Error("something went wrong");
    const formattedError = createFormattedMDXError(myError, source);

    expect(formattedError.message).toMatchInlineSnapshot(`
      "[next-mdx-remote-client] error compiling MDX:
      something went wrong

      More information: https://mdxjs.com/docs/troubleshooting-mdx"
    `);
  });

  test("with implicitly positioned error", async () => {
    const source = dedent`
      ---
      title: 'my title'
      ---
      Hi <GITHUB_USER>
    `;

    const positionedError = new Error(
      "Expected a closing tag for `<GITHUB_USER>` (1:4-1:17) before the end of `paragraph`",
    );

    const strippedSource = getFrontmatter(source).strippedSource;

    const formattedError = createFormattedMDXError(positionedError, strippedSource);

    /*
	[1:1-1:17: Expected a closing tag for `<GITHUB_USER>` (1:4-1:17) before the end of `paragraph`] {
		ancestors: undefined,
		cause: undefined,
		column: 1,
		fatal: undefined,
		line: 1,
		place: {
			start: { line: 1, column: 1, offset: 0, _index: 0, _bufferIndex: 0 },
			end: { line: 1, column: 17, offset: 16, _index: 1, _bufferIndex: -1 }
		},
		reason: 'Expected a closing tag for `<GITHUB_USER>` (1:4-1:17) before the end of `paragraph`',
		ruleId: 'end-tag-mismatch',
		source: 'mdast-util-mdx-jsx'
	}  
	*/

    expect(formattedError.message).toMatchInlineSnapshot(`
      "[next-mdx-remote-client] error compiling MDX:
      Expected a closing tag for \`<GITHUB_USER>\` (1:4-1:17) before the end of \`paragraph\`

      > 1 | Hi <GITHUB_USER>
          |    ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx"
    `);
  });

  test("with explicitly positioned error", async () => {
    const source = dedent`
      target x as error
    `;

    const positionedError = new Error("The char x is targetted as error");

    positionedError["position"] = { start: { line: 1, column: 8 } };

    const formattedError = createFormattedMDXError(positionedError, source);

    expect(formattedError.message).toMatchInlineSnapshot(`
      "[next-mdx-remote-client] error compiling MDX:
      The char x is targetted as error

      > 1 | target x as error
          |        ^

      More information: https://mdxjs.com/docs/troubleshooting-mdx"
    `);
  });
});
