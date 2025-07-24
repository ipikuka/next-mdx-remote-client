# next-mdx-remote-client

[![npm version][badge-npm-version]][url-npm-package]
 [![npm downloads][badge-npm-download]][url-npm-package]
 [![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
 [![code-coverage][badge-codecov]][url-codecov]
 [![type-coverage][badge-type-coverage]][url-github-package]
 [![typescript][badge-typescript]][url-typescript]
 [![license][badge-license]][url-license]

**`next-mdx-remote-client`** is recommended in the [official `Next.js` docs](https://nextjs.org/docs/app/guides/mdx#remote-mdx).

> [!IMPORTANT]
> **If you are using `react18`, use ver.1 of `next-mdx-remote-client`, currently v1.1**
>
> **If you are using `react19`, use ver.2 of `next-mdx-remote-client`, currently v2.1**
>
> *The both serve the same features and APIs. I am going to maintain both.*

The **`next-mdx-remote-client`** is a wrapper of **`@mdx-js/mdx`** for **`nextjs`** applications in order to load MDX content. It is a fork of **`next-mdx-remote`**.

See some blog applications in which **`next-mdx-remote-client`** is used:
+ for a **demo application** which uses **`app` router**, visit [source code](https://github.com/talatkuyuk/next-mdx-remote-client-in-app-router) or [living web site](https://next-mdx-remote-client-in-app-router.vercel.app/),
+ for a **demo application** which uses **`pages` router**,  visit [source code](https://github.com/talatkuyuk/next-mdx-remote-client-in-pages-router) or [living web site](https://next-mdx-remote-client-in-pages-router.vercel.app/),
+ for a **testing application** which uses **both `app` and `pages` router**, visit [source code](https://github.com/talatkuyuk/testing-app-for-next-mdx-remote-client) or [living web site](https://testing-app-for-next-mdx-remote-client.vercel.app/).

## Why `next-mdx-remote-client` ?

I started to create the **`next-mdx-remote-client`** in line with the mindset of the **`@mdx-js/mdx`** in early 2024 considering [next-mdx-remote][next-mdx-remote] had not been updated for a long time, and finally, a brand new package emerged.

The **`next-mdx-remote-client`** serves as a **viable alternative** to **`next-mdx-remote`** having **more features**.

**I would like to highlight some main features:**
+ It supports MDX version 3.
+ It provides well designed components and functions for both "pages" router and "app" router, which completely isolated from eachother.
+ It provides internal error handling mechanism.
+ It supports `import statements` and `export statements` in MDX source, which can be disabled as well.
+ Creating table of contents (TOC) is so easy since it supports passing `vfile.data` into the `scope`.
+ You can get frontmatter without compiling the source while listing the articles/posts via `getFrontmatter`.
+ It exports some components and types from `@mdx-js/mdx` so as you don't need to install.

Let's compare the features of **`next-mdx-remote`** and **`next-mdx-remote-client`**.

| Features                                                    | `next-mdx-remote`   | `next-mdx-remote-client` |
| :---------------------------------------------------------- | :-----------------: | :----------------------: |
| support MDX version 3                                       | ✅                  | ✅                        |
| ensure internal error handling mechanism in `app` router    | ❌                  | ✅                        |
| ensure internal error handling mechanism in `pages` router  | ❌                  | ✅                        |
| support _export-from-MDX_ in `app` router                   | ❌                  | ✅                        |
| support _export-from-MDX_ in `pages` router                 | ❌                  | ✅                        | 
| support _import-into-MDX_ in `app` router                   | ❌                  | ✅                        |
| support _import-into-MDX_ in `pages` router                 | ❌                  | ❌                        |
| get frontmatter and mutated scope in `app` router           | ❌                  | ✅                        |
| get frontmatter and mutated scope in `pages` router         | ✅                  | ✅                        |
| support options for disabling imports and exports in MDX    | ✅                  | ✅                        |
| support passing `vfile.data` into the `scope`               | ❌                  | ✅                        |
| provide utility for getting frontmatter without compiling   | ❌                  | ✅                        |
| expose `MDXProvider` from `@mdx-js/mdx`                     | ❌                  | ✅                        |
| provide option for disabling parent `MDXProvider` contexts  | ❌                  | ✅                        |
| expose the necessary types from `mdx/types`                 | ❌                  | ✅                        |
| injects `React` instance into runtime options               | ❌                  | ✅                        |

> [!IMPORTANT]
> You will see a lot the abbreviatons **`csr`** and **`rsc`**. _Pay attention to the both are spelled backwards._\
> \
> **`csr`** stands for "client side rendering" which is related with **`pages`** router\
> **`rsc`** stands for "react server component" which is related with **`app`** router

## General considerations about development

- It is ESM only package
- Needs `react` version 18.3+, works with latest next@14.2 versions (tested)
- Needs `node` version 18.18+ in line with nextjs does
- Vitest is used instead of jest for testing
- Rollup is removed for bundling
- Test coverage is 100%
- Type coverage is 100%
- The parts client side (csr) and server side (rsc) are completely isolated from each other
- Exported a small utility to get frontmatter without compiling the source
- **All functions take named parameters**
- Supports `import statements` and `export statements` in MDX
- Export statements in MDX work for **both** `app` and `pages` router
- Import statements in MDX work for **only** `app` router

> [!IMPORTANT]
> **Imported modules in MDX with relative path should be transpiled into javascript before or during build process, otherwise will not work.** I believe the community can find a solution to import reqular **`.jsx`** or **`.tsx`** modules into MDX. With the support of the **`next/mdx`**, it is viable to import **`.mdx`** into MDX, but not tested yet.

## Installation

This package is ESM only, requires Node.js (version 18.18+).

```bash
# in general
npm install next-mdx-remote-client

# specifically for react18 users
npm install next-mdx-remote-client@1

# specifically for react19 users
npm install next-mdx-remote-client@2
```

or

```bash
yarn add next-mdx-remote-client
```

> [!WARNING]  
> The `next-mdx-remote` users may follow the [migration guide](/migration_guide.md).

## The package's exported subpaths

The main entry point **`/`** also refers to **`/csr`** subpath.

```typescript
// main entry point, which is related "pages" router
import /* */ from "next-mdx-remote-client";

// isolated subpath for the "serialize" function
import /* */ from "next-mdx-remote-client/serialize";

// sub entry point related with "pages" router
import /* */ from "next-mdx-remote-client/csr";

// sub entry point related with "app" router
import /* */ from "next-mdx-remote-client/rsc";

// isolated subpath for the utils
import /* */ from "next-mdx-remote-client/utils";
```

## The part associated with Next.js `app` router

_Go to [the part associated with Next.js pages router](#the-part-associated-with-nextjs-pages-router)_

The `next-mdx-remote-client` exposes **`evaluate`** function and **`MDXRemote`** component for "app" router.

```typescript
import { evaluate, MDXRemote } from "next-mdx-remote-client/rsc";
```

> [!TIP]
> If you need to get the **exports** from MDX --> use **`evaluate`**\
> If you don't need --> use **`MDXRemote`**\
> \
> If you need to get the **frontmatter** and the **mutated scope** --> use **`evaluate`**\
> If you don't need --> use **`MDXRemote`**

Let's give some examples how to use `next-mdx-remote-client` in "app" router first, then explain the exposed function and component.

### Examples for `app` router

See a **demo application** with **`app` router**, visit [source code](https://github.com/talatkuyuk/next-mdx-remote-client-in-app-router) or [living web site](https://next-mdx-remote-client-in-app-router.vercel.app/).

#### An example with `javascript`

```jsx
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";

import { ErrorComponent, LoadingComponent } from "../components";
import { Test } from '../mdxComponents';

const components = {
  Test,
  wrapper: ({ children }) => <div className="mdx-wrapper">{children}</div>,
}

export default async function Page() {
  const source = "Some **bold text** in MDX, with a component <Test />";

  return (
    <Suspense fallback={<LoadingComponent />}>
      <MDXRemote
        source={source}
        components={components}
        onError={ErrorComponent}
      />
    </Suspense>
  );
};
```

#### An example with `typescript`, parsing frontmatter and providing custom data with scope

```tsx
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import type { MDXRemoteOptions, MDXComponents } from "next-mdx-remote-client/rsc";

import { calculateSomeHow, getSourceSomeHow } from "../utils";
import { ErrorComponent, LoadingComponent } from "../components";
import { Test } from '../mdxComponents';

const components: MDXComponents = { 
  Test,
  wrapper: function ({ children }: React.ComponentPropsWithoutRef<"div">) {
    return <div className="mdx-wrapper">{children}</div>;
  },
}

export default async function Page() {
  const source = await getSourceSomeHow();

  if (!source) {
    return <ErrorComponent error="The source could not found !" />;
  }

  const options: MDXRemoteOptions = {
    mdxOptions: {
      // ...
    },
    parseFrontmatter: true,
    scope: {
      readingTime: calculateSomeHow(source),
    },
  };

  return (
    <Suspense fallback={<LoadingComponent />}>
      <MDXRemote
        source={source}
        options={options}
        components={components}
        onError={ErrorComponent}
      />
    </Suspense>
  );
}
```

#### An example with creating a table of contents (TOC)

I assume you have a MDX file having `<TableOfContentComponent />` inside; and you provide some MDX components which have an entry for `TableOfContentComponent: (props) => { ... }`.

```markdown
---
title: My Article
---
# {frontmatter.title}

<TableOfContentComponent toc={toc} />

rest of the article...
```

You can have a look at an example [TOC component](https://github.com/talatkuyuk/next-mdx-remote-client-in-app-router/blob/main/mdxComponents/Toc.tsx) in the demo application.

In order to create a table of contents (TOC) I use `remark-flexible-toc` in the remark plugin list and pass the table of contents objects `vFile.data.toc` into the `scope` via the option `vfileDataIntoScope`.

That's it ! So easy !

```tsx
import { Suspense } from "react";
import { MDXRemote, type MDXRemoteOptions } from "next-mdx-remote-client/rsc";
import remarkFlexibleToc from "remark-flexible-toc"; // <---------

import { calculateSomeHow, getSourceSomeHow } from "../utils";
import { ErrorComponent, LoadingComponent } from "../components";
import { components } from '../mdxComponents';

export default async function Page() {
  const source = await getSourceSomeHow();

  if (!source) {
    return <ErrorComponent error="The source could not found !" />;
  }

  const options: MDXRemoteOptions = {
    mdxOptions: {
      remarkPlugins: [
        // ...
        remarkFlexibleToc, // <---------
      ], 
    },
    parseFrontmatter: true,
    scope: {
      readingTime: calculateSomeHow(source),
    },
    vfileDataIntoScope: "toc", // <---------
  };

  return (
    <Suspense fallback={<LoadingComponent />}>
      <MDXRemote
        source={source}
        options={options}
        components={components}
        onError={ErrorComponent}
      />
    </Suspense>
  );
}
```

#### An example with using "frontmatter" and "scope" in JSX in "app" router

```tsx
import { Suspense } from "react";
import { evaluate, type EvaluateOptions } from "next-mdx-remote-client/rsc";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";

import { calculateSomeHow, getSourceSomeHow } from "../utils";
import { ErrorComponent, LoadingComponent, TableOfContentComponent } from "../components";
import { components } from "../mdxComponents";

type Scope = {
  readingTime: string;
  toc?: TocItem[];
};

type Frontmatter = {
  title: string;
  author: string;
};

export default async function Page() {
  const source = await getSourceSomeHow();

  if (!source) {
    return <ErrorComponent error="The source could not found !" />;
  }

  const options: EvaluateOptions<Scope> = {
    mdxOptions: {
      remarkPlugins: [
        // ...
        remarkFlexibleToc,
      ], 
    },
    parseFrontmatter: true,
    scope: {
      readingTime: calculateSomeHow(source),
    },
    vfileDataIntoScope: "toc",
  };

  const { content, frontmatter, scope, error } = await evaluate<Frontmatter, Scope>({
    source,
    options,
    components,
  });

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <>
      <h1>{frontmatter.title}</h1>
      <p>Written by {frontmatter.author}; read in {scope.readingTime}</p>
      <TableOfContentComponent toc={scope.toc} />
      <Suspense fallback={<LoadingComponent />}>
        {content}
      </Suspense>
    </>
  );
}
```

Actually, you may not need to access the "frontmatter" and "scope" in JSX, you can use them within MDX directly, and return just `content` only.

```tsx
// ...
export default async function Page({ source }: Props) {
  // ...
  return (
    <Suspense fallback={<LoadingComponent />}>
      {content}
    </Suspense>
  );
}
```

_article.mdx_
```markdown
# {frontmatter.title}

Written by {frontmatter.author}; read in {readingTime}

<TableOfContentComponent toc={toc} />

rest of the article...
```

After the examples given, let's dive into the exposed function and component by `next-mdx-remote-client` for "app" router.

### The `evaluate` function

_Go to the [MDXRemote](#the-mdxremote-component) component_

The `evaluate` function is used for compiling the **MDX source**, constructing the **compiled source**, getting exported information from MDX and returning MDX content to be rendered on the server side, as a react server component.

```typescript
async function evaluate(props: EvaluateProps): Promise<EvaluateResult> {}
```

The `evaluate` function takes `EvaluateProps` and returns `EvaluateResult` as a promise.

**Props of the `evaluate` function**

```typescript
type EvaluateProps<TScope> = {
  source: Compatible;
  options?: EvaluateOptions<TScope>;
  components?: MDXComponents;
};
```

**Result of the `evaluate` function**

```typescript
type EvaluateResult<TFrontmatter, TScope> = {
  content: React.JSX.Element;
  mod: Record<string, unknown>;
  frontmatter: TFrontmatter;
  scope: TScope;
  error?: Error;
};
```

The `evaluate` has **internal error handling mechanism** as much as it can, in order to do so, it returns an **`error`** object if it is catched.

> [!CAUTION]
> The eval of the compiled source returns a module `MDXModule`, and does not throw errors except syntax errors. Some errors throw during the render process which needs you to use an **ErrorBoundary**.

```tsx
import { Suspense } from "react";
import { evaluate, type EvaluateOptions } from "next-mdx-remote-client/rsc";

import { ErrorComponent, LoadingComponent, TableOfContentComponent } from "../components";
import { components } from "../mdxComponents";
import type { Frontmatter, Scope } from "../types"

export default async function MDXComponent({ source }: {source?: string}) {
  if (!source) {
    return <ErrorComponent error="The source could not found !" />;
  }

  const options: EvaluateOptions = {
    /* */
  };

  const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter, Scope>({
    source,
    options,
    components,
  });

  if (error) {
    return <ErrorComponent error={error} />;
  }

  /**
   * Use "mod", "frontmatter" and "scope" as you wish
   *
   * "mod" object is for exported information from MDX
   * "frontmatter" is available even if a MDX syntax error occurs
   * "scope" is for mutated scope if the `vfileDataIntoScope` option is used
   */

  return (
    <>
      <h1>{frontmatter.title}</h1>
      <div><em>{mod.something}</em></div>
      <TableOfContentComponent toc={scope.toc} />
      <Suspense fallback={<LoadingComponent />}>
        {content}
      </Suspense>
    </>
  );
};
```

If you provide **the generic type parameters** like `await evaluate<Frontmatter, Scope>(){}`, the `frontmatter` and the `scope` get the types, otherwise `Record<string, unknown>` by default for both.

> [!WARNING]
> Pay attention to the order of the generic type parameters.\
> \
> The type parameters `Frontmatter` and `Scope` should extend `Record<string, unknown>`. You should use **`type`** instead of **`interface`** for type parameters otherwise, you will receive an error saying `Type 'Xxxx' does not satisfy the constraint 'Record<string, unknown>'.` See this [issue](https://github.com/ipikuka/next-mdx-remote-client/issues/2) for more explanation.

In the above example, I assume you use **`remark-flexible-toc`** remark plugin in order to collect the headings from the MDX content, and you pass that information into the `scope` via `vfileDataIntoScope` option.

### The evaluate options (`EvaluateOptions`)

All options are optional.

```typescript
type EvaluateOptions<TScope> = {
  mdxOptions?: EvaluateMdxOptions;
  disableExports?: boolean;
  disableImports?: boolean;
  parseFrontmatter?: boolean;
  scope?: TScope;
  vfileDataIntoScope?: VfileDataIntoScope;
};
```

#### `mdxOptions`

It is an **`EvaluateMdxOptions`** option to be passed to the `@mdx-js/mdx` compiler.

```typescript
import { type EvaluateOptions as OriginalEvaluateOptions } from "@mdx-js/mdx";

type EvaluateMdxOptions = Omit<
  OriginalEvaluateOptions,
  | "Fragment"
  | "jsx"
  | "jsxs"
  | "jsxDEV"
  | "useMDXComponents"
  | "providerImportSource"
  | "outputFormat"
>;
```

As you see, some of the options are omitted and opinionated within the package. For example the `outputFormat` is always `function-body` by default. Visit https://mdxjs.com/packages/mdx/#evaluateoptions for available mdxOptions.

```typescript
const options: EvaluateOptions = {
  // ...
  mdxOptions: {
    format: "mdx",
    baseUrl: import.meta.url,
    development: true,
    remarkPlugins: [/* */],
    rehypePlugins: [/* */],
    recmaPlugins: [/* */],
    remarkRehypeOptions: {handlers: {/* */}},
    // ...
  };
};
```

For more information see [the MDX documentation](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).

#### `disableExports`

It is a **boolean** option whether or not stripping the `export statements` out from the MDX source.

By default it is **false**, meaningly the `export statements` work as expected.

```typescript
const options: EvaluateOptions = {
  disableExports: true;
};
```

Now, the `export statements` will be stripped out from the MDX.

#### `disableImports`

It is a **boolean** option whether or not stripping the `import statements` out from the MDX source.

By default it is **false**, meaningly the `import statements` work as expected.

```typescript
const options: EvaluateOptions = {
  disableImports: true;
};
```

Now, the `import statements` will be stripped out from the MDX.

#### `parseFrontmatter`

It is a **boolean** option whether or not the frontmatter should be parsed out of the MDX.

By default it is **false**, meaningly the `frontmatter` will not be parsed and extracted.

```typescript
const options: EvaluateOptions = {
  parseFrontmatter: true;
};
```

Now, the `frontmatter` part of the MDX file is parsed and extracted from the MDX source; and will be supplied into the MDX file so as you to use it within the javascript statements.

> [!NOTE]
> Frontmatter is a way to identify metadata in Markdown files. Metadata can literally be anything you want it to be, but often it's used for data elements your page needs and you don't want to show directly.

```mdx
---
title: "My Article"
author: "ipikuka"
---
# {frontmatter.title}

It is written by {frontmatter.author}
```

The package uses the `vfile-matter` internally to parse the frontmatter.

#### `scope`

It is an **`Record<string, unknown>`** option which is an arbitrary object of data which will be supplied to the MDX. For example, in cases where you want to provide template variables to the MDX, like `my name is {name}`, you could provide scope as `{ name: "ipikuka" }`. 

Here is another example:

```typescript
const options: EvaluateOptions = {
  scope: {
    readingTime: calculateSomeHow(source)
  };
};
```

Now, the `scope` will be supplied into the MDX file so as you to use it within the statements.

```markdown
# My article

read in {readingTime} min.
```

The variables within the expression in the MDX content should be valid javascript variable names. **Therefore, each key of the scope must be a valid variable name.**

```markdown
My name is {name} valid expression.
My name is {my-name} is not valid expression, which will throw error
```

So, we can say for the `scope`, here:
```typescript
const options: EvaluateOptions = {
  scope: {
    name: "ipikuka", // valid usage
    "my-name": "ipikuka", // is not valid and error prone for the MDX content !!!
  };
};
```

> [!TIP]
> The scope variables can be consumed not only as a property of a component, but also within the texts.

```mdx
my name is {name}

<BarComponent name={name} />
```

#### `vfileDataIntoScope`

It is an **union** type option. It is for passing some fields of `vfile.data` into the `scope` by mutating the `scope`.

> [!IMPORTANT]  
> It provides referencial copy for objects and arrays. If the `scope` has the same key already, `vfile.data` overrides it.

The reason behind of this option is that `vfile.data` may hold some extra information added by some remark plugins. Some fields of the `vfile.data` may be needed to pass into the `scope` so as you to use in the MDX.

```typescript
type VfileDataIntoScope =
  | true // all fields from vfile.data
  | string // one specific field
  | { name: string; as: string } // one specific field but change the key as
  | Array<string | { name: string; as: string }>; // more than one field
```

```typescript
const options: EvaluateOptions = {
  // Let's assume you use "remark-flexible-toc" plugin which composes
  // the table of content (TOC) within the 'vfile.data.toc'
  vfileDataIntoScope: "toc"; // or fileDataIntoScope: ["toc"];
};
```

Now, `vfile.data.toc` is copied into the scope as `scope["toc"]`, and will be supplied to the MDX via `scope`.

```mdx
# My article

<TableOfContentComponent toc={toc} />
```

If you need to change the name of the field, specify it for example `{ name: "toc", as: "headings" }`.

```typescript
const options: EvaluateOptions = {
  vfileDataIntoScope: { name: "toc", as: "headings" };
};
```

```mdx
# My article

<TableOfContentComponent headings={headings} />
```

If you need to pass all the fields from `vfile.data`, specify it as `true`

```typescript
const options: EvaluateOptions = {
  vfileDataIntoScope: true;
};
```

### The `MDXRemote` component

_Go to the [evaluate](#the-evaluate-function) function_

The `MDXRemote` component is used for rendering the MDX content on the server side. It is a react server component.

```typescript
async function MDXRemote(props: MDXRemoteProps): Promise<React.JSX.Element> {}
```

The `MDXRemote` component takes `MDXRemoteProps` and returns `React.JSX.Element` as a promise.

**Props of the `MDXRemote` component**

```typescript
type MDXRemoteProps<TScope> = {
  source: Compatible;
  options?: MDXRemoteOptions<TScope>;
  components?: MDXComponents;
  onError?: React.ComponentType<{ error: Error }>
};
```

The `MDXRemote` has **internal error handling mechanism** as much as it can, in order to do so, it takes **`onError`** prop in addition to `evaluate` function.

> [!CAUTION]
> The eval of the compiled source returns a module `MDXModule`, and does not throw errors except syntax errors. Some errors throw during the render process which needs you to use an **ErrorBoundary**.

```tsx
import { Suspense } from "react";
import { MDXRemote, type MDXRemoteOptions } from "next-mdx-remote-client/rsc";

import { ErrorComponent, LoadingComponent } from "../components";
import { components } from "../mdxComponents";

export default async function MDXComponent({ source }: {source?: string}) {
  if (!source) {
    return <ErrorComponent error="The source could not found !" />;
  }

  const options: MDXRemoteOptions = {
    /* */
  };

  return (
    <Suspense fallback={<LoadingComponent />}>
      <MDXRemote
        source={source}
        options={options}
        components={components}
        onError={ErrorComponent}
      />
    </Suspense>
  );
};
```

### The MDXRemote options (`MDXRemoteOptions`)

All options are optional.

```typescript
type MDXRemoteOptions<TScope> = {
  mdxOptions?: EvaluateMdxOptions;
  disableExports?: boolean;
  disableImports?: boolean;
  parseFrontmatter?: boolean;
  scope?: TScope;
  vfileDataIntoScope?: VfileDataIntoScope;
};
```

The details are the same with the [EvaluateOptions](#the-evaluate-options-evaluateoptions).

## The part associated with Next.js `pages` router

_Go to [the part associated with Next.js app router](#the-part-associated-with-nextjs-app-router)_

The `next-mdx-remote-client` exposes **`serialize`**, **`hydrate`** functions and **`MDXClient`** component for "pages" router.

The `serialize` function is used on the server side in "pages" router, while as the `hydrate` and the `MDXClient` are used on the client side in "pages" router. That is why the "serialize" function is purposefully isolated considering it is intended to run on the server side.

Let's give some examples how to use `next-mdx-remote-client` in "pages" router first, then explain the exposed functions and component.

### Examples for `pages` router

See a **demo application** with **`pages` router**,  visit [source code](https://github.com/talatkuyuk/next-mdx-remote-client-in-pages-router) or [living web site](https://next-mdx-remote-client-in-pages-router.vercel.app/).

#### An example with `javascript`

```jsx
import { serialize } from 'next-mdx-remote-client/serialize';
import { MDXClient } from 'next-mdx-remote-client';

import ErrorComponent from '../components/ErrorComponent';
import Test from '../mdxComponents/Test';

const components = { 
  Test,
  wrapper: ({children}) => <div className="mdx-wrapper">{children}</div>,
}

export default function Page({ mdxSource }) {
  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  return <MDXClient {...mdxSource} components={components} />;
}

export async function getStaticProps() {
  const source = "Some **bold text** in MDX, with a component <Test />";

  const mdxSource = await serialize({source});

  return { props: { mdxSource } };
}
```

#### An example with `typescript`, parsing frontmatter and providing custom data with scope

```tsx
import { MDXClient, type MDXComponents } from 'next-mdx-remote-client';
import { serialize } from "next-mdx-remote-client/serialize";
import type { SerializeOptions, SerializeResult } from "next-mdx-remote-client/serialize";

import { calculateSomeHow, getSourceSomeHow } from "../utils";
import ErrorComponent from '../components/ErrorComponent';
import Test from '../mdxComponents/Test';

type Scope = {
  readingTime: string;
};

type Frontmatter = {
  title: string;
  author: string;
};

const components: MDXComponents = { 
  Test,
  wrapper: function ({ children }: React.ComponentPropsWithoutRef<"div">) {
    return <div className="mdx-wrapper">{children}</div>;
  },
}

type Props = {
  mdxSource?: SerializeResult<Frontmatter, Scope>;
}

export default function Page({ mdxSource }: Props) {
  if (!mdxSource) {
    return <ErrorComponent error="The source could not found !" />;
  }

  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  return (
    <>
      <h1>{mdxSource.frontmatter.title}</h1>
      <p>Written by {mdxSource.frontmatter.author}; read in {mdxSource.scope.readingTime}</p>
      <MDXClient {...mdxSource} components={components} />
    </>
  );
}

export async function getStaticProps() {
  const source = await getSourceSomeHow();

  if (!source) return { props: {} };

  const options: SerializeOptions<Scope> = {
    disableImports: true,
    mdxOptions: {
      // ...
    },
    parseFrontmatter: true,
    scope: {
      readingTime: calculateSomeHow(source),
    },
  };

  const mdxSource = await serialize<Frontmatter, Scope>({source, options});

  return { props: { mdxSource } };
}
```

#### An example with creating a table of contents (TOC)

I assume you have a MDX file having `<TableOfContentComponent />` inside; and you provide some MDX components which have an entry for `TableOfContentComponent: (props) => { ... }`.

```markdown
---
title: My Article
---
# {frontmatter.title}

<TableOfContentComponent toc={toc} />

rest of the article...
```

You can have a look at an example [TOC component](https://github.com/talatkuyuk/next-mdx-remote-client-in-pages-router/blob/main/mdxComponents/Toc.tsx) in the demo application.

In order to create a table of contents (TOC) I use `remark-flexible-toc` in the remark plugin list and pass the table of contents objects `vFile.data.toc` into the `scope` via the option `vfileDataIntoScope`.

That's it! So easy!

```tsx
import { MDXClient, type MDXComponents } from 'next-mdx-remote-client';
import { serialize } from "next-mdx-remote-client/serialize";
import type { SerializeOptions, SerializeResult } from "next-mdx-remote-client/serialize";
import remarkFlexibleToc, {type TocItem} from "remark-flexible-toc"; // <---------

import { calculateSomeHow, getSourceSomeHow } from "../utils";
import { ErrorComponent, TableOfContentComponent } from '../components';
import { Test } from '../mdxComponents';

type Scope = {
  readingTime: string;
};

type Frontmatter = {
  title: string;
  author: string;
};

const components: MDXComponents = { 
  Test,
  wrapper: function ({ children }: React.ComponentPropsWithoutRef<"div">) {
    return <div className="mdx-wrapper">{children}</div>;
  },
}

type Props = {
  mdxSource?: SerializeResult<Frontmatter, Scope & {toc: TocItem[]}>;
}

export default function Page({ mdxSource }: Props) {
  if (!mdxSource) {
    return <ErrorComponent error="The source could not found !" />;
  }

  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  return (
    <>
      <h1>{mdxSource.frontmatter.title}</h1>
      <p>Written by {mdxSource.frontmatter.author}; read in {mdxSource.scope.readingTime}</p>
      <TableOfContentComponent toc={mdxSource.scope.toc /* <----- here added TOC */} />
      <MDXClient {...mdxSource} components={components} />
    </>
  );
}

export async function getStaticProps() {
  const source = await getSourceSomeHow();

  if (!source) return { props: {} };

  const options: SerializeOptions<Scope> = {
    disableImports: true,
    mdxOptions: {
      remarkPlugins: [
        // ...
        remarkFlexibleToc, // <---------
      ], 
    },
    parseFrontmatter: true,
    scope: {
      readingTime: calculateSomeHow(source),
    },
    vfileDataIntoScope: "toc", // <---------
  };

  const mdxSource = await serialize<Frontmatter, Scope>({source, options});

  return { props: { mdxSource } };
}
```

Actually, you may not need to access the "frontmatter" and "scope" in JSX, you can use them within MDX directly, and return just `<MDXClient />` only.

```tsx
// ...
const components: MDXComponents = { 
  TableOfContentComponent, // <---------
  wrapper: function ({ children }: React.ComponentPropsWithoutRef<"div">) {
    return <div className="mdx-wrapper">{children}</div>;
  },
}
// ...
export default function Page({ mdxSource }: Props) {
  // ...
  return (
    <MDXClient {...mdxSource} components={components} />
  );
}
```

_article.mdx_
```markdown
# {frontmatter.title}

Written by {frontmatter.author}; read in {readingTime}

<TableOfContentComponent toc={toc} />

rest of the article...
```

After the examples given, let's dive into the exposed functions and component by `next-mdx-remote-client` for "pages" router.

### The `serialize` function

_Go to the [hydrate](#the-hydrate-function) function_
_or the [MDXClient](#the-mdxclient-component) component_

```typescript
import { serialize } from "next-mdx-remote-client/serialize";
```

The `serialize` function is used for compiling the **MDX source**, in other words, producing the **compiled source** from MDX source, intended to run on server side at build time.

> [!WARNING]
> The `serialize` function is **asyncronous** and to be used within the `getStaticProps` or the `getServerSideProps` on the server side. (Off the record, it can be used within an `useEffect` as well, but this is not recommended because it is a heavy function as having more dependencies).

```typescript
async function serialize(props: SerializeProps): Promise<SerializeResult> {}
```

The `serialize` function takes `SerializeProps` and returns `SerializeResult` as a promise.

**Props of the `serialize` function**

```typescript
type SerializeProps<TScope> = {
  source: Compatible;
  options?: SerializeOptions<TScope>;
};
```

**Result of the `serialize` function**

Either the `compiledSource` or the `error` exists, in addition to `frontmatter` and `scope`.

```typescript
type SerializeResult<TFrontmatter, TScope> = 
({ compiledSource: string } | { error: Error })
& {
  frontmatter: TFrontmatter;
  scope: TScope;
};
```

The `serialize` function has **internal error handling mechanism** for the MDX syntax errors. The catched error is serialized via `serialize-error` package and attached into the serialize results, further you can deserialize the error on the client, if necessary. **You don't need to implement error handling by yourself.**

```tsx
import { serialize, type SerializeOptions } from "next-mdx-remote-client/serialize";
import type { Frontmatter, Scope } from "./types"

export async function getStaticProps() {
  const source = await getSourceSomeHow();

  if (!source) {
    return { props: {} };
  }

  const options: SerializeOptions = {
    /* */
  };

  const mdxSource = await serialize<Frontmatter, Scope>({
    source,
    options,
  });

  return {
    props: {
      mdxSource,
    },
  };
}
```

If you provide **the generic type parameters** like `await serialize<Frontmatter, Scope>(){}`, the `frontmatter` and the `scope` get the types, otherwise `Record<string, unknown>` by default for both.

> [!WARNING]
> Pay attention to the order of the generic type parameters.\
> \
> The type parameters `Frontmatter` and `Scope` should extend `Record<string, unknown>`. You should use **`type`** instead of **`interface`** for type parameters otherwise, you will receive an error saying `Type 'Xxxx' does not satisfy the constraint 'Record<string, unknown>'.` See this [issue](https://github.com/ipikuka/next-mdx-remote-client/issues/2) for more explanation.

The `nextjs` will send the `mdxSource` ((**`compiledSource`** or **`error`**) + **`frontmatter`** + **`scope`**) to client side.

**On client side, you need first to narrow the `mdxSource` by checking `if ("error" in mdxSource) {}`.**

```tsx
type Props = {
  mdxSource?: SerializeResult<Frontmatter, Scope>;
}

export default function Page({ mdxSource }: Props) {
  // ...

  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  // ...
};
```

### The serialize options (`SerializeOptions`)

All options are optional.

```typescript
type SerializeOptions<TScope> = {
  mdxOptions?: SerializeMdxOptions;
  disableExports?: boolean;
  disableImports?: boolean;
  parseFrontmatter?: boolean;
  scope?: TScope;
  vfileDataIntoScope?: VfileDataIntoScope;
};
```

Except the `mdxOptions`, the details are the same with the [EvaluateOptions](#the-evaluate-options-evaluateoptions).

#### `mdxOptions`

It is a **`SerializeMdxOptions`** option to be passed to the `@mdx-js/mdx` compiler.

```typescript
import { type CompileOptions as OriginalCompileOptions } from "@mdx-js/mdx";

type SerializeMdxOptions = Omit<
  OriginalCompileOptions,
  "outputFormat" | "providerImportSource"
>;
```

As you see, some of the options are omitted and opinionated within the package. For example the `outputFormat` is always `function-body` by default. Visit https://mdxjs.com/packages/mdx/#compileoptions for available mdxOptions.

```typescript
const options: SerializeOptions = {
  // ...
  mdxOptions: {
    format: "mdx",
    baseUrl: import.meta.url,
    development: true,
    remarkPlugins: [/* */],
    rehypePlugins: [/* */],
    recmaPlugins: [/* */],
    remarkRehypeOptions: {handlers: {/* */}},
    // ...
  };
};
```

> [!WARNING]
> Here I need to mention about the `scope` option again for the `serialize`.\
> \
> **scope**\
> \
> Actually, the `serialize` doesn't do so much with the `scope` except you provide the option `vfileDataIntoScope` for passing data from `vfile.data` into the `scope`. Since the `scope` is passed from the server to the client by `nextjs`, the `scope` must be serializable. The `scope` can not hold **function**, **component** , **Date**, **undefined**, **Error object** etc.\
> \
> If the scope has to have **unserializable** information or if you don't need or don't want to pass the `scope` into the `serialize`, you can pass it into `hydrate` or `MDXClient` directly on the client side.

### The `hydrate` function

_Go to the [serialize](#the-serialize-function) function_
_or the [MDXClient](#the-mdxclient-component) component_

```typescript
import { hydrate } from "next-mdx-remote-client/csr";
```

The `hydrate` function is used for **constructing the compiled source**, getting exported information from MDX and returning MDX content to be rendered on the client side.

```typescript
function hydrate(props: HydrateProps): HydrateResult {}
```

The `hydrate` function takes `HydrateProps` and returns `HydrateResult`. The `hydrate` has no "options" parameter.

**Props of the `hydrate` function**

```typescript
type HydrateProps = {
  compiledSource: string;
  frontmatter?: Record<string, unknown>;
  scope?: Record<string, unknown>;
  components?: MDXComponents;
  disableParentContext?: boolean;
};
```

The option `disableParentContext` is a feature of `@mdx-js/mdx`. If it is `false`, the mdx components provided by parent `MDXProvider`s are going to be disregarded.

**Result of the `hydrate` function**

```typescript
type HydrateResult = {
  content: React.JSX.Element;
  mod: Record<string, unknown>;
  error?: Error;
};
```

The **`mod`** object is for exported information from MDX source.

> [!TIP]
> If you need to get the **exports** from MDX --> use **`hydrate`**\
> If you don't need --> use **`MDXClient`**

The `hydrate` has **internal error handling mechanism** as much as it can, in order to do so, it returns an **`error`** object if it is catched.

> [!CAUTION]
> The eval of the compiled source returns a module `MDXModule`, and does not throw errors except syntax errors. Some errors throw during the render process which needs you to use an **ErrorBoundary**.

```tsx
import { hydrate, type SerializeResult } from "next-mdx-remote-client/csr";

import { ErrorComponent, TableOfContentComponent } from "../components";
import { components } from "../mdxComponents";
import type { Frontmatter, Scope } from "../types"

type Props = {
  mdxSource?: SerializeResult<Frontmatter, Scope>;
}

export default function Page({ mdxSource }: Props) {
  if (!mdxSource) {
    return <ErrorComponent error="The source could not found !" />;
  }

  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  // Now, mdxSource has {compiledSource, frontmatter, scope}

  const { content, mod, error } = hydrate({ ...mdxSource, components });

  if (error) {
    return <ErrorComponent error={error} />;
  }

  // You can use the "mod" object for exported information from the MDX as you wish

  return (
    <>
      <h1>{mdxSource.frontmatter.title}</h1>
      <div><em>{mod.something}</em></div>
      <TableOfContentComponent toc={mdxSource.scope.toc} />
      {content}
    </>
  );
};
```

In the above example, I assume you use **`remark-flexible-toc`** remark plugin in order to collect the headings from the MDX content, and you pass that information into the `scope` via `vfileDataIntoScope` option within the serialize on the server side.

### The `MDXClient` component

_Go to the [serialize](#the-serialize-function) function_
_or the [hydrate](#the-hydrate-function) function_

```typescript
import { MDXClient } from "next-mdx-remote-client/csr";
```

The `MDXClient` component is used for rendering the MDX content on the client side.

```typescript
function MDXClient(props: MDXClientProps): React.JSX.Element {}
```

The `MDXClient` component takes `MDXClientProps` and returns `React.JSX.Element`. The `MDXClient` has no "options" parameter like `hydrate`.

**Props of the `MDXClient` component**

```typescript
type MDXClientProps = {
  compiledSource: string;
  frontmatter?: Record<string, unknown>;
  scope?: Record<string, unknown>;
  components?: MDXComponents;
  disableParentContext?: boolean;
  onError?: React.ComponentType<{ error: Error }>
};
```

The option `disableParentContext` is a feature of `@mdx-js/mdx`. If it is `false`, the mdx components provided by parent `MDXProvider`s are going to be disregarded.

> [!TIP]
> If you need to get the **exports** from MDX --> use **`hydrate`**\
> If you don't need --> use **`MDXClient`**

The `MDXClient` has **internal error handling mechanism** as much as it can, in order to do so, it takes **`onError`** prop in addition to `hydrate` function.

> [!CAUTION]
> The eval of the compiled source returns a module `MDXModule`, and does not throw errors except syntax errors. Some errors throw during the render process which needs you to use an **ErrorBoundary**.

```tsx
import { MDXClient, type SerializeResult } from "next-mdx-remote-client/csr";

import { ErrorComponent, TableOfContentComponent } from "../components";
import { components } from "../mdxComponents";
import type { Frontmatter, Scope } from "../types"

type Props = {
  mdxSource?: SerializeResult<Frontmatter, Scope>;
}

export default function Page({ mdxSource }: Props) {
  if (!mdxSource) {
    return <ErrorComponent error="The source could not found !" />;
  }

  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  // Now, mdxSource has {compiledSource, frontmatter, scope}

  return (
    <>
      <h1>{mdxSource.frontmatter.title}</h1>
      <TableOfContentComponent toc={mdxSource.scope.toc} />
      <MDXClient
        {...mdxSource}
        components={components}
        onError={ErrorComponent}
      />
    </>
  );
};
```

In the above example, I assume you use **`remark-flexible-toc`** remark plugin in order to collect the headings from the MDX content, and you pass that information into the `scope` via `vfileDataIntoScope` option within the serialize on the server side.

### The `hydrateLazy` function and the `MDXClientLazy` component

The `next-mdx-remote-client` exports additional versions, say, the `hydrateLazy` and the `MDXClientLazy`, which both **have the same _functionality_, _props_, _results_** with the `hydrate` and the `MDXClient`, correspondently.

**The only difference is the hydration process takes place lazily** on the browser within a `window.requestIdleCallback` in a useEffect. You can use `hydrateLazy` or `MDXClientLazy` in order to defer hydration of the content and immediately serve the static markup.

```typescript
import { hydrateLazy, MDXClientLazy } from "next-mdx-remote-client/csr";
```

When you use `hydrateLazy`, and want to get the exports from MDX via `mod` object, please be aware that the `mod` object is always empty `{}` at first render, then it will get actual exports at second render.

> [!NOTE]
> Lazy hydration defers hydration of the components on the client. This is an optimization technique to improve the initial load of the application, but may introduce unexpected delays in interactivity for any dynamic content within the MDX content.\
> \
> This will add an additional wrapping div around the rendered MDX, which is necessary to avoid hydration mismatches during render.\
> \
> _For further explanation about the lazy hydration see [`next-mdx-remote`](https://github.com/hashicorp/next-mdx-remote) notes._

### The `hydrateAsync` function and the `MDXClientAsync` component

The `next-mdx-remote-client` exports additional versions, say, the `hydrateAsync` and the `MDXClientAsync`.

These have additional props and options, but here, I don't want to give the details since **I created them for experimental** to show the `import statements` on the client side don't work. You can have a look at the github repository for the code and the tests.

**The main difference is that the eval of the compiled source takes place in a useEffect** on the browser, since the compile source has `await` keyword for `import statements`.

```typescript
import { hydrateAsync, MDXClientAsync } from "next-mdx-remote-client/csr";
```

> [!NOTE]  
> I believe, it is viable somehow using `dynamic` API if the `vercel` supports for a solution for the `pages` router via `import.meta` APIs. During the compilation of the MDX in the `serialize`, a remark/recma plugin can register the imported modules into the `import.meta.url` via a nextjs API (needs support of vercel) for them will be available to download/import on the client side via `dynamic` api. This is my imagination.

### The `MDXProvider` component

The package exports the `MDXProvider` from `@mdx-js/react`, in order the developers don't need to install the `@mdx-js/react`.

```typescript
import { MDXProvider } from "next-mdx-remote-client/csr";
```

The `<MDXProvider />` makes the mdx components available to any `<MDXClient />` or `hydrate's { content }`  being rendered in the application, as a child status of that provider. 

For example, you can wrap the whole application so as **you do not need to supply the mdx components into any `<MDXClient />` or `hydrate's { content }`.**

```tsx
import { MDXProvider } from 'next-mdx-remote-client';

import { components } from "../mdxComponents"; 

export default function App({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}
```

> [!NOTE]
> How this happens, because the `next-mdx-remote-client` injects the `useMdxComponents` context hook from `@mdx-js/react` during the function construction of the compiled source, internally. Pay attention that it is valid for only `MDXClient` and `hydrate` functions.

> [!CAUTION]
> Since `MDXRemote` as a react server component can not read the context, **`MDXProvider` is effectless when used within the nextjs `app` router** for `MDXRemote`, which is also for `evaluate`.

## MDX Components

You can provide a map of custom MDX components, which is a feature of `@mdx-js/mdx`, in order to replace HTML tags (see [the list of markdown syntax and equivalent HTML tags](https://mdxjs.com/table-of-components)) with the custom components.

Typescript users can use `MDXComponents` from `mdx/types`, which is exported by this package as well.

`../mdxComponents/index.ts`
```tsx
import { type MDXComponents } from "next-mdx-remote-client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { Typography } from "@material-ui/core";
import { motion } from 'framer-motion'

import Hello from "./Hello";
import CountButton from "./CountButton";
import BlockQuote, { default as blockquote } from "./BlockQuote";
import pre from "./pre";

export const mdxComponents: MDXComponents = {
  Hello,
  CountButton,
  Dynamic: dynamic(() => import("./dynamic")),
  Image,
  Link,
  motion: { div: () => <div>Hello world</div> },
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <Typography variant="h2" {...props} />
  ),
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="custom-strong" {...props} />
  ),
  em: (props: React.ComponentPropsWithoutRef<"em">) => (
    <em className="custom-em" {...props} />
  ),
  pre,
  blockquote,
  BlockQuote,
  wrapper: (props: { children: any }) => {
    return <div id="mdx-layout">{props.children}</div>;
  }
};
```

> [!NOTE]
> The **`wrapper`** is a special key, if you want to wrap the MDX content with a HTML container element.

`./data/my-article.mdx`
```markdown
---
title: "My Article"
author: "ipikuka"
---
_Read in {readingTime}, written by <Link href="#">**{frontmatter.author}**</Link>_

# {frontmatter.title}

## Sub heading for custom components

<Hello name={foo} />

<CountButton />

<Dynamic />

<Image src="/images/cover.png" alt="cover" width={180} height={40} />

<BlockQuote>
  I am blackquote content
</BlockQuote>

<motion.div animate={{ x: 100 }} />

## Sub heading for some markdown elements

![cover](/images/cover.png)

Here is _italic text_ and **strong text**

> I am blackquote content
```

## Utility `getFrontmatter`

The package exports one utility **`getFrontmatter`** which is **for getting frontmatter without compiling the source**. You can get the fronmatter and the stripped source by using the `getFrontmatter` which employs the same frontmatter extractor **`vfile-matter`** used within the package.

```typescript
import { getFrontmatter } from "next-mdx-remote-client/utils";

const { frontmatter, strippedSource } = getFrontmatter<TFrontmatter>(source);
```

If you provide **the generic type parameter**, it ensures the `frontmatter` gets the type, otherwise `Record<string, unknown>` by default.

**If there is no frontmatter** in the source, the `frontmatter` will be **empty object `{}`**.

> [!IMPORTANT]
> \
> If you use **`next-mdx-remote`** and want to get `frontmatter` without compiling the source !
> \
> The subpath **`next-mdx-remote-client/utils`** is isolated from other features of the package and it does cost minimum. **So, anyone can use `next-mdx-remote-client/utils` while using `next-mdx-remote`.**

## Types

The `next-mdx-remote-client` is fully typed with [TypeScript][url-typescript].

The package exports the types for server side (rsc):

- `EvaluateProps`
- `EvaluateOptions`
- `EvaluateResult`
- `MDXRemoteProps`
- `MDXRemoteOptions`

The package exports the types for client side (csr):

- `HydrateProps`
- `HydrateResult`
- `MDXClientProps`
- `SerializeResult`

The package exports the types for the serialize function:

- `SerializeProps`
- `SerializeOptions`
- `SerializeResult`

In addition, the package exports the types from `mdx/types` so that developers do not need to import `mdx/types`:

- `MDXComponents`
- `MDXContent`
- `MDXProps`
- `MDXModule`

## Compatibility

The `next-mdx-remote-client` works with unified version 6+ ecosystem since it is compatible with MDX version 3.

## Security

Allowance of the **`export declarations`** and the **`import declarations`** in MDX source, if you don't have exact control on the content, may cause vulnerabilities and harmful activities. The **next-mdx-remote-client** gives options for disabling them. 

But, you need to use a custom recma plugin for disabiling the **`import expressions`** like `await import("xyz")` since the **next-mdx-remote-client** doesn't touch the import expressions.

`Eval` a string of JavaScript can be a dangerous and may cause enabling XSS attacks, which is how the **next-mdx-remote-client** APIs do. Please, take your own measures while passing the user input.

If there is a Content Security Policy (CSP) on the website that disallows code evaluation via `eval` or `new Function()`, it is needed to loosen that restriction in order to utilize `next-mdx-remote-client`, which can be done using [unsafe-eval](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#common_sources).

## Some Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via Vfile.data or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines
- [`rehype-code-meta`](https://www.npmjs.com/package/rehype-code-meta)
  – Rehype plugin to copy `code.data.meta` to `code.properties.metastring`
- [`rehype-image-toolkit`](https://www.npmjs.com/package/rehype-image-toolkit)
  – Rehype plugin to enhance Markdown image syntax `![]()` and Markdown/MDX media elements (`<img>`, `<audio>`, `<video>`) by auto-linking bracketed or parenthesized image URLs, wrapping them in `<figure>` with optional captions, unwrapping images/videos/audio from paragraph, parsing directives in title for styling and adding attributes, and dynamically converting images into `<video>` or `<audio>` elements based on file extension.

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
   – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
 - [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
   – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.
- [`recma-mdx-import-react`](https://www.npmjs.com/package/recma-mdx-import-react)
  – Recma plugin to ensure getting `React` instance from the arguments and to make the runtime props `{React, jsx, jsxs, jsxDev, Fragment}` is available in the dynamically imported components in the compiled source of MDX.
- [`recma-mdx-html-override`](https://www.npmjs.com/package/recma-mdx-html-override)
  – Recma plugin to allow selected raw HTML elements to be overridden via MDX components.
- [`recma-mdx-interpolate`](https://www.npmjs.com/package/recma-mdx-interpolate)
  – Recma plugin to enable interpolation of identifiers wrapped in curly braces within the `alt`, `src`, `href`, and `title` attributes of markdown link and image syntax in MDX.

## License

[MPL 2.0 License](./LICENSE) © ipikuka

[MDX]: https://mdxjs.com/
[mdx-js-mdx]: https://github.com/mdx-js/mdx
[next-mdx-remote]: https://github.com/hashicorp/next-mdx-remote

[badge-npm-version]: https://img.shields.io/npm/v/next-mdx-remote-client
[badge-npm-download]:https://img.shields.io/npm/dt/next-mdx-remote-client
[url-npm-package]: https://www.npmjs.com/package/next-mdx-remote-client
[url-github-package]: https://github.com/ipikuka/next-mdx-remote-client

[badge-license]: https://img.shields.io/github/license/ipikuka/next-mdx-remote-client
[url-license]: https://github.com/ipikuka/next-mdx-remote-client/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/next-mdx-remote-client/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/next-mdx-remote-client/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/next-mdx-remote-client
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/next-mdx-remote-client/graph/badge.svg?token=N0BPBCI5CC
[url-codecov]: https://codecov.io/gh/ipikuka/next-mdx-remote-client
 
[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Fnext-mdx-remote-client%2Fmaster%2Fpackage.json
