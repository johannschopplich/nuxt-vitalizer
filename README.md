![Nuxt Vitalizer module](./.github/og.jpg)

# Nuxt Vitalizer

A collection of workarounds as a _do-one-thing-well_ [Nuxt](https://nuxt.com) module to optimize the Largest Contentful Paint (LCP) in Google Lighthouse and Google PageSpeed Insights.

This module provides a solution for the following Nuxt issues (among others):

- [Disable `prefetch` for dynamic imports](https://github.com/nuxt/nuxt/issues/18376) (#18376)
- [Optimizations for prefetching chunks](https://github.com/nuxt/nuxt/issues/14584) (#14584)
- [`inlineStyles` option causes duplication of CSS](https://github.com/nuxt/nuxt/issues/21821) (#21821)

## Features

- 🚀 Better LCP with zero configuration
- 🫸 Remove render-blocking CSS

## Setup

```bash
npx nuxt module add vitalizer
```

## Usage

Add the Nuxt Vitalizer to your Nuxt configuration and you're good to go:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer']
})
```

To customize the module, configure the `vitalizer` option in your Nuxt configuration:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    // Remove the render-blocking entry CSS
    disableStylesheets: 'entry'
  }
})
```

## LCP Optimization Features

With the optimization features of this module applied, you can reach a higher Lighthouse performance score:

![Lighthouse SEO performance score when using the module](./.github/lighthouse-seo-performance.png)

### Disable Prefetch Links for Dynamic Imports

> [!NOTE]
> This feature is enabled by default.

Large Nuxt applications can suffer from poor performance scores in Lighthouse and Google PageSpeed Insights due to `<link rel="prefetch">` tags accumulating in the HTML.

For each dynamic import, such as asynchronous components and other assets such as images, a `prefetch` link is rendered. This causes the browser to prefetch these chunks, even if they are not needed on the current page. While this is great for the overall performance of the application, it can lead to a high number of prefetch requests, which negatively affects the Largest Contentful Paint score.

This module hooks into the Nuxt build process to optimize the LCP score by disabling the rendering of `prefetch` links for dynamic imports.

### Disable Preload Links

> [!NOTE]
> This feature has to be enabled manually.

Preload links are used to preload critical resources that are needed for the current page. While they generally have their place in optimizing the performance of a website, they can also lead to a high number of requests if not used correctly. Removing preload links can help to improve the FCP (First Contentful Paint) scores, especially on slow network conditions.

To remove preloading build resources, set the `disablePrefetchLinks` option to `true`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    disablePrefetchLinks: true
  }
})
```

### Stop Render-Blocking CSS

> [!NOTE]
> This feature has to be enabled manually. In order to use it, you need to have the Nuxt `inlineStyles` feature enabled. Make sure to test your application after enabling this option.

CSS stylesheets are render-blocking resources, which means that the browser has to download and parse the CSS before rendering the page. By using inlined styles instead of loading stylesheets, the browser can render the page faster, which can improve the LCP score.

While the latest Nuxt versions inline styles during SSR rendering, the `entry.<hash>.css` stylesheet is still rendered in the HTML. This can lead to render-blocking CSS, which can negatively affect the Largest Contentful Paint score.

Why is that the case? As [explained by Nuxt core team member @danielroe](https://github.com/nuxt/nuxt/issues/21821#issuecomment-1701613422):

> I think this is a limitation of the current inlining style implementation.
>
> Styles used _everywhere_ on your app could safely be removed entirely from CSS source directly. But CSS used only in one component or a page need to be located in a CSS file _as well as_ inlined.
>
> At the moment, vite is in charge entirely of loading CSS on the client side which means that even if we did track what CSS was already loaded, we can't stop vite from loading the CSS files which contain duplicated CSS.
>
> This is something I definitely want to see fixed.

First, try to import the main application styles in the `app.vue` file. They will be saved as the `entry` CSS file when Nuxt is built:

```ts
// `app.vue`
import '~/assets/css/main.css'
```

Now, set the `disableStylesheets` option to `entry` to prevent the `entry.<hash>.css` stylesheet from being rendered in the HTML:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-vitalizer'],

  vitalizer: {
    disableStylesheets: 'entry'
  }
})
```

## Module Options

```ts
interface ModuleOptions {
  /**
   * Whether to remove prefetch links from the HTML. If set to `dynamicImports`, only dynamic imports will be removed. To disable all prefetching, such as images, set to `true`.
   *
   * @remarks
   * This will prevent the browser from downloading chunks that may not be needed yet. This can be useful for improving the LCP (Largest Contentful Paint) score.
   *
   * @default 'dynamicImports'
   */
  disablePrefetchLinks?: boolean | 'dynamicImports'

  /**
   * Whether to remove preload links from the HTML. This can be useful for improving the FCP (First Contentful Paint) score, especially when emulating slow network conditions.
   *
   * @default false
   */
  disablePreloadLinks?: boolean

  /**
   * Whether to remove the render-blocking stylesheets from the HTML. This only makes sense if styles are inlined during SSR rendering. To only prevent the `entry.<hash>.css` stylesheet from being rendered, set to `entry`. If set to `true`, all stylesheet links will not be rendered.
   *
   * @remarks
   * This requires to have the Nuxt `inlineStyles` feature enabled. Make sure to test your application after enabling this option.
   *
   * @default false
   */
  disableStylesheets?: boolean | 'entry'
}
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Credits

- All the discussions and contributions in the Nuxt GitHub issues that inspired this module.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
