# Migration guide from `next-mdx-remote`

## Migration examples for "pages" router

All examples have been taken from **`next-mdx-remote`** to show exactly how to migrate the code.

<details>
  <summary>Main example in the github page headline</summary>

```diff
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

import { Test } from '../mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { Test }

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} components={components} />
+     <MDXClient {...source} components={components} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source = 'Some **mdx** text, with a component <Test />'
- const mdxSource = await serialize(source)
+ const mdxSource = await serialize({source})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>Parsing frontmatter</summary>

```diff
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

import { Test } from '../mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { Test }

export default function TestPage({ mdxSource }) {
+ if ("error" in mdxSource) {
+   return <ErrorComponent error={mdxSource.error} />;
+ }

  return (
    <div className="wrapper">
      <h1>{mdxSource.frontmatter.title}</h1>
-     <MDXRemote {...mdxSource} components={components} />
+     <MDXClient {...mdxSource} components={components} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source = `---
title: Test
---
Some **mdx** text, with a component <Test name={frontmatter.title}/>`

- const mdxSource = await serialize(source, { parseFrontmatter: true })
+ const mdxSource = await serialize({source, options: { parseFrontmatter: true }})
  return { props: { mdxSource } }
}
```

</details>

<details>
  <summary>Passing custom data to a component with `scope`</summary>

```diff
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

import { Test } from '../mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { Test }
const data = { product: 'next' }

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} components={components} scope={data} />
+     <MDXClient {...source} components={components} scope={data} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source =
    'Some **mdx** text, with a component using a scope variable <Test product={product} />'
- const mdxSource = await serialize(source)
+ const mdxSource = await serialize({source})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>Passing `scope` into the `serialize` function instead</summary>

```diff
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

import { Test } from '../mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { Test }
const data = { product: 'next' }

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} components={components} />
+     <MDXClient {...source} components={components} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source =
    'Some **mdx** text, with a component <Test product={product} />'
- const mdxSource = await serialize(source, { scope: data })
+ const mdxSource = await serialize({source, options: { scope: data }})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>
    Custom components from <code>MDXProvider</code><a id="mdx-provider"></a>
  </summary>

```diff
// pages/_app.jsx
- import { MDXProvider } from '@mdx-js/react'
+ import { MDXProvider } from 'next-mdx-remote-client'

import Test from '../mdxComponents/Test'

const components = { Test }

export default function MyApp({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}
```

```diff
// pages/test.jsx
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

+ import { ErrorComponent } from '../components'

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} />
+     <MDXClient {...source} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source = 'Some **mdx** text, with a component <Test />'
- const mdxSource = await serialize(source)
+ const mdxSource = await serialize({source})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>
    Component names with dot (e.g. <code>motion.div</code>)
  </summary>

```diff
import { motion } from 'framer-motion'

- import { MDXProvider } from '@mdx-js/react'
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClient, MDXProvider } from 'next-mdx-remote-client'

+ import { ErrorComponent } from '../components'

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} components={{ motion }} />
+     <MDXClient {...source} components={{ motion }} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source = `Some **mdx** text, with a component:

<motion.div animate={{ x: 100 }} />`
- const mdxSource = await serialize(source)
+ const mdxSource = await serialize({source})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>Lazy hydration</summary>

```diff
- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote } from 'next-mdx-remote'

+ import { serialize } from 'next-mdx-remote-client/serialize'
+ import { MDXClientLazy } from 'next-mdx-remote-client'

import { Test } from '../mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { Test }

export default function TestPage({ source }) {
+ if ("error" in source) {
+   return <ErrorComponent error={source.error} />;
+ }

  return (
    <div className="wrapper">
-     <MDXRemote {...source} components={components} lazy />
+     <MDXClientLazy {...source} components={components} />
    </div>
  )
}

export async function getStaticProps() {
  // MDX text - can be from a local file, database, anywhere
  const source = 'Some **mdx** text, with a component <Test />'
- const mdxSource = await serialize(source)
+ const mdxSource = await serialize({source})
  return { props: { source: mdxSource } }
}
```

</details>

<details>
  <summary>With typescript</summary>

```diff
import { type GetStaticProps } from 'next'

- import { serialize } from 'next-mdx-remote/serialize'
- import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote'

+ import { serialize, type SerializeResult } from 'next-mdx-remote-client/serialize'
+ import { MDXClient } from 'next-mdx-remote-client'

import { ExampleComponent } from './mdxComponents'
+ import { ErrorComponent } from '../components'

