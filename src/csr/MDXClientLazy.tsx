/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { type MDXClientProps } from "./types.js";
import { hydrateLazy } from "./hydrateLazy.js";

/**
 * renders the content on the client side (csr), which is provided by the "hydrateLazy" function.
 *
 * the content is going to be hydrated "lazily".
 */
export function MDXClientLazy(props: MDXClientProps): JSX.Element {
  const { onError: ErrorComponent, ...rest } = props;

  const { content, error } = hydrateLazy(rest);

  /* v8 ignore next */
  if (error && !ErrorComponent) throw error;

  if (error && ErrorComponent) return <ErrorComponent error={error} />;

  return content;
}
