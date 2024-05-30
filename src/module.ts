import { addComponent, addTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { genImport } from 'knitwork'
import { defu } from 'defu'
import { name } from '../package.json'

export interface ModuleOptions {
  /**
   * Whether to remove prefetch links from the HTML. If set to `dynamicImports`, only dynamic imports will be removed. To disable all prefetching, set to `true`.
   *
   * @remarks
   * This will prevent the browser from downloading chunks that may not be needed yet. This can be useful for improving the LCP (Largest Contentful Paint) score.
   *
   * @default 'dynamicImports'
   */
  disablePrefetchLinks?: boolean | 'dynamicImports'

  /**
   * Whether to remove the render-blocking `entry.<hash>.css` stylesheet from the HTML. Especially useful when styles are inlined during SSR rendering.
   *
   * @remarks
   * This requires to have the Nuxt `inlineStyles` feature enabled. Make sure to test your application after enabling this option.
   *
   * @default false
   */
  disableEntryStylesheet?: boolean

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
    disablePrefetchLinks: 'dynamicImports',
    disableEntryStylesheet: false,
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

    if (nuxt.options._prepare || nuxt.options.dev) return

    nuxt.hooks.hook('build:manifest', (manifest) => {
      for (const item of Object.values(manifest)) {
        if (options.disablePrefetchLinks) {
          item.dynamicImports = []
        }

        if (options.disablePrefetchLinks === true) {
          item.prefetch = false
        }

        if (options.disableEntryStylesheet && nuxt.options.features.inlineStyles && item.isEntry && item.css) {
          // Start from the end of the array and work backwards
          for (let i = item.css.length - 1; i >= 0; i--) {
            if (item.css[i].startsWith('entry')) {
              item.css.splice(i, 1)
            }
          }
        }
      }
    })

    logger.success('Optimized LCP score')
  },
})
