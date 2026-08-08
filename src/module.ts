import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { name, version } from '../package.json'
import { stripResourceHints } from './manifest'

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
   * prefetch set from the preload set. Their stylesheets keep their prefetch links.
   *
   * @default false
   */
  disablePreloadLinks?: boolean

  /**
   * Whether to remove the render-blocking stylesheet links whose styles Nuxt already inlined.
   *
   * @remarks
   * Only takes effect while `features.inlineStyles` is on, since the inlined styles are what makes
   * the links redundant. A chunk shared between two parents keeps its link either way, because
   * Nuxt cannot attribute its styles – that is the duplication this option removes.
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
    // `build:manifest` only fires for a real client bundle. `_prepare` is private, but it is the
    // only signal that this run is `nuxt prepare`.
    if (nuxt.options._prepare || nuxt.options.dev)
      return

    if (!options.disablePrefetchLinks && !options.disablePreloadLinks && !options.disableStylesheets)
      return

    nuxt.hook('build:manifest', (manifest) => {
      for (const entry of Object.values(manifest)) {
        stripResourceHints(entry, options, Boolean(nuxt.options.features.inlineStyles))
      }
    })

    useLogger(name).success('Optimized Web Vitals')
  },
})
