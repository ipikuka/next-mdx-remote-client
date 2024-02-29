/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { evaluate } from "./evaluate.js";
import { type MDXRemoteProps } from "./types.js";

/**
 * renders the content as a react server component (rsc), which is provided by the "evaluate" function
 */
export async function MDXRemote(props: MDXRemoteProps): Promise<JSX.Element> {
  const { onError: ErrorComponent, ...rest } = props;

  const { content, error } = await evaluate(rest);

  if (error && !ErrorComponent) throw error;

  if (error && ErrorComponent) return <ErrorComponent error={error} />;

  return content;
}
