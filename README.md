![Nuxt LCP Speedup](./.github/og.jpg)

# Nuxt LCP Speedup

[![npm version](https://img.shields.io/npm/v/nuxt-lcp-speedup?color=a1b858&label=)](https://www.npmjs.com/package/nuxt-lcp-speedup)

[Nuxt](https://nuxt.com) module to optimize Largest Contentful Paint (LCP) for Lighthouse and Google PageSpeed Insights.

## Why?

Large Nuxt applications can suffer from poor performance scores in Lighthouse and Google PageSpeed Insights. Each dynamic import results in a `<link rel="prefetch">` tag being added to the HTML. This causes the browser to prefetch all dynamic imports, delaying the rendering of the main content. Even if the application feels fast, the LCP score can be negatively affected by the prefetching of dynamic imports and image assets. This module addresses this issue by removing prefetchable dependencies from the build manifest.

The module supports two prefetch strategies that hook into the Nuxt build process to optimize the LCP score: `none` and `exceptImages`.

- `none`: Disables prefetching for all dynamic imports. As a result, all `<link rel="prefetch">` tags are removed from the HTML.
- `exceptImages`: Filter image assets from the build manifest. This prevents the browser from prefetching images, which can delay the rendering of the main content. Script and style assets will not be affected. You can define a custom list of image extensions to filter in the [module options](#module-options).

## Setup

```bash
npx nuxi@latest module add nuxt-lcp-speedup
```

## Usage

Add the Nuxt LCP Speedup to your Nuxt configuration and you're good to go:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-lcp-speedup']
})
```

To customize the module, configure the `lcpSpeedup` option in your Nuxt configuration:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-lcp-speedup'],

  lcpSpeedup: {
    prefetchStrategy: 'exceptImages'
  }
})
```

## Module Options

```ts
interface ModuleOptions {
  /**
   * Enable or disable the module.
   *
   * @default true
   */
  enabled?: boolean
  /**
   * Determines which assets to remove from the manifest.
   *
   * @default 'none'
   */
  prefetchStrategy?: 'none' | 'exceptImages'
  /**
   * List of image extensions to remove from the manifest.
   *
   * @default ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp']
   */
  imageExtensions?: string[]
}
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Credits

- All the discussions and contributions in the [Nuxt GitHub issue](https://github.com/nuxt/nuxt/issues/18376) that inspired this module.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
