// the same test file taken from @mdx-js/mdx test files iot be inline with

import React from "react";

/**
 * @param {Readonly<React.JSX.IntrinsicElements['span']>} props
 *   Props
 * @returns
 *   `span` element.
 */
export function Pill(props) {
  return React.createElement("span", { ...props, style: { color: "blue" } });
}

/**
 * @param {Readonly<React.JSX.IntrinsicElements['div']>} props
 *   Props
 * @returns
 *   `div` element.
 */
export function Layout(props) {
  return React.createElement("div", { ...props, style: { color: "red" } });
}

export default Layout;
