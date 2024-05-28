import { defineNuxtModule, useLogger } from '@nuxt/kit'

export interface ModuleOptions {
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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-lcp-speedup',
    configKey: 'lcpSpeedup',
  },
  defaults: {
    enabled: true,
    assetExtensions: ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp'],
  },
  async setup(options, nuxt) {
    const logger = useLogger('nuxt-lcp-speedup')

    if (!options.enabled) {
      logger.info('LCP optimization is disabled')
      return
    }

    nuxt.hook('build:manifest', (manifest) => {
      for (const file of Object.values(manifest)) {
        // Remove all prefetch links from the manifest
        file.dynamicImports = []

        // Remove all prefetch assets from the manifest
        if (file.assets) {
          file.assets = file.assets.filter(
            asset => options.assetExtensions!.every(ext => !asset.endsWith(`.${ext}`)),
          )
        }
      }
    })

    logger.success('LCP is optimized for speed')
  },
})
