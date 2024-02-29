/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { MDXProvider, useMDXComponents } from "@mdx-js/react";

import { runSync } from "../lib/run.js";

import type { HydrateResult, HydrateProps } from "./types.js";

/**
 * "run"s the javascript code in the compiled source, and
 * returns the <Content /> component whether or not wrapped with the MDXProvider
 * in the domain of client side rendering (csr).
 */
export function hydrate({
  compiledSource,
  frontmatter = {},
  scope = {},
  components,
  disableParentContext,
}: HydrateProps): HydrateResult {
  try {
    const { Content, mod } = runSync(compiledSource, {
      frontmatter,
      scope,
      mdxOptions: {
        useMDXComponents,
      },
    });

    const content = components ? (
      // wrap the Content with the MDXProvider in order to customize the standard markdown components
      <MDXProvider components={components} disableParentContext={disableParentContext}>
        <Content />
      </MDXProvider>
    ) : (
      // no need to wrap the Content with the MDXProvider since there is no custom component provided
      <Content />
    );

    return { content, mod };
  } catch (error: unknown) {
    return {
      content: <div className="mdx-empty" />,
      mod: {},
      error: error as Error,
    };
  }
}
