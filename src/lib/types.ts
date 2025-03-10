/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import type {
  CompileOptions as OriginalCompileOptions,
  RunOptions as OriginalRunOptions,
} from "@mdx-js/mdx";
import type { MDXContent } from "mdx/types";
import type { Compatible, VFile } from "vfile";

export type PrepareProps = {
  /**
   * the markdown or mdx source.
   */
  source: Compatible;
  /**
   * Indicates whether or not the frontmatter should be parsed out of the MDX. Defaults to false.
   */
  parseFrontmatter?: boolean;
};

export type PrepareResult<TFrontmatter = Record<string, unknown>> = {
  /**
   * the converted vFile of the source for compile function.
   */
  vfile: VFile;
  /**
   * the parsed frontmatter found in the MDX source if parseFrontmatter is set to true.
   */
  frontmatter: TFrontmatter;
};

export type CompileOptions = {
  /**
   * These options are passed to the MDX compiler.
   * See [the MDX docs.](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).
   */
  mdxOptions?: CompileMdxOptions;
  /**
   * Whether or not strip out "export"s from MDX. Defaults to false, which means it does NOT strip out.
   */
  disableExports?: boolean;
  /**
   * Whether or not strip out "import"s from MDX. Defaults to false, which means it does NOT strip out.
   */
  disableImports?: boolean;
  /**
   * for debugging
   */
  debugCompiledSource?: boolean;
};

export type CompileMdxOptions = Omit<OriginalCompileOptions, "outputFormat">;

export type RunOptions = {
  /**
   * These options are passed to the MDX compiler.
   * See [the MDX docs.](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).
   */
  mdxOptions?: RunMdxOptions;
  /**
   * the parsed frontmatter found in the MDX source if parseFrontmatter is set to true.
   */
  frontmatter: Record<string, unknown> | { [key: string]: never };
  /**
   * An arbitrary object of data which will be supplied to the MDX.
   */
  scope: Record<string, unknown> | { [key: string]: never };
};

export type RunMdxOptions = Omit<OriginalRunOptions, "Fragment" | "jsx" | "jsxDEV" | "jsxs">;

export type CompileResult = {
  /**
   * compiled source produced by the serialize function, which contains js code in string format.
   */
  compiledSource: VFile;
};

export type RunResult = {
  /**
   * A functional JSX component which renders the content of the MDX file.
   */
  Content: MDXContent;
  /**
   * An object which holds any value that is exported from the MDX file.
   */
  mod: {
    [key: string]: unknown;
  };
};
