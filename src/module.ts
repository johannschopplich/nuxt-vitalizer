import { addComponent, addTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { genImport } from 'knitwork'
import { defu } from 'defu'
import { name } from '../package.json'

export interface ModuleOptions {
  /**
   * Whether to disable prefetching of dynamic imports and image assets to optimize the LCP score.
   *
   * @default true
   */
  disablePrefetching?: boolean

  /**
   * List of assets extensions that should not be prefetched.
   *
   * @default ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp']
   */
  assetExtensions?: string[]

  /**
   * Options for the `DelayHydration` component.
   */
  delayHydration?: {
    /**
     * Specify the events that should trigger hydration.
     *
     * @default ['mousemove', 'scroll', 'keydown', 'click', 'touchstart', 'wheel']
     */
    hydrateOnEvents?: (keyof WindowEventMap)[]
    /**
     * The maximum amount of time to wait in milliseconds when waiting for an idle callback. This is useful when there are a lot of network requests happening.
     *
     * @default 8000
     */
    idleCallbackTimeout?: number
    /**
     * Time to wait in milliseconds after the idle callback before hydrating the component.
     *
     * @default 4000
     */
    postIdleTimeout?: number
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'lcpSpeedup',
  },
  defaults: {
    disablePrefetching: true,
    assetExtensions: ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp'],
    delayHydration: {},
  },
  async setup(options, nuxt) {
    const moduleName = name
    const logger = useLogger(name)
    const { resolve } = createResolver(import.meta.url)

    // Merge default options
    options = defu(options, {
      delayHydration: {
        hydrateOnEvents: ['mousemove', 'scroll', 'keydown', 'click', 'touchstart', 'wheel'],
        idleCallbackTimeout: 8000,
        postIdleTimeout: 4000,
      },
    } satisfies ModuleOptions)

    // Transpile runtime
    nuxt.options.build.transpile.push(resolve('runtime'))

    // Add components
    await addComponent({
      name: 'DelayHydration',
      filePath: resolve('runtime/components/DelayHydration'),
    })
    await addComponent({
      name: 'SkipHydration',
      filePath: resolve('runtime/components/SkipHydration'),
    })

    // Pass options to runtime
    addTemplate({
      filename: `module/${moduleName}.mjs`,
      getContents() {
        return `
export const delayHydrationOptions = ${JSON.stringify(options.delayHydration, undefined, 2)}
`.trimStart()
      },
    })

    addTemplate({
      filename: `module/${moduleName}.d.ts`,
      getContents() {
        return `
${genImport(resolve('module'), ['ModuleOptions'])}
export declare const delayHydrationOptions: Required<Required<ModuleOptions>['delayHydration']>
`.trimStart()
      },
    })

    if (!nuxt.options._prepare && options.disablePrefetching) {
      nuxt.hooks.hook('build:manifest', (manifest) => {
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
    }
  },
})
