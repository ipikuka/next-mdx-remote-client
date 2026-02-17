import { describe, test, expect } from "vitest";

import { VFile } from "vfile";
import dedent from "dedent";

import { runSync } from "../src/lib/run.js";
import { compile } from "../src/lib/compile.js";

/**
 * a rehearsal of runSync without actual jsxRuntime
 */
function runSync_(
  compiledSource: string,
  options?: { scope?: Record<string, unknown>; frontmatter?: Record<string, unknown> },
) {
  const constructionScope = {
    mdxOptions: { jsx: () => null }, // do nothing
    frontmatter: options?.frontmatter,
    ...options?.scope,
  };

  const keys = Object.keys(constructionScope);
  const values = Object.values(constructionScope);

  const SyncFunction = function () {}.constructor;

  const hydrateFn = Reflect.construct(SyncFunction, keys.concat(compiledSource));
  return hydrateFn(...values).default ?? hydrateFn(...values);
}

describe("runSync_", () => {
  test("function construction", async () => {
    const compiledSource = dedent`
      const Test = foo;
      if (!Test) _missingMdxReference();
      function _missingMdxReference() {
        throw new Error("Expected Error");
      }
      return Test;
    `;

    const SyncFunction = function () {}.constructor;

    const hydrateFn = Reflect.construct(SyncFunction, ["foo", compiledSource]);
    const hydrateFn2 = Reflect.construct(SyncFunction, ["bar", compiledSource]);

    expect(hydrateFn("foofoo")).toEqual("foofoo");

    try {
      hydrateFn();
    } catch (error) {
      expect((error as Error).message).toBe("Expected Error");
    }

    try {
      const foo = undefined;
      hydrateFn(foo);
    } catch (error) {
      expect((error as Error).message).toBe("Expected Error");
    }

    try {
      const bar = "bar";
      hydrateFn2(bar);
    } catch (error) {
      expect((error as Error).message).toBe("foo is not defined");
    }
  });

  test("throws error when return a value", async () => {
    const compiledSource = dedent`
      const Test = foo;
      if (!Test) _missingMdxReference();
      function _missingMdxReference() {
        throw new Error("Expected Error");
      }
      return Test;
    `;

    expect(runSync_(compiledSource, { scope: { foo: "foofoo" } })).toEqual("foofoo");

    try {
      runSync_(compiledSource);
    } catch (error) {
      expect((error as Error).message).toBe("foo is not defined");
    }

    try {
      runSync_(compiledSource, { scope: { foo: undefined } });
    } catch (error) {
      expect((error as Error).message).toBe("Expected Error");
    }
  });

  test("doesn't throw error when return default export with a module", async () => {
    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx} = arguments[0];
      function _createMdxContent(props) {
        const _components = {}, {Test} = _components;
        if (!Test) _missingMdxReference();
        return _jsx(Test);
      }
      function _missingMdxReference() {
        throw new Error("Error: missing component");
      }
      return {
        default: _createMdxContent
      }
    `;

    expect(runSync_(compiledSource)).toMatchInlineSnapshot(`[Function]`);

    try {
      runSync_(compiledSource);
    } catch (error) {
      // doesn't throw an error, the snapshot is empty !
      expect((error as Error).message).toMatchInlineSnapshot();
    }
  });

  test("throws error when return default export with a value", async () => {
    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx} = arguments[0];
      const _components = {}, {Test} = _components;
      if (!Test) _missingMdxReference();
      function _missingMdxReference() {
        throw new Error("Error: missing component");
      }
      return {
        default: Test
      }
    `;

    try {
      runSync_(compiledSource);
    } catch (error) {
      expect((error as Error).message).toBe("Error: missing component");
    }
  });
});

describe("runSync", () => {
  test("errors in runSync can't be catched", async () => {
    const result = await compile(new VFile("hi <Test bar={bar} />"));
    const compiledSource = String(result.compiledSource);

    try {
      // it doesn't throw error, sinse runSync returns a module to be rendered
      runSync(compiledSource, { frontmatter: {}, scope: {} });
    } catch (error) {
      // Actually, <Test /> compenent is missing and "bar" is not defined but the snapshot is empty !
      expect((error as Error).message).toMatchInlineSnapshot();
    }
  });

  test("some errors (syntax error in compiled source) in runSync can be catched", async () => {
    const result = await compile(new VFile("import x from 'y'"));
    const compiledSource = String(result.compiledSource);

    try {
      runSync(compiledSource, { frontmatter: {}, scope: {} });
    } catch (error) {
      expect((error as Error).message).toMatchInlineSnapshot(
        `"await is only valid in async functions and the top level bodies of modules"`,
      );
    }
  });
});
