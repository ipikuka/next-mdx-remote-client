/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import type { MDXClientProps } from "./types.js";
import { hydrate } from "./hydrate.js";

/**
 * renders the content on the client side (csr), which is provided by the "hydrate" function.
 */
export function MDXClient(props: MDXClientProps): React.JSX.Element {
  const { onError: ErrorComponent, ...rest } = props;

  const { content, error } = hydrate(rest);

  if (error && !ErrorComponent) throw error;

  if (error && ErrorComponent) return <ErrorComponent error={error} />;

  return content;
}
