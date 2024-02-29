import { describe, test, expect } from "vitest";

import dedent from "dedent";

import { compile } from "../src/lib/compile";
import { prepare } from "../src/lib/prepare";

type Frontmatter = { title: string };

describe("the result of the compile function", () => {
  test("has import statement but without enableImports option", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      import abc from "./xxx.js"
      
      # Hi {name}
    `;

    const { vfile, frontmatter } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      disableImports: true,
    });

    // test the frontmatter *******************************

    expect(frontmatter.title).toEqual("Hello World");

    // @ts-expect-error
    expect(frontmatter.blah).toBeUndefined();

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
    `;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("has import statement, but baseURL is not defined", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      import abc from "./xxx.js"
      
      # Hi {name}
    `;

    const { vfile, frontmatter } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        // baseUrl: import.meta.url, // <---- disabling this makes happen to add const _importMetaUrl = arguments[0].baseUrl;
      },
    });

    // test the frontmatter *******************************

    expect(frontmatter.title).toEqual("Hello World");

    // @ts-expect-error
    expect(frontmatter.blah).toBeUndefined();

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      const _importMetaUrl = arguments[0].baseUrl;
      if (!_importMetaUrl) throw new Error("Unexpected missing \`options.baseUrl\` needed to support \`export … from\`, \`import\`, or \`import.meta.url\` when generating \`function-body\`");
      const {default: abc} = await import(_resolveDynamicMdxSpecifier("./xxx.js"));
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
      function _resolveDynamicMdxSpecifier(d) {
        if (typeof d !== "string") return d;
        try {
          new URL(d);
          return d;
        } catch {}
        if (d.startsWith("/") || d.startsWith("./") || d.startsWith("../")) return new URL(d, _importMetaUrl).href;
        return d;
      }
    `;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("has import statement, and baseURL is defined", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      import abc from "./xxx.js"
      
      # Hi {name}
    `;

    const { vfile, frontmatter } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        baseUrl: import.meta.url,
      },
    });

    // test the frontmatter *******************************

    expect(frontmatter.title).toEqual("Hello World");

    // @ts-expect-error
    expect(frontmatter.blah).toBeUndefined();

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      const {default: abc} = await import(_resolveDynamicMdxSpecifier("./xxx.js"));
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
      function _resolveDynamicMdxSpecifier(d) {
        if (typeof d !== "string") return d;
        try {
          new URL(d);
          return d;
        } catch {}
        if (d.startsWith("/") || d.startsWith("./") || d.startsWith("../")) return new URL(d, "file:`;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("has NO import statement, baseURL is not defined", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      # Hi {name}
    `;

    const { vfile } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile);

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
    `;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("has NO import statement, baseURL definition does not lead to change", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      # Hi {name}
    `;

    const { vfile } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        baseUrl: import.meta.url,
      },
    });

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
    `;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("more paragraph needs Fragment", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      # Hi {name}

      More paragraph
    `;

    const { vfile } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile);

    // test the compiledSource ****************************

    const compiledSourceInitialPart = dedent`
      "use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
    `;

    expect(String(result.compiledSource)).toContain(compiledSourceInitialPart);
  });

  test("providerImportSource option is defined", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      import abc from "./xxx.js"
      
      # Hi {name}
    `;

    const { vfile, frontmatter } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        baseUrl: import.meta.url,
        providerImportSource: "#", // <--- here, this makes happen to add "useMDXComponents" into the code
      },
    });

    // test the frontmatter *******************************

    expect(frontmatter.title).toEqual("Hello World");

    // @ts-expect-error
    expect(frontmatter.blah).toBeUndefined();

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
      const {useMDXComponents: _provideComponents} = arguments[0];
      const {default: abc} = await import(_resolveDynamicMdxSpecifier("./xxx.js"));
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ..._provideComponents(),
          ...props.components
        };
        return _jsxs(_components.h1, {
          children: ["Hi ", name]
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
      function _resolveDynamicMdxSpecifier(d) {
        if (typeof d !== "string") return d;
        try {
          new URL(d);
          return d;
        } catch {}
        if (d.startsWith("/") || d.startsWith("./") || d.startsWith("../")) return new URL(d, "file:`;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("development option is true", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      # Hi {name}
    `;

    const { vfile } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        development: true,
      },
    });

    // test the compiledSource ****************************

    const compiledSource = dedent`
      "use strict";
      const {jsxDEV: _jsxDEV} = arguments[0];
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxDEV(_components.h1, {
          children: ["Hi ", name]
        }, undefined, true, {
          fileName: "<source.js>",
          lineNumber: 1,
          columnNumber: 1
        }, this);
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsxDEV(MDXLayout, {
          ...props,
          children: _jsxDEV(_createMdxContent, {
            ...props
          }, undefined, false, {
            fileName: "<source.js>"
          }, this)
        }, undefined, false, {
          fileName: "<source.js>"
        }, this) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
    `;

    expect(String(result.compiledSource)).toContain(compiledSource);
  });

  test("has import statement, development option is true", async () => {
    const source = dedent`
      ---
      title: 'Hello World'
      ---
      import abc from "./xxx.js"

      # Hi {name}

      More paragraph
    `;

    const { vfile } = prepare<Frontmatter>(source, true);

    const result = await compile(vfile, {
      mdxOptions: {
        development: true,
      },
    });

    // test the compiledSource ****************************

    const compiledSourceInitialPart = dedent`
      "use strict";
      const {Fragment: _Fragment, jsxDEV: _jsxDEV} = arguments[0];
    `;

    expect(String(result.compiledSource)).toContain(compiledSourceInitialPart);
  });

  test("use {scope: {props}}", async () => {
    const source = dedent`
      # Hi {props.baz}

      <Test name={props.foo} />
    `;

    const { vfile } = prepare(source);

    const result = await compile(vfile);

    expect(String(result.compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        }, {Test} = _components;
        if (!Test) _missingMdxReference("Test", true);
        return _jsxs(_Fragment, {
          children: [_jsxs(_components.h1, {
            children: ["Hi ", props.baz]
          }), "\\n", _jsx(Test, {
            name: props.foo
          })]
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
  });
});
