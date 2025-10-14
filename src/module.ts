import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { name } from '../package.json'

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
    configKey: 'vitalizer',
  },
  defaults: {
    disablePrefetchLinks: 'dynamicImports',
    disablePreloadLinks: false,
    disableStylesheets: false,
  },
  async setup(options, nuxt) {
    const logger = useLogger(name)

    if (nuxt.options._prepare || nuxt.options.dev)
      return

    nuxt.hooks.hook('build:manifest', (manifest) => {
      for (const item of Object.values(manifest)) {
        if (options.disablePrefetchLinks) {
          item.dynamicImports = []
        }

        if (options.disablePrefetchLinks === true) {
          item.prefetch = false
        }

        if (options.disablePreloadLinks) {
          item.preload = false
        }

        if (nuxt.options.features.inlineStyles) {
          if (options.disableStylesheets === 'entry' && item.isEntry && item.css) {
            // Start from the end of the array and work backwards
            for (let i = item.css.length - 1; i >= 0; i--) {
              if (item.css[i]?.startsWith('entry')) {
                item.css.splice(i, 1)
              }
            }
          }
          else if (options.disableStylesheets && item.resourceType === 'script') {
            item.css = []
          }
        }
      }
    })

    logger.success('Optimized Web Vitals')
  },
})
