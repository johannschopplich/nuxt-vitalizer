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
    const logger = useLogger(name)

    if (nuxt.options._prepare || nuxt.options.dev)
      return

    nuxt.hooks.hook('build:manifest', (manifest) => {
      for (const entry of Object.values(manifest)) {
        stripResourceHints(entry, options, Boolean(nuxt.options.features.inlineStyles))
      }
    })

    logger.success('Optimized Web Vitals')
  },
})
