/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

import { type Compatible, VFile } from "vfile";
import { matter } from "vfile-matter";

/**
 * gets the fronmatter and the stripped source
 *
 * @param source markdown or MDX source
 * @returns fronmatter and stripped source. If no matter is found, the frontmatter is an empty object.
 */
export function getFrontmatter<TFrontmatter extends Record<string, unknown>>(
  source: Compatible,
): { frontmatter: TFrontmatter; strippedSource: string } {
  const vfile = new VFile(source);

  matter(vfile, { strip: true });

  const frontmatter = vfile.data.matter as TFrontmatter;

  // If no matter is found, the file.data.matter is an empty object ({}).
  return { frontmatter, strippedSource: String(vfile) };
}
