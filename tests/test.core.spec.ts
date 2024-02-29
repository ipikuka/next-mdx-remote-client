import { test } from "vitest";

import assert from "node:assert/strict";

test("should expose the public apis", async function () {
  assert.deepEqual(Object.keys(await import("../src/csr")).sort(), [
    "MDXClient",
    "MDXClientAsync",
    "MDXClientLazy",
    "MDXProvider",
    "hydrate",
    "hydrateAsync",
    "hydrateLazy",
    "serialize",
    "useMDXComponents",
  ]);

  assert.deepEqual(Object.keys(await import("../src/rsc")).sort(), ["MDXRemote", "evaluate"]);

  assert.deepEqual(Object.keys(await import("../src/utils")).sort(), ["getFrontmatter"]);
});
