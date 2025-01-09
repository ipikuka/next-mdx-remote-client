/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 *
 * reference to https://github.com/hashicorp/next-mdx-remote/blob/main/src/idle-callback-polyfill.js
 */

if (typeof window !== "undefined") {
  window.requestIdleCallback ||= function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

  window.cancelIdleCallback ||= function (id) {
    clearTimeout(id);
  };
}
