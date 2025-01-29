/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

export { MDXRemote } from "./MDXRemote.js";
export { evaluate } from "./evaluate.js";

export type {
  MDXRemoteProps,
  MDXRemoteOptions,
  EvaluateProps,
  EvaluateOptions,
  EvaluateResult,
} from "./types.js";

// for who needs to use them without installing the "mdx/types"
export type { MDXComponents, MDXContent, MDXProps, MDXModule } from "mdx/types";
