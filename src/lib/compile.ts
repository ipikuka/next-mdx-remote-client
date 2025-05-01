/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { compile as compileMDX, type CompileOptions as CompileMDXOptions } from "@mdx-js/mdx";
import type { VFile } from "vfile";
import type { PluggableList } from "unified";
import remarkMdxRemoveEsm, { clsx } from "remark-mdx-remove-esm";

import type { CompileOptions, CompileResult } from "./types.js";
import { createFormattedMDXError } from "./util.js";

/**
 * composes an opinionated version of CompileOptions of the "@mdx-js/mdx"
 *
 * @param options CompileOptions
 * @returns CompileOptions of the "@mdx-js/mdx"
 */
function composeCompileOptions(options: CompileOptions = {}): CompileMDXOptions {
  const { mdxOptions = {}, disableImports, disableExports } = options;

  const mdxRemoveEsmOptions = clsx([disableExports && "export", disableImports && "import"]);

  const remarkPlugins: PluggableList = [
    ...(mdxOptions.remarkPlugins || []),
    [remarkMdxRemoveEsm, mdxRemoveEsmOptions],
  ];

  return {
    ...mdxOptions,
    remarkPlugins,
    outputFormat: "function-body",
  };
}

/**
 * compiles the vfile source via the compile of the "@mdx-js/mdx".
 *
 * returns the compiled source.
 */
export async function compile(vfile: VFile, options?: CompileOptions): Promise<CompileResult> {
  try {
    const compiledSource = await compileMDX(vfile, composeCompileOptions(options));

    // for debugging
    if (options?.debugCompiledSource) {
      console.log(String(compiledSource));
    }

    // await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      compiledSource,
    };
  } catch (error: any) {
    throw createFormattedMDXError(error, String(vfile));
  }
}
