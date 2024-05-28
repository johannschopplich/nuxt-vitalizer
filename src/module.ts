import { defineNuxtModule, useLogger } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Enable or disable the module.
   *
   * @default true
   */
  enabled?: boolean
  /**
   * Determines which prefetch links should be rendered in the HTML.
   *
   * @default 'none'
   */
  prefetchLinks?: 'none' | 'exceptImages'
  /**
   * List of image extensions to remove from the manifest.
   *
   * @default ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp']
   */
  imageExtensions?: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-lcp-speedup',
    configKey: 'lcpSpeedup',
  },
  defaults: {
    enabled: true,
    prefetchLinks: 'none',
    imageExtensions: ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp'],
  },
  async setup(options, nuxt) {
    const logger = useLogger('nuxt-lcp-speedup')

    if (!options.enabled) {
      logger.info('LCP optimization is disabled')
      return
    }

    nuxt.hook('build:manifest', (manifest) => {
      for (const key in manifest) {
        const file = manifest[key]

        if (options.prefetchLinks === 'none') {
          // Remove all prefetch links from the manifest
          file.dynamicImports = []
        }
        else if (options.prefetchLinks === 'exceptImages') {
          if (file.assets) {
            file.assets = file.assets.filter(
              asset => options.imageExtensions!.every(ext => !asset.endsWith(`.${ext}`)),
            )
          }
        }
      }
    })

    logger.success('LCP is optimized for speed')
  },
})
