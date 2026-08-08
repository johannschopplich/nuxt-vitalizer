![Nuxt Vitalizer module](./.github/og.jpg)

# Nuxt Vitalizer

Better Largest Contentful Paint scores for your [Nuxt](https://nuxt.com) app in [Google Lighthouse](https://developer.chrome.com/docs/lighthouse).

- [✨ &nbsp;Release Notes](https://github.com/johannschopplich/nuxt-vitalizer/releases)

> [!IMPORTANT]
> This moves the Lighthouse score, and only sometimes the field metric. Lighthouse's Lantern simulator counts every request that finishes before the observed LCP against the critical path, prefetches included, so removing them shortens the simulation. In the field those same prefetches make the next navigation faster. Measure with [CrUX](https://developer.chrome.com/docs/crux) before and after.

## Features

- 🔗 [No prefetch links for dynamic imports](#disable-prefetch-links-for-dynamic-imports), on by default
- 🪶 [Optional removal of preload and `modulepreload` links](#disable-preload-links)
- 🎨 [Optional removal of stylesheet links whose styles Nuxt already inlined](#disable-stylesheets)
- 🧪 Build-time only, no runtime code in your bundle
- 🦾 SSR-ready

## Setup

> [!NOTE]
> Requires Nuxt 4. The module edits the client manifest, so it does nothing during `nuxt dev` and `nuxt prepare` – build the app to see its effect.

```bash
npx nuxt module add vitalizer
```

## Basic Usage

Add `nuxt-vitalizer` to the `modules` section of your Nuxt configuration:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],
})
```

That is `disablePrefetchLinks: 'dynamicImports'`, the default and the one change with real reach: every `<link rel="prefetch">` Nuxt renders for a dynamic import is gone from the next build. The other two options are off until you turn them on.

## What Each Option Changes

Measured on the fixture in `test/fixture`: three routes, one component shared between two of them, one stylesheet imported from a plain `.ts` module, one lazy component that stays unmounted, one image above Vite's inline limit, and a global stylesheet registered through `nuxt.config`. Every number below is asserted by the e2e suite, so no cell can drift away from the code.

| `vitalizer` options | `modulepreload` | `prefetch` (script) | `prefetch` (image) | `stylesheet` |
| --- | --- | --- | --- | --- |
| *(defaults)* | 4 | 0 | 1 | 3 |
| `disablePrefetchLinks: true` | 4 | 0 | 0 | 3 |
| `disablePrefetchLinks: false` | 4 | 2 | 1 | 3 |
| `disablePreloadLinks: true` | 0 | 0 | 1 | 3 |
| `disableStylesheets: true` | 4 | 0 | 1 | 2 |

Row three is what Nuxt does on its own. Row four is the one to read twice: `disablePreloadLinks` also empties the script prefetches, because Nuxt derives the prefetch set from the preload set – compare it against row three, not against the defaults, since the defaults have already dropped them. The two stylesheets that survive row five are the global one and the one imported from the `.ts` module; Nuxt inlined neither, so each link is the only copy of its rules.

### Disable Prefetch Links for Dynamic Imports

> [!NOTE]
> This feature is enabled by default.

Nuxt renders a `<link rel="prefetch">` for every dynamic import the current page does not mount, such as a lazy component behind a `v-if`. Each one is a request the browser starts before it knows whether the chunk is needed.

Set `disablePrefetchLinks` to `true` to drop every prefetch link instead, images included:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    disablePrefetchLinks: true,
  },
})
```

### Disable Preload Links

> [!WARNING]
> This is the one option here that can make your LCP worse. Without `modulepreload`, the browser only discovers a chunk's dependencies once it has parsed the chunk, so a deep import graph turns into a request waterfall. It wins on constrained connections and against "preload not used" warnings, and it loses on high latency. Measure before you ship it.

Preload and `modulepreload` links tell the browser to fetch a chunk the current page does need. In a large application that is a burst of requests before the first paint, and the chunks at the back of the queue arrive later than they would have on demand.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    disablePreloadLinks: true,
  },
})
```

Nuxt has no equivalent switch. `vite.build.modulePreload: false` reaches Vite, but only governs Vite's own output – the polyfill, and the dependency lists `__vitePreload` warms at runtime. The `<link rel="modulepreload">` tags in the server-rendered HTML come from Nuxt's client manifest and stay.

### Disable Stylesheets

With `features.inlineStyles` on, Nuxt inlines a component's CSS into the HTML and empties that chunk's stylesheet list. The map it looks the sources up in is keyed by the chunk's `src`, and a chunk shared between two parents has none – so Nuxt cannot attribute the styles and leaves the list standing. The result is CSS delivered twice: once inline, once as a render-blocking `<link rel="stylesheet">`. This is [nuxt#35255](https://github.com/nuxt/nuxt/issues/35255), open and reproducible on Nuxt 4.5.2.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    disableStylesheets: true,
  },
})
```

