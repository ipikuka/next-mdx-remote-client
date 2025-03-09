/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import type { MDXModule } from "mdx/types";
import type { Fragment, Jsx, JsxDev } from "@mdx-js/mdx";

import type { RunOptions, RunResult } from "./types.js";

type JsxRuntime = {
  Fragment: Fragment;
  jsx: Jsx;
  jsxs: Jsx;
};

type JsxDevRuntime = {
  Fragment: Fragment;
  jsxDEV: JsxDev;
};

// TODO: use run and runSync function from "@mdx-js/mdx"

/**
 * creates an object to be used for the function construction
 *
 * @param options RunOptions
 * @returns keys and values of the object
 */
function prepareConstruction(options: RunOptions) {
  const constructionScope = {
    runMdxOptions: {
      useMDXComponents: options.mdxOptions?.useMDXComponents,
      baseUrl: options.mdxOptions?.baseUrl,
      jsx: (jsxRuntime as JsxRuntime).jsx,
      jsxs: (jsxRuntime as JsxRuntime).jsxs,
      jsxDEV: (jsxDevRuntime as JsxDevRuntime).jsxDEV,
      Fragment: (jsxRuntime as JsxRuntime).Fragment, // doesn't matter
      React,
    },
    frontmatter: options.frontmatter,
    ...options.scope,
  };

  return {
    keys: Object.keys(constructionScope),
    values: Object.values(constructionScope),
  };
}

/**
 * parses and runs the javascript code syncronously in the compiled MDX source.
 */
export function runSync(compiledSource: string, options: RunOptions): RunResult {
  const { keys, values } = prepareConstruction(options);

  /* v8 ignore next */
  const SyncFunction = function () {}.constructor;

  // constructs the compiled source utilizing Reflect API with "function constructor"
  const hydrateFn: typeof SyncFunction = Reflect.construct(
    SyncFunction,
    keys.concat(compiledSource),
  );

  const { default: Content, ...mod } = hydrateFn(...values) as MDXModule;

  return { Content, mod };
}

/**
 * parses and runs the javascript code asyncronously in the compiled MDX source.
 */
export async function runAsync(
  compiledSource: string,
  options: RunOptions,
): Promise<RunResult> {
  const { keys, values } = prepareConstruction(options);

  /* v8 ignore next */
  const AsyncFunction = async function () {}.constructor;

  // await new Promise((resolve) => setTimeout(resolve, 500));

  // constructs the compiled source utilizing Reflect API with "async function constructor"
  const hydrateFn: typeof AsyncFunction = Reflect.construct(
    AsyncFunction,
    keys.concat(compiledSource),
  );

  const { default: Content, ...mod } = await (hydrateFn(...values) as Promise<MDXModule>);

  return { Content, mod };
}
