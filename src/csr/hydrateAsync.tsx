/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { useEffect, useState } from "react";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";

import { runAsync } from "../lib/run.js";
import { type RunResult } from "../lib/types.js";

import type { HydrateAsyncProps, HydrateResult } from "./types.js";

/**
 * This is experimental and proof for NOT WORKING in pages directory
 *
 * "run"s the javascript code in the compiled source, and
 * returns the <Content /> component whether or not wrapped with the MDXProvider
 * in the domain of client side rendering (csr).
 *
 * the hydration process occurs asynchronously in the useEffect so as to import modules in the compiled source.
 */
export function hydrateAsync({
  compiledSource,
  frontmatter = {},
  scope = {},
  components,
  disableParentContext,
  // two options below are for only hydrateAsync
  options,
  loading,
}: HydrateAsyncProps): HydrateResult {
  const { baseUrl } = options ?? {};

  const [runResult, setRunResult] = useState<RunResult | { error: Error }>({
    Content: loading ? loading : () => <div />,
    mod: {},
  });

  useEffect(() => {
    async function getContent() {
      // to see loading state a bit
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const runResult_ = await runAsync(compiledSource, {
          mdxOptions: {
            baseUrl,
            useMDXComponents,
          },
          frontmatter,
          scope,
        });

        setRunResult(runResult_);
      } catch (error) {
        setRunResult({
          error: error as Error,
        });
      }
    }

    getContent();
  }, []);

  if ("error" in runResult) {
    return {
      content: <div className="mdx-empty" />,
      mod: {},
      error: runResult.error,
    };
  }

  const content = components ? (
    // wrap the Content with the MDXProvider in order to customize the standard markdown components
    <MDXProvider components={components} disableParentContext={disableParentContext}>
      <runResult.Content />
    </MDXProvider>
  ) : (
    // no need to wrap the Content with the MDXProvider since there is no custom component provided
    <runResult.Content />
  );

  return { content, mod: runResult.mod };
}