A link is removed only once every rule behind it comes from a Vue component style block, which is the whole of what Nuxt inlines. The module walks the client module graph for that, because a stylesheet merged out of a shared chunk carries no record of where its rules came from. Two kinds of stylesheet therefore keep their link: global CSS from `nuxt.config`, and anything reaching the page through a plain `import './styles.css'` in a `.ts` module. Nuxt inlines neither, so those links are the only copy of their rules. The option is inert while `features.inlineStyles` is off, for the same reason.

One case is left uncovered. `features.inlineStyles` resolves to the predicate `id => id.includes('.vue')` by default, which is the rule this option applies too. Narrow it, and a component you excluded keeps its styles in a link – but its rules still come from a Vue style block, so this option removes that link anyway. Check a build before you ship a narrowed predicate.

### Background

All three features are manifest edits Nuxt deliberately does not expose. The tracking issue [nuxt#14584](https://github.com/nuxt/nuxt/issues/14584) has been open since 2022, and the position there is a design decision rather than a backlog item:

> Build-time and manifest based page prefetching is probably something we don't want to do in Nuxt 3 since [it] was always tricky in Nuxt 2 when number of pages increases. Only reliable way to predict next pages is runtime rendering.
>
> – [@pi0](https://github.com/nuxt/nuxt/issues/14584#issuecomment-1397360645)

Nuxt does prune individual bad hints as they are found, most recently in [nuxt#35342](https://github.com/nuxt/nuxt/pull/35342), [nuxt#35691](https://github.com/nuxt/nuxt/pull/35691) and [nuxt#35812](https://github.com/nuxt/nuxt/pull/35812). This module is the blanket switch: it strips the hints for every manifest entry instead of one case at a time.

## Module Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `disablePrefetchLinks` | `boolean \| 'dynamicImports'` | `'dynamicImports'` | Whether to remove prefetch links from the HTML. `'dynamicImports'` drops only the links Nuxt renders for dynamic imports; `true` drops every prefetch link, images included; `false` disables the feature. |
| `disablePreloadLinks` | `boolean` | `false` | Whether to remove preload and `modulepreload` links from the HTML. Also drops the prefetch links of dynamically imported chunks, since Nuxt derives the prefetch set from the preload set. |
| `disableStylesheets` | `boolean` | `false` | Whether to remove the stylesheet links whose styles Nuxt already inlined. Removes a link only when every rule behind it comes from a Vue component style block, so global CSS and plain `.css` imports keep theirs. Requires `features.inlineStyles`. |

## Migrating to v3

**Nuxt 4 is required.** This is support scope rather than a technical floor – the manifest has the same shape in Nuxt 3, but only Nuxt 4 is tested. Nuxt refuses to load the module on anything older and says so during the build. The last release for Nuxt 3 is v0.9.1.

**`disableStylesheets` is a boolean.** It used to accept `boolean | 'entry'`, documented as removing only the `entry.<hash>.css` link. It never did: for every chunk that was not the entry, `'entry'` fell through to the same branch as `true` and cleared the whole list. Replace `disableStylesheets: 'entry'` with `disableStylesheets: true` to keep what you already had.

**`disableStylesheets` leaves more links standing.** v2 cleared the stylesheet list of every chunk, including the ones Nuxt had deliberately kept because it never inlined them – global CSS from `nuxt.config` among them, which reached the page through that link alone. v3 removes a link only when it can show the same rules are inlined, so expect one link back per stylesheet Nuxt never touched. If your v2 build looked right regardless, none of your CSS was in that category.

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Build the playground using `pnpm run dev:build` – the module is inert in `pnpm run dev`
6. Run the tests using `pnpm run test`

## Credits

- [@mummybot](https://github.com/mummybot) for the [manifest snippet](https://github.com/nuxt/nuxt/issues/14584#issuecomment-2166544081) this module grew out of.
- All the discussions and contributions in the Nuxt GitHub issues that inspired this module.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
