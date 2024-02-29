import { test, expect } from "vitest";

import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

test("provides understanding about differences of the compiled sources", async () => {
  const input = dedent`
    # Hi

    <Test />
  `;

  expect(
    String(
      await compile(input, {
        providerImportSource: undefined,
        outputFormat: "function-body",
      }),
    ),
  ).toMatchInlineSnapshot(`
    ""use strict";
    const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
    function _createMdxContent(props) {
      const _components = {
        h1: "h1",
        ...props.components
      }, {Test} = _components;
      if (!Test) _missingMdxReference("Test", true);
      return _jsxs(_Fragment, {
        children: [_jsx(_components.h1, {
          children: "Hi"
        }), "\\n", _jsx(Test, {})]
      });
    }
    function MDXContent(props = {}) {
      const {wrapper: MDXLayout} = props.components || ({});
      return MDXLayout ? _jsx(MDXLayout, {
        ...props,
        children: _jsx(_createMdxContent, {
          ...props
        })
      }) : _createMdxContent(props);
    }
    return {
      default: MDXContent
    };
    function _missingMdxReference(id, component) {
      throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
    }
    "
  `);

  expect(
    String(
      await compile(input, {
        providerImportSource: "#",
        outputFormat: "function-body",
      }),
    ),
  ).toMatchInlineSnapshot(`
    ""use strict";
    const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
    const {useMDXComponents: _provideComponents} = arguments[0];
    function _createMdxContent(props) {
      const _components = {
        h1: "h1",
        ..._provideComponents(),
        ...props.components
      }, {Test} = _components;
      if (!Test) _missingMdxReference("Test", true);
      return _jsxs(_Fragment, {
        children: [_jsx(_components.h1, {
          children: "Hi"
        }), "\\n", _jsx(Test, {})]
      });
    }
    function MDXContent(props = {}) {
      const {wrapper: MDXLayout} = {
        ..._provideComponents(),
        ...props.components
      };
      return MDXLayout ? _jsx(MDXLayout, {
        ...props,
        children: _jsx(_createMdxContent, {
          ...props
        })
      }) : _createMdxContent(props);
    }
    return {
      default: MDXContent
    };
    function _missingMdxReference(id, component) {
      throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
    }
    "
  `);

  expect(
    String(
      await compile(input, {
        providerImportSource: "@mdx-js/react",
        outputFormat: "function-body",
      }),
    ),
  ).toMatchInlineSnapshot(`
    ""use strict";
    const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
    const {useMDXComponents: _provideComponents} = arguments[0];
    function _createMdxContent(props) {
      const _components = {
        h1: "h1",
        ..._provideComponents(),
        ...props.components
      }, {Test} = _components;
      if (!Test) _missingMdxReference("Test", true);
      return _jsxs(_Fragment, {
        children: [_jsx(_components.h1, {
          children: "Hi"
        }), "\\n", _jsx(Test, {})]
      });
    }
    function MDXContent(props = {}) {
      const {wrapper: MDXLayout} = {
        ..._provideComponents(),
        ...props.components
      };
      return MDXLayout ? _jsx(MDXLayout, {
        ...props,
        children: _jsx(_createMdxContent, {
          ...props
        })
      }) : _createMdxContent(props);
    }
    return {
      default: MDXContent
    };
    function _missingMdxReference(id, component) {
      throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
    }
    "
  `);

  expect(
    String(
      await compile(input, {
        providerImportSource: "@mdx-js/react",
        outputFormat: "program",
      }),
    ),
  ).toMatchInlineSnapshot(`
    "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
    import {useMDXComponents as _provideComponents} from "@mdx-js/react";
    function _createMdxContent(props) {
      const _components = {
        h1: "h1",
        ..._provideComponents(),
        ...props.components
      }, {Test} = _components;
      if (!Test) _missingMdxReference("Test", true);
      return _jsxs(_Fragment, {
        children: [_jsx(_components.h1, {
          children: "Hi"
        }), "\\n", _jsx(Test, {})]
      });
    }
    export default function MDXContent(props = {}) {
      const {wrapper: MDXLayout} = {
        ..._provideComponents(),
        ...props.components
      };
      return MDXLayout ? _jsx(MDXLayout, {
        ...props,
        children: _jsx(_createMdxContent, {
          ...props
        })
      }) : _createMdxContent(props);
    }
    function _missingMdxReference(id, component) {
      throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
    }
    "
  `);
});
