/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import type { EvaluateOptions as OriginalEvaluateOptions } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { Compatible } from "vfile";

import type { VfileDataIntoScope } from "../lib/util.js";

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type EvaluateProps<TScope extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * markdown or MDX source.
   */
  source: Compatible;
  /**
   * evaluate options.
   */
  options?: EvaluateOptions<TScope>;
  /**
   * An object mapping names to React components.
   * The key used will be the name accessible to MDX.
   *
   * For example: `{ ComponentName: Component }` will be accessible in the MDX as `<ComponentName/>`.
   */
  components?: MDXComponents;
};

export type EvaluateOptions<TScope extends Record<string, unknown> = Record<string, unknown>> =
  {
    /**
     * These options are passed to the MDX compiler.
     * See [the MDX docs.](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).
     */
    mdxOptions?: EvaluateMdxOptions;
    /**
     * Whether or not strip out "export"s from MDX. Defaults to false, which means it does NOT strip out.
     */
    disableExports?: boolean;
    /**
     * Whether or not strip out "import"s from MDX. Defaults to false, which means it does NOT strip out.
     */
    disableImports?: boolean;
    /**
     * Indicates whether or not the frontmatter should be parsed out of the MDX. Defaults to false.
     */
    parseFrontmatter?: boolean;
    /**
     * An arbitrary object of data which will be supplied to the MDX.
     *
     * For example, in cases where you want to provide template variables to the MDX, like `my name is {name}`,
     * you could provide scope as `{ name: "Some name" }`.
     */
    scope?: TScope;
    /**
     * Compiled source vfile.data may hold some extra information.
     * Some field names in vfile.data may be needed to pass into the scope.
     * If you need to change the name of the field, specify it { name: string; as: string } while passing.
     * if the scope has the same key already, vfile.data overrides it.
     */
    vfileDataIntoScope?: VfileDataIntoScope;
    /**
     * for debugging
     */
    debug?: {
      compiledSource?: boolean;
    };
  };

type EvaluateMdxOptions = Omit<
  OriginalEvaluateOptions,
  | "Fragment"
  | "jsx"
  | "jsxs"
  | "jsxDEV"
  | "useMDXComponents"
  | "providerImportSource"
  | "outputFormat"
>;

export type EvaluateResult<
  TFrontmatter = Record<string, unknown>,
  TScope = Record<string, unknown>,
> = {
  /**
   * React element that renders the MDX source using the component names mapping object.
   */
  content: React.JSX.Element;
  /**
   * An object which holds any value that is exported from the MDX file.
   */
  mod: Record<string, unknown> | { [key: string]: never };
  /**
   * the parsed frontmatter found in the MDX source if parseFrontmatter is set to true.
   */
  frontmatter: TFrontmatter;
  /**
   * The scope can be mutated during the compile process, and you may want to get it back.
   *
   */
  scope: TScope;
  /**
   * The error object if construction of the compiled source is failed, or
   * compilation of the source is failed due to MDX syntax error.
   */
  error?: Error;
};

export type MDXRemoteProps = Prettify<
  EvaluateProps & {
    onError?: React.ComponentType<{ error: Error }>;
  }
>;

export type MDXRemoteOptions = EvaluateOptions;
