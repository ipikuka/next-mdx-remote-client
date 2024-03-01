/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { serializeError } from "serialize-error";

import { type CompileMdxOptions } from "../lib/types.js";
import { passVfileDataIntoScope } from "../lib/util.js";
import { prepare } from "../lib/prepare.js";
import { compile } from "../lib/compile.js";

import type { SerializeResult, SerializeProps, SerializeOptions } from "./types.js";

export type { SerializeResult, SerializeProps, SerializeOptions };

/**
 * compiles the MDX source.
 *
 * the compiled source can be passed into "<MDXClient />" or "hydrate" to be rendered on the client side (csr).
 *
 */
export async function serialize<
  TFrontmatter extends Record<string, unknown> = Record<string, unknown>,
  TScope extends Record<string, unknown> = Record<string, unknown>,
>({
  source,
  options = {},
}: SerializeProps<TScope>): Promise<SerializeResult<TFrontmatter, TScope>> {
  const {
    mdxOptions = {},
    disableExports,
    disableImports,
    parseFrontmatter,
    scope = {} as TScope,
    vfileDataIntoScope,
  } = options;

  const { vfile, frontmatter } = prepare<TFrontmatter>(source, parseFrontmatter);

  const compileMDXOptions: CompileMdxOptions = {
    ...mdxOptions,
    providerImportSource: "#", // important! doesn't matter "@mdx-js/react" since the outputFormat is "function-body"
  };

  try {
    const { compiledSource } = await compile(vfile, {
      mdxOptions: compileMDXOptions,
      disableExports,
      disableImports,
    });

    if (vfileDataIntoScope)
      passVfileDataIntoScope(compiledSource.data, vfileDataIntoScope, scope);

    return {
      compiledSource: String(compiledSource),
      frontmatter,
      scope,
    };
  } catch (error: unknown) {
    return {
      error: serializeError(error) as Error,
      frontmatter,
      scope,
    };
  }
}
