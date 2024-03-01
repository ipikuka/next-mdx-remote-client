# Migration guide from `next-mdx-remote`

### The differences in package's exported subpaths

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
// for the "pages" router, it is a client component
import { MDXRemote } from "next-mdx-remote"; 

// for the "app" router, it is a server component
import { MDXRemote } from "next-mdx-remote/rsc"; 
```

**`🟩 next-mdx-remote-client`:**

It exports `<MDXRemote />` for the "app" router, `<MDXClient />` for the "pages" router. 

```typescript
// for the "pages" router, it is a client component
import { MDXClient } from "next-mdx-remote-client/csr"; 

// for the "app" router, it is a server component
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

The `MDXRemote` and `compileMDX` take the same props `MDXRemoteProps`.

```typescript
type MDXRemoteProps = {
  source: VFileCompatible
  options?: SerializeOptions
  components?: React.ComponentProps<typeof MDXProvider>['components']
}
```

**`🟩 next-mdx-remote-client`:**

The `MDXRemoteProps` has additional `onError` prop in addition to`EvaluateProps`.

```typescript
type EvaluateProps<TScope> = {
  source: Compatible;
  options?: EvaluateOptions<TScope>;
  components?: MDXComponents;
}

type MDXRemoteProps<TScope> = {
  source: Compatible;
  options?: EvaluateOptions<TScope>;
  components?: MDXComponents;
  onError?: React.ComponentType<{ error: Error }>;
}
```

### Use `evaluate` instead of `compileMDX`

**`🟥 next-mdx-remote`:**

It takes `MDXRemoteProps` and returns `CompileMDXResult` as a promise.

```typescript
async function compileMDX<Frontmatter>({source, options, components}): Promise<CompileMDXResult> {}
```

It takes one generic type parameter `<Frontmatter>`.

**`🟩 next-mdx-remote-client`:**

It takes `EvaluateProps` and returns `EvaluateResult` as a promise.

```typescript
async function evaluate<Frontmatter, Scope>({source, options, components}): Promise<EvaluateResult> {}
```

It takes two generic type parameters `<Frontmatter, Scope>` _(the order matters)_.

### The `evaluate` and the `compileMDX` have different results

**`🟥 next-mdx-remote`:**

It returns the MDX `content` and the `frontmatter`.

```typescript
const { content, frontmatter } = await compileMDX<Frontmatter>({source, options, components});

type CompileMDXResult<TFrontmatter> = {
  content: React.ReactElement
  frontmatter: TFrontmatter
}
```

**`🟩 next-mdx-remote-client`:**

It returns `mod` object for the exports, `scope`, and `error` object additional to MDX `content` and the `frontmatter`.

```typescript
const { content, mod, frontmatter, scope, error } = await evaluate<Frontmatter, Scope>({source, options, components});

type EvaluateResult<TFrontmatter, TScope> = {
  content: JSX.Element;
  mod: Record<string, unknown>;
  frontmatter: TFrontmatter;
  scope: TScope;
  error?: Error;
}
```

### The differences in options

Please, note that, the `mdxOptions` are more or less similar but refers to different type definition.

**`🟥 next-mdx-remote`:**

The "compileMDX" and "MDXRemote" options:

```typescript
{
  mdxOptions?: /* mdx options to be passed to @mdx-js/mdx */
  parseFrontmatter?: boolean
  scope?: Record<string, unknown>
}
```

**`🟩 next-mdx-remote-client`:**

The "evaluate" and "MDXRemote" options:

```typescript
{
  mdxOptions?: /* mdx options to be passed to @mdx-js/mdx */
  disableExports?: boolean;
  disableImports?: boolean;
  parseFrontmatter?: boolean;
  scope?: Record<string, unknown>;
  vfileDataIntoScope?: VfileDataIntoScope;
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
  content: JSX.Element;
  mod: Record<string, unknown>;
  error?: Error;
};
```

### Use `MDXClient` instead of `MDXRemote` in the pages router

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

### For lazy hydration use `hydrateLazy` and `<MDXClientLazy />`

**`🟥 next-mdx-remote`:**

```typescript
<MDXRemote
  compiledSource={compiledSource}
  /* */
  lazy={true}
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
  /* */
/>
```