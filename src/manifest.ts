import type { ResourceMeta } from 'vue-bundle-renderer'
import type { ModuleOptions } from './module'

export function stripResourceHints(
  entry: ResourceMeta,
  options: ModuleOptions,
  isInlineStylesEnabled: boolean,
): void {
  // `vue-bundle-renderer` derives the prefetch set from `dynamicImports`, then keeps whatever still
  // carries its own `prefetch` flag – which is how images survive clearing the dynamic imports.
  if (options.disablePrefetchLinks === true) {
    entry.prefetch = false
  }

  if (options.disablePrefetchLinks && entry.dynamicImports?.length) {
    entry.dynamicImports = []
  }

  if (options.disablePreloadLinks) {
    entry.preload = false
  }

  // Nuxt empties `css` for every chunk whose styles it inlined. A chunk shared between two parents
  // has no `src`, so Nuxt cannot attribute its styles and leaves the array behind – even though the
  // styles reach the page inlined as well. See https://github.com/nuxt/nuxt/issues/35255
  if (options.disableStylesheets && isInlineStylesEnabled && entry.resourceType === 'script') {
    entry.css = []
  }
}
