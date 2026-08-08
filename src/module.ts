import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { name, version } from '../package.json'
import { stripResourceHints } from './manifest'

export interface ModuleOptions {
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
   * @remarks
   * This will also remove `modulepreload` links, which can help reduce the number of early requests in large applications.
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
