import { defineNuxtModule, useLogger } from '@nuxt/kit'

export interface ModuleOptions {
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
  prefetchStrategy?: 'none' | 'excludeImages'
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
    prefetchStrategy: 'none',
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

        if (options.prefetchStrategy === 'none') {
          // Remove all prefetch links, since they impact LCP negatively
          file.dynamicImports = []
        }
        else if (options.prefetchStrategy === 'excludeImages') {
          if (file.assets) {
            file.assets = file.assets.filter(
              asset => options.imageExtensions.every(ext => !asset.endsWith(`.${ext}`)),
            )
          }
        }
      }
    })

    logger.success('LCP is optimized for speed')
  },
})
