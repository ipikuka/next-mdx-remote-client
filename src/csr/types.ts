/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import type {
  CompileOptions as OriginalCompileOptions,
  RunOptions as OriginalRunOptions,
} from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { Compatible } from "vfile";

import type { VfileDataIntoScope } from "../lib/util.js";

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type SerializeProps<TScope extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * markdown or MDX source.
   */
  source: Compatible;
  /**
   * serialize options.
   */
  options?: SerializeOptions<TScope>;
};

export type SerializeOptions<TScope extends Record<string, unknown> = Record<string, unknown>> =
  {
    /**
     * These options are passed to the MDX compiler.
     * See [the MDX docs.](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).
     */
    mdxOptions?: SerializeMdxOptions;
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
  };

type SerializeMdxOptions = Omit<
  OriginalCompileOptions,
  "outputFormat" | "providerImportSource"
>;

export type SerializeResult<
  TFrontmatter = Record<string, unknown>,
  TScope = Record<string, unknown>,
> = Prettify<
  (
    | {
        /**
         * The compiledSource, generated from the serialize function
         */
        compiledSource: string;
      }
    | {
        /**
         * The formatted MDX error object if compilation of the source is failed.
         */
        error: Error;
      }
  ) & {
    /**
     * If parseFrontmatter was set to true, contains any parsed frontmatter found in the MDX source.
     */
    frontmatter: TFrontmatter;
    /**
     * An arbitrary object of data which will be supplied to the MDX.
     *
     * For example, in cases where you want to provide template variables to the MDX, like `my name is {name}`,
     * you could provide scope as `{ name: "Some name" }`.
     */
    scope: TScope;
  }
>;

export type HydrateProps = {
  /**
   * The compiledSource, generated from the serialize function
   */
  compiledSource: string;
  /**
   * If parseFrontmatter was set to true, contains any parsed frontmatter found in the MDX source.
   */
  frontmatter?: Record<string, unknown>;
  /**
   * Indicates whether or not the frontmatter should be parsed out of the MDX. Defaults to false.
   */
  scope?: Record<string, unknown>;
  /**
   * An object mapping names to React components.
   * The key used will be the name accessible to MDX.
   *
   * For example: `{ ComponentName: Component }` will be accessible in the MDX as `<ComponentName/>`.
   */
  components?: MDXComponents;
  /**
   * Disable parent context
   *
   * @see https://github.com/mdx-js/mdx/blob/8f754f707207915bd34c3af8f9064e367c125a58/packages/react/lib/index.js#L70
   */
  disableParentContext?: boolean;
};

export type HydrateResult = {
  /**
   * React element that renders the MDX compiled source using the component names mapping object.
   */
  content: React.JSX.Element;
  /**
   * An object which holds any value that is exported from the MDX file.
   */
  mod: Record<string, unknown> | { [key: string]: never };
  /**
   * The error object if construction of the compiled source is failed.
   */
  error?: Error;
};

export type MDXClientProps = Prettify<
  HydrateProps & {
    onError?: React.ComponentType<{ error: Error }>;
  }
>;

export type HydrateAsyncProps = Prettify<
  HydrateProps & {
    /**
     * hydrate options which is experimental for hydrateAsync only. It is INEFFECTIVE for hydrate and hydrateLazy.
     */
    options?: HydrateAsyncOptions;
    /**
     * fallback loading component
     */
    loading?: () => React.JSX.Element;
  }
>;

export type HydrateAsyncOptions = {
  /**
   * All RunOptions are pre-defined except the "baseUrl"
   */
  baseUrl?: OriginalRunOptions["baseUrl"];
};

export type MDXClientAsyncProps = Prettify<
  HydrateAsyncProps & {
    onError?: React.ComponentType<{ error: Error }>;
  }
>;

export type MDXClientAsyncOptions = HydrateAsyncOptions;
