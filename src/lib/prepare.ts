/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { Compatible, VFile } from "vfile";
import { matter } from "vfile-matter";

import { type PrepareResult } from "./types";

/**
 * turns the source into vfile, gets the fronmatter, strips it out from the vfile
 *
 * @param source markdown or MDX source
 * @param parseFrontmatter indicates whether or not the frontmatter should be parsed out of the source
 * @returns the frontmatter and stripped vfile
 */
export function prepare<TFrontmatter extends Record<string, unknown> = Record<string, unknown>>(
  source: Compatible,
  parseFrontmatter?: boolean,
): PrepareResult<TFrontmatter> {
  const vfile = looksLikeAVFile(source) ? source : new VFile(source);

  // makes frontmatter available via vfile.data.matter
  parseFrontmatter && matter(vfile, { strip: true });

  const frontmatter = (vfile.data.matter ?? {}) as TFrontmatter;

  return {
    vfile,
    frontmatter,
  };
}

/**
 * taken from @mdx-js/mdx/lib/util/resolve-file-and-options.js
 */
function looksLikeAVFile(value?: Compatible): value is VFile {
  return Boolean(
    value && typeof value === "object" && "message" in value && "messages" in value,
  );
}
