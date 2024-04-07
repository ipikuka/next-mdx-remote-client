/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 *
 * reference to https://github.com/hashicorp/next-mdx-remote/blob/main/src/format-mdx-error.ts
 *
 * improved the types
 */

import { codeFrameColumns } from "@babel/code-frame";

type Position = {
  start: {
    line: number;
    column: number;
  };
};

/**
 * Attempt to parse position information from an error message originating from the MDX compiler.
 *
 * @param message error message
 * @returns the position of the error indicator
 */
function parsePositionInformationFromErrorMessage(message: string): Position | undefined {
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

type PositionedError = Error & {
  position?: Position;
};

/**
 * prints a nicely formatted error message from an error caught during MDX compilation.
 *
 * @param error Error caught from the mdx compiler
 * @param source Raw MDX string
 * @returns Error
 */
export function createFormattedMDXError(error: PositionedError, source: string): Error {
  const position = error.position ?? parsePositionInformationFromErrorMessage(error.message);

  const codeFrames = position
    ? codeFrameColumns(
        source,
        {
          start: {
            line: position.start.line,
            column: position.start.column,
          },
        },
        { linesAbove: 2, linesBelow: 2 },
      )
    : "";

  const formattedError = new Error(`[next-mdx-remote-client] error compiling MDX:
${error?.message}
${codeFrames ? "\n" + codeFrames + "\n" : ""}
More information: https://mdxjs.com/docs/troubleshooting-mdx`);

  formattedError.stack = "";

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
      } else if (field.hasOwnProperty("name") && field.hasOwnProperty("as")) {
        scope[field.as] = data[field.name];
      }
    });
  } else if (
    vfileDataIntoScope.hasOwnProperty("name") &&
    vfileDataIntoScope.hasOwnProperty("as")
  ) {
    scope[vfileDataIntoScope.as] = data[vfileDataIntoScope.name];
  }
}
