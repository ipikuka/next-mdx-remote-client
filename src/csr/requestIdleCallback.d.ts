/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 *
 * reference to https://github.com/hashicorp/next-mdx-remote/blob/main/src/index.tsx
 * requestIdleCallback types found here: https://github.com/microsoft/TypeScript/issues/21309
 */

type RequestIdleCallbackHandle = number;

type RequestIdleCallbackOptions = {
  timeout?: number;
};

type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

declare global {
  interface Window {
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle;
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
  }
}
