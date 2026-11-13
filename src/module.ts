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
   * Whether to remove `modulepreload` links from the HTML.
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
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'vitalizer',
    compatibility: {
      nuxt: '>=4.6.0',
    },
  },
  defaults: {
    disablePrefetchLinks: 'dynamicImports',
    disablePreloadLinks: false,
  },
  setup(options, nuxt) {
    if ('disableStylesheets' in options)
      useLogger(name).warn('`disableStylesheets` has been removed: Nuxt 4.6 fixed the duplicate stylesheet links it worked around (https://github.com/nuxt/nuxt/issues/35255). Delete it from your `vitalizer` options.')

    // Leaves the dev manifest as Nuxt builds it, so `nuxt dev` renders every hint.
    if (nuxt.options.dev)
      return

    if (!options.disablePrefetchLinks && !options.disablePreloadLinks)
      return

    nuxt.hook('build:manifest', (manifest) => {
      let isManifestChanged = false

      for (const entry of Object.values(manifest)) {
        if (stripResourceHints(entry, options))
          isManifestChanged = true
      }

      if (isManifestChanged)
        useLogger(name).success('Optimized Web Vitals')
    })
  },
})
