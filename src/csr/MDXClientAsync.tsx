/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import type { MDXClientAsyncProps } from "./types.js";
import { hydrateAsync } from "./hydrateAsync.js";

/**
 * it is experimental
 *
 * renders the content on the client side (csr), which is provided by the "hydrateAsync" function.
 *
 * the content is going to be hydrated "asynchronously" in a useEffect hook.
 */
export function MDXClientAsync(props: MDXClientAsyncProps): React.JSX.Element {
  const { onError: ErrorComponent, ...rest } = props;

  const { content, error } = hydrateAsync(rest);

  /* v8 ignore next */
  if (error && !ErrorComponent) throw error;

  if (error && ErrorComponent) return <ErrorComponent error={error} />;

  return content;
}
