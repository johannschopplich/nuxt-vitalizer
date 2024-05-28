![Nuxt LCP Speedup module](./.github/og.jpg)

# Nuxt LCP Speedup

A [Nuxt](https://nuxt.com) workaround as a _do-one-thing-well_ module to optimize Largest Contentful Paint (LCP) for Lighthouse and Google PageSpeed Insights.

## Why?

Large Nuxt applications can suffer from poor performance scores in Lighthouse and Google PageSpeed Insights due to `<link rel="prefetch">` tags accumulating in the HTML. This module removes prefetchable chunks from the build manifest to improve the LCP score.

For each dynamic import, such as asynchronous components and other assets such as images, a `<link rel="prefetch">` is rendered by Nuxt. This causes the browser to prefetch these chunks, even if they are not needed on the current page. While this is great for the overall performance of the application, it can lead to a high number of prefetch requests, which negatively affects the Largest Contentful Paint score.

![Lighthouse SEO performance score when using the module](./.github/lighthouse-seo-performance.png)

This module is a workaround that hooks into the Nuxt build process to optimize the LCP score by:

- Disabling rendering `prefetch` links for dynamic imports.
- Preventing image assets (`gif`, `jpg`, `jpeg`, `png`, `svg`, and `webp`) from being prefetched. You can customize this list in the [module options](#module-options).

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
    // Set the asset extensions that should not be prefetched
    assetExtensions: ['webp']
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
   * List of assets extensions that should not be prefetched.
   *
   * @default ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp']
   */
  assetExtensions?: string[]
}
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Credits

- All the discussions and contributions in the Nuxt GitHub [issue #14584](https://github.com/nuxt/nuxt/issues/14584) and [issue #18376](https://github.com/nuxt/nuxt/issues/18376) that inspired this module.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