const components = { ExampleComponent }

- interface Props {
-   mdxSource: MDXRemoteSerializeResult
- }

+ type Props = {
+  mdxSource: SerializeResult
+ }

export default function ExamplePage({ mdxSource }: Props) {
+ if ("error" in mdxSource) {
+   return <ErrorComponent error={mdxSource.error} />;
+ }

  return (
    <div>
+     <MDXRemote {...mdxSource} components={components} />
-     <MDXClient {...mdxSource} components={components} />
    </div>
  )
}

export const getStaticProps: GetStaticProps<{
-  mdxSource: MDXRemoteSerializeResult
+  mdxSource: SerializeResult
}> = async () => {
- const mdxSource = await serialize('some *mdx* content: <ExampleComponent />')
+ const mdxSource = await serialize({ source: 'some *mdx* content: <ExampleComponent />'})
  return { props: { mdxSource } }
}
```

</details>

## Migration examples for "app" router

All examples have been taken from **`next-mdx-remote`** to show exactly how to migrate the code.

<details>
  <summary>Basic example for React Server Components (RSC)</summary>

```diff
- import { MDXRemote } from 'next-mdx-remote/rsc'
+ import { MDXRemote } from 'next-mdx-remote-client/rsc'

+ import { ErrorComponent } from '../components'

// app/page.js
export default function Home() {
  return (
    <MDXRemote
      source={`# Hello from Server Components`}
+     onEror={ErrorComponent}    
    />
  )
}
```

</details>

<details>
  <summary>Loading state in "app" router</summary>

```diff
import { Suspense } from 'react'
- import { MDXRemote } from 'next-mdx-remote/rsc'
+ import { MDXRemote } from 'next-mdx-remote-client/rsc'

+ import { ErrorComponent } from '../components'

// app/page.js
export default function Home() {
  return (
    // In Next.js you can also use `loading.js` instead of <Suspense />
    <Suspense fallback={<>Loading...</>}>
      <MDXRemote
        source={`# Hello from Server Components`}
+       onEror={ErrorComponent}  
      />
    </Suspense>
  )
}
```

</details>

<details>
  <summary>Custom components</summary>

```diff
// components/mdx-remote.js
- import { MDXRemote } from 'next-mdx-remote/rsc'
+ import { MDXRemote } from 'next-mdx-remote-client/rsc'

+ import { ErrorComponent } from '../components'

const components = {
  h1: (props) => (
    <h1 {...props} className="large-text">
      {props.children}
    </h1>
  ),
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
+     onEror={ErrorComponent}  
    />
  )
}
```

```diff
// app/page.js
import { CustomMDX } from '../components/mdx-remote'

export default function Home() {
  return (
    <CustomMDX
      // h1 now renders with `large-text` className
      source={`# Hello from Server Components`}
    />
  )
}
```

</details>

<details>
  <summary>Access `frontmatter` and `scope` outside of MDX</summary>

```diff
// app/page.js
- import { compileMDX } from 'next-mdx-remote/rsc'
+ import { evaluate } from 'next-mdx-remote-client/rsc'

+ import { ErrorComponent } from '../components'

