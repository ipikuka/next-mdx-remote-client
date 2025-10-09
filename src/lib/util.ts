/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 *
 * reference to https://github.com/hashicorp/next-mdx-remote/blob/main/src/format-mdx-error.ts
 *
 * improved the types
 */

import { codeFrameColumns, type SourceLocation } from "@babel/code-frame";

/**
 * Attempt to parse position information from an error message originating from the MDX compiler.
 *
 * @param message error message
 * @returns the position of the error indicator
 */
function parsePositionInformationFromErrorMessage(message: string): SourceLocation | undefined {
  const positionInfoPattern = /\d+:\d+(-\d+:\d+)/g;

  const match = message.match(positionInfoPattern);

  if (!match) return;

  // take the last match, that seems to be the most reliable source of the error.
  const lastMatch = match.slice(-1)[0];

  const [line, column] = lastMatch.split("-")[0].split(":");

  return {
    start: {
      line: Number.parseInt(line, 10),
      column: Number.parseInt(column, 10),
    },
  };
}

/**
 * prints a nicely formatted error message from an error caught during MDX compilation.
 *
 * @param error Error caught from the mdx compiler
 * @param source Raw MDX string
 * @returns Error
 */
export function createFormattedMDXError(error: Error, source: string): Error {
  const position =
    "position" in error && Boolean(error.position)
      ? (error.position as SourceLocation)
      : parsePositionInformationFromErrorMessage(error.message);

  const codeFrames =
    position?.start?.line !== undefined
      ? codeFrameColumns(source, position, { linesAbove: 2, linesBelow: 2 })
      : "";

  const formattedError = new Error(`[next-mdx-remote-client] error compiling MDX:
${error.message}
${codeFrames ? "\n" + codeFrames + "\n" : ""}
More information: https://mdxjs.com/docs/troubleshooting-mdx`);

  // commented since React Flight throws an error if error stack is mutated
  // when the error object is a prop in a rsc
  // formattedError.stack = "";

  return formattedError;
}

/**
 * Copyright (c) @talatkuyuk AKA @ipikuka
 * SPDX-License-Identifier: MPL-2.0
 */

export type VfileDataIntoScope =
  | true // all fields
  | string // one specific field
  | { name: string; as: string } // one specific field but change the key as
  | Array<string | { name: string; as: string }>; // more than one field

/**
 * copies some fields of vfile.data into scope by mutating the scope
 * pay attention that it provides reference copy for objects (including arrays)
 *
 * @param data vfile.data from copied
 * @param vfileDataIntoScope refers the fields of vfile.data, some or all (if true)
 * @param scope an object to copied in a mutable way
 */
export function passVfileDataIntoScope(
  data: Record<string, unknown>,
  vfileDataIntoScope: VfileDataIntoScope,
  scope: Record<string, unknown>,
): undefined {
  if (typeof vfileDataIntoScope === "boolean") {
    Object.entries(data).forEach(([key, value]) => {
      scope[key] = value;
    });
  } else if (typeof vfileDataIntoScope === "string") {
    scope[vfileDataIntoScope] = data[vfileDataIntoScope];
  } else if (Array.isArray(vfileDataIntoScope)) {
    vfileDataIntoScope.forEach((field) => {
      if (typeof field === "string") {
        scope[field] = data[field];
      } else if (
        // type-coverage:ignore-next-line
        Object.prototype.hasOwnProperty.call(field, "name") &&
        // type-coverage:ignore-next-line
        Object.prototype.hasOwnProperty.call(field, "as")
      ) {
        scope[field.as] = data[field.name];
      }
    });
  } else if (
    // type-coverage:ignore-next-line
    Object.prototype.hasOwnProperty.call(vfileDataIntoScope, "name") &&
    // type-coverage:ignore-next-line
    Object.prototype.hasOwnProperty.call(vfileDataIntoScope, "as")
  ) {
    scope[vfileDataIntoScope.as] = data[vfileDataIntoScope.name];
  }
}
