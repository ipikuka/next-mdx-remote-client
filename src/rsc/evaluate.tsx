/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { compile } from "../lib/compile.js";
import { prepare } from "../lib/prepare.js";
import { runSync, runAsync } from "../lib/run.js";
import { passVfileDataIntoScope } from "../lib/util.js";

import type { EvaluateProps, EvaluateResult } from "./types.js";

/**
 * "compiles" the MDX source and "runs" the javascript code in the compiled source, so it basically "evaluates" the MDX.
 *
 * returns the frontmatter, exported object and the react server component to be rendered on the server.
 *
 */
export async function evaluate<
  TFrontmatter extends Record<string, unknown> = Record<string, unknown>,
  TScope extends Record<string, unknown> = Record<string, unknown>,
>({
  source,
  options = {},
  components = {},
}: EvaluateProps<TScope>): Promise<EvaluateResult<TFrontmatter, TScope>> {
  const {
    mdxOptions = {},
    disableExports,
    disableImports,
    scope = {} as TScope,
    parseFrontmatter,
    vfileDataIntoScope,
    debug,
  } = options;

  const { vfile, frontmatter } = prepare<TFrontmatter>(source, parseFrontmatter);

  const { baseUrl, ...compileMDXOptions } = mdxOptions;

  try {
    const { compiledSource } = await compile(vfile, {
      mdxOptions: compileMDXOptions,
      disableExports,
      disableImports,
      debugCompiledSource: debug?.compiledSource,
    });

    if (vfileDataIntoScope)
      passVfileDataIntoScope(compiledSource.data, vfileDataIntoScope, scope);

    // This check is necessary otherwise "await" expression in the compiledSource throws a syntax error
    const { Content, mod } = disableImports
      ? runSync(String(compiledSource), {
          frontmatter,
          scope,
        })
      : await runAsync(String(compiledSource), {
          mdxOptions: { baseUrl },
          frontmatter,
          scope,
        });

    return {
      content: <Content components={components} />,
      mod,
      frontmatter,
      scope,
    };
  } catch (error: unknown) {
    return {
      content: <div className="mdx-empty" />,
      mod: {},
      frontmatter: frontmatter as TFrontmatter,
      scope,
      error: error as Error,
    };
  }
}
