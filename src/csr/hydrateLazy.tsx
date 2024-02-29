/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { useEffect, useMemo, useState } from "react";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";

import "./idle-callback-polyfill.js";
import { runSync } from "../lib/run.js";

import type { HydrateResult, HydrateProps } from "./types.js";

/**
 * "run"s the javascript code in the compiled source, and
 * returns the <Content /> component whether or not wrapped with the MDXProvider
 * in the domain of client side rendering (csr).
 *
 * the hydration process occurs lazily.
 */
export function hydrateLazy({
  compiledSource,
  frontmatter = {},
  scope = {},
  components,
  disableParentContext,
}: HydrateProps): HydrateResult {
  const [isReadyToRender, setIsReadyToRender] = useState(typeof window === "undefined");

  // console.log({ isReadyToRender });

  // since lazy, the mdx content is hydrated inside requestIdleCallback,
  // allowing the page to get to interactive quicker, but the mdx content to hydrate slower.
  useEffect(() => {
    const request = window.requestIdleCallback(() => {
      setIsReadyToRender(true);
    });
    return () => window.cancelIdleCallback(request);
  }, []);

  const { Content, mod, error } = useMemo(() => {
    try {
      const result = runSync(compiledSource, {
        frontmatter,
        scope,
        mdxOptions: {
          useMDXComponents,
        },
      });

      return { ...result };
    } catch (error) {
      return { Content: () => <div className="mdx-empty" />, mod: {}, error: error as Error };
    }
  }, [compiledSource]);

  if (!isReadyToRender) {
    return {
      // If not ready to render, return an empty div to preserve SSR'd markup
      content: <div dangerouslySetInnerHTML={{ __html: "" }} suppressHydrationWarning />,
      mod: {},
    };
  }

  const content = components ? (
    // wrap the Content with the MDXProvider in order to customize the standard markdown components
    <MDXProvider components={components} disableParentContext={disableParentContext}>
      <Content />
    </MDXProvider>
  ) : (
    // no need to wrap the Content with the MDXProvider since there is no custom component provided
    <Content />
  );

  // since lazy, need to wrap with a div to preserve the same markup structure that was SSR'd
  return { content: <div>{content}</div>, mod, error };
}
