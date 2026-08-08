import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { name, version } from '../package.json'
import { stripResourceHints } from './manifest'
import { collectInlinedStylesheets } from './stylesheets'

export interface ModuleOptions {
  /**
   * Whether to remove prefetch links from the HTML.
   *
   * @remarks
   * `'dynamicImports'` drops the links Nuxt renders for dynamic imports, such as lazy components
   * that the current page never mounts. `true` drops every prefetch link, images included.
   *
   * @default 'dynamicImports'
   */
  disablePrefetchLinks?: boolean | 'dynamicImports'

  /**
   * Whether to remove preload and `modulepreload` links from the HTML.
   *
   * @remarks
   * The browser then discovers each chunk through the module graph instead of up front, which
   * thins out the request burst before the first paint at the cost of a later start per chunk.
   * This is the one option here that can make Largest Contentful Paint worse – measure it.
   *
   * This also drops the prefetch links of dynamically imported chunks, because Nuxt derives the
   * prefetch set from the preload set. Their stylesheets keep theirs – those enter the prefetch
   * set on a path that never consults the preload flag.
   *
   * @default false
   */
  disablePreloadLinks?: boolean

  /**
   * Whether to remove the render-blocking stylesheet links whose styles Nuxt already inlined.
   *
   * @remarks
   * Only takes effect while `features.inlineStyles` is on, since the inlined styles are what makes
   * a link redundant. A stylesheet is removed only once every rule in it comes from a Vue component
   * style block, which is narrower than what Nuxt inlines – so global CSS from `nuxt.config`, and
   * any stylesheet a `.css` import contributes to, keep their link.
   *
   * @default false
   */
  disableStylesheets?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'vitalizer',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    disablePrefetchLinks: 'dynamicImports',
    disablePreloadLinks: false,
    disableStylesheets: false,
  },
  setup(options, nuxt) {
    // Bail before the hook so that `nuxt prepare` and every dev start stay silent. `_prepare` is
    // private, but it is the only signal that this run is `nuxt prepare`.
    if (nuxt.options._prepare || nuxt.options.dev)
      return

    if (!options.disablePrefetchLinks && !options.disablePreloadLinks && !options.disableStylesheets)
      return

    const inlinedStylesheets = new Set<string>()

    if (options.disableStylesheets) {
      nuxt.hook('vite:extendConfig', (config, { isClient }) => {
        if (isClient)
          config.plugins?.push(collectInlinedStylesheets(inlinedStylesheets, nuxt.options.features.inlineStyles))
      })
    }

    nuxt.hook('build:manifest', (manifest) => {
      const isInlineStylesEnabled = Boolean(nuxt.options.features.inlineStyles)

      for (const entry of Object.values(manifest)) {
        stripResourceHints(entry, options, isInlineStylesEnabled, inlinedStylesheets)
      }

      useLogger(name).success('Optimized Web Vitals')
    })
  },
})