export default async function Home() {
- const { content, frontmatter } = await compileMDX<{ title: string }>({
+ const { content, frontmatter, scope, error } = await evaluate<{ title: string }>({
    source: `---
title: RSC Frontmatter Example
---
# Hello from {product}!`,
    options: { 
      parseFrontmatter: true,
      scope: {
        product: 'Server Components'
      },
    },
  })

+ if (error) {
+   return <ErrorComponent error={error} />;
+ }

  return (
    <>
      <h1>{frontmatter.title}</h1>
+     <h2>{scope.product}</h2>
      {content}
    </>
  )
}
```

</details>

## The differences between `next-mdx-remote` and `next-mdx-remote-client`

### `next-mdx-remote-client` has additional exported subpaths

**`🟥 next-mdx-remote`:**

```typescript
import /* */ from "next-mdx-remote";
import /* */ from "next-mdx-remote/serialize";
import /* */ from "next-mdx-remote/rsc";
```

**`🟩 next-mdx-remote-client`:**

```typescript
import /* */ from "next-mdx-remote-client";
import /* */ from "next-mdx-remote-client/serialize";
import /* */ from "next-mdx-remote-client/rsc";

// additional exported subpaths
import /* */ from "next-mdx-remote-client/csr";
import /* */ from "next-mdx-remote-client/utils";
```

> [!NOTE]
> The `next-mdx-remote-client` and the `next-mdx-remote-client/csr` refer to the same.

### Use `<MDXClient />` in the client side

**`🟥 next-mdx-remote`:**

It exports the components with the same name `<MDXRemote />` for both "app" and "pages" router.

```typescript
// for "pages" router, it is a client component
import { MDXRemote } from "next-mdx-remote"; 

// for "app" router, it is a server component
import { MDXRemote } from "next-mdx-remote/rsc"; 
```

**`🟩 next-mdx-remote-client`:**

It exports `<MDXClient />` for "pages" router, `<MDXRemote />` for "app" router. 

```typescript
// for "pages" router, it is a client component
import { MDXClient } from "next-mdx-remote-client/csr"; 

// for "app" router, it is a server component
import { MDXRemote } from "next-mdx-remote-client/rsc"; 
```

## The part associated with Next.js `app` router

_Go to [the part associated with Next.js pages router](#the-part-associated-with-nextjs-pages-router)_

### The differences in module exports

**`🟥 next-mdx-remote`:**

```typescript
import { MDXRemote, compileMDX } from "next-mdx-remote/rsc";
```

**`🟩 next-mdx-remote-client`:**

```typescript
import { MDXRemote, evaluate } from "next-mdx-remote-client/rsc";
```

### The differences in type exports

**`🟥 next-mdx-remote`:**

```typescript
import type { MDXRemoteProps, CompileMDXResult, MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
```

**`🟩 next-mdx-remote-client`:**

```typescript
import type { MDXRemoteProps, MDXRemoteOptions } from "next-mdx-remote-client/rsc";

import type { EvaluateProps, EvaluateOptions, EvaluateResult } from "next-mdx-remote-client/rsc";
```

### The differences in props

**`🟥 next-mdx-remote`:**

The `compileMDX` and `MDXRemote` take the same props `MDXRemoteProps`.

```typescript
type MDXRemoteProps = {
  source: VFileCompatible
  options?: SerializeOptions
  components?: React.ComponentProps<typeof MDXProvider>['components']
}
```

**`🟩 next-mdx-remote-client`:**

The `evaluate` takes `EvaluateProps` which has a type argument, and **the same prop keys but different types**.

```typescript
type EvaluateProps<TScope> = {
  source: Compatible;
  options?: EvaluateOptions<TScope>;
  components?: MDXComponents;
}
```

The `MDXRemote` takes `MDXRemoteProps` which has `onError` prop in addition to `EvaluateProps`.

```typescript
type MDXRemoteProps<TScope> = {
  source: Compatible;
  options?: EvaluateOptions<TScope>;
  components?: MDXComponents;
  onError?: React.ComponentType<{ error: Error }>;
}
```

### Use `evaluate` instead of `compileMDX`

**`🟥 next-mdx-remote`:**

The `compileMDX` takes `MDXRemoteProps` and returns `CompileMDXResult` as a promise.

```typescript
async function compileMDX<Frontmatter>({source, options, components}): Promise<CompileMDXResult> {}
```

The `compileMDX` takes one generic type parameter `<Frontmatter>`.

**`🟩 next-mdx-remote-client`:**

The `evaluate` takes `EvaluateProps` and returns `EvaluateResult` as a promise.

```typescript
async function evaluate<Frontmatter, Scope>({source, options, components}): Promise<EvaluateResult> {}
```

The `evaluate` takes two generic type parameters `<Frontmatter, Scope>` _(the order matters)_.

### The `evaluate` and the `compileMDX` have different results

**`🟥 next-mdx-remote`:**

The `compileMDX` returns the MDX `content` and the `frontmatter`.

```typescript
const { content, frontmatter } = await compileMDX<Frontmatter>({source, options, components});

type CompileMDXResult<TFrontmatter> = {
  content: React.ReactElement
  frontmatter: TFrontmatter
}
```

**`🟩 next-mdx-remote-client`:**

The `evaluate` returns `mod` object for the exports, `scope`, and `error` objects additional to MDX `content` and the `frontmatter`.

```typescript
const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter, Scope>({source, options, components});

type EvaluateResult<TFrontmatter, TScope> = {
  content: React.JSX.Element;
  mod: Record<string, unknown>;
  frontmatter: TFrontmatter;
  scope: TScope;
  error?: Error;
}
```

### The differences in options

The `next-mdx-remote-client` has more options.

Please, note that, the `mdxOptions` are more or less similar in both **but have differences in terms of opinionation for `@mdx-js/mdx` options**.

**`🟥 next-mdx-remote`:**

The `compileMDX` and `MDXRemote` options:

```typescript
{
  mdxOptions?: /* mdx options to be passed into @mdx-js/mdx */
  parseFrontmatter?: boolean
  scope?: Record<string, unknown>
}
```

**`🟩 next-mdx-remote-client`:**

The `evaluate` and `MDXRemote` options:

```typescript
{
  mdxOptions?: /* mdx options to be passed into @mdx-js/mdx */
  disableExports?: boolean; // <---
  disableImports?: boolean; // <---
  parseFrontmatter?: boolean;
  scope?: Record<string, unknown>;
  vfileDataIntoScope?: VfileDataIntoScope; // <---
}
```

## The part associated with Next.js `pages` router

_Go to [the part associated with Next.js app router](#the-part-associated-with-nextjs-app-router)_

### Serialize function takes named parameters and `rsc` parameter is removed

**`🟥 next-mdx-remote`:**

```typescript
const mdxSource = await serialize(source: VFileCompatible, options: SerializeOptions, rsc: boolean);
```

**`🟩 next-mdx-remote-client`:**

```typescript
const mdxSource = await serialize({ source: Compatible, options: SerializeOptions });
```

### Serialize function has additional options

**`🟥 next-mdx-remote`:**

```typescript
type SerializeOptions = {
  mdxOptions?: SerializeMdxOptions;
  parseFrontmatter?: boolean;
  scope?: Record<string, unknown>;
};
```

**`🟩 next-mdx-remote-client`:**

```typescript
type SerializeOptions<TScope> = {
  mdxOptions?: SerializeMdxOptions;
  disableExports?: boolean; // <---
  disableImports?: boolean; // <---
  parseFrontmatter?: boolean;
  scope?: TScope;
  vfileDataIntoScope?: VfileDataIntoScope; // <---
};
```

### Serialize function accepts the generic type parameters in reverse

**`🟥 next-mdx-remote`:**

```typescript
const mdxSource = await serialize<Scope, Frontmatter>(/* */);
```

**`🟩 next-mdx-remote-client`:**

```typescript
const mdxSource = await serialize<Frontmatter, Scope>(/* */);
```

### SerializeResult takes the generic type parameters in reverse, as well

**`🟥 next-mdx-remote`:**

```typescript
type Props = {
  mdxSource: MDXRemoteSerializeResult<Scope, Frontmatter>;
};
```

**`🟩 next-mdx-remote-client`:**

```typescript
type Props = {
  mdxSource: SerializeResult<Frontmatter, Scope>;
};
```

### Serialize function returns "error" object

**`🟥 next-mdx-remote`:**

It has no "error" object in return.

```typescript
const { compiledSource, frontmatter, scope } = await serialize(/* */);
```

**`🟩 next-mdx-remote-client`:**

```typescript
const { compiledSource, frontmatter, scope, error } = await serialize(/* */);
```

### New function `hydrate`

**`🟥 next-mdx-remote`:**

_It doesn't have the function_

**`🟩 next-mdx-remote-client`:**

```typescript
const { content, mod, error } = hydrate(props: HydrateProps): HydrateResult {}

type HydrateProps = {
  compiledSource: string;
  frontmatter?: Record<string, unknown>;
  scope?: Record<string, unknown>;
  components?: MDXComponents;
  disableParentContext?: boolean;
};

type HydrateResult = {
  content: React.JSX.Element;
  mod: Record<string, unknown>;
  error?: Error;
};
```

### Use `MDXClient` instead of `MDXRemote` in "pages" router

**`🟥 next-mdx-remote`:**

```typescript
<MDXRemote
  compiledSource={compiledSource}
  frontmatter={frontmatter}
  scope={scope}
  components={components}
  lazy={lazy} // boolean, optional
/>
```

**`🟩 next-mdx-remote-client`:**

```typescript
<MDXClient
  compiledSource={compiledSource}
  frontmatter={frontmatter}
  scope={scope}
  components={components}
  onError={onError} // React.ComponentType<{ error: Error }>, optional
/>
```

### For lazy hydration use `hydrateLazy` or `<MDXClientLazy />`

**`🟥 next-mdx-remote`:**

```typescript
<MDXRemote
  compiledSource={compiledSource}
  // ..
  lazy
/>
```

**`🟩 next-mdx-remote-client`:**

```typescript
const { content, mod, error } = hydrateLazy({compiledSource, /* */ })
```
or
```typescript
<MDXClientLazy
  compiledSource={compiledSource}
  // ..
/>
```