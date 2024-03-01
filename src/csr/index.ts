/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

export { hydrate } from "./hydrate.js";
export { hydrateLazy } from "./hydrateLazy.js";
export { hydrateAsync } from "./hydrateAsync.js";
export { MDXClient } from "./MDXClient.js";
export { MDXClientLazy } from "./MDXClientLazy.js";
export { MDXClientAsync } from "./MDXClientAsync.js";

export type {
  HydrateProps,
  HydrateResult,
  MDXClientProps,
  SerializeResult,
  // below are experimantal
  HydrateAsyncProps,
  HydrateAsyncOptions,
  MDXClientAsyncProps,
  MDXClientAsyncOptions,
} from "./types.js";

// for who needs to use them without installing the "@mdx-js/react"
export { MDXProvider, useMDXComponents } from "@mdx-js/react";

// for who needs to use them without installing the "mdx/types"
export type { MDXComponents, MDXContent, MDXProps, MDXModule } from "mdx/types";
