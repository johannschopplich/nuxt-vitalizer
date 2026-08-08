import type { ResourceMeta } from 'vue-bundle-renderer'
import type { ModuleOptions } from './module'

export function stripResourceHints(
  entry: ResourceMeta,
  options: ModuleOptions,
  isInlineStylesEnabled: boolean,
): void {
  // `vue-bundle-renderer` builds the prefetch set out of `dynamicImports` and then keeps only the
  // resources whose `prefetch` flag is set, so the two modes need different edits.
  if (options.disablePrefetchLinks === true) {
    entry.prefetch = false
    entry.dynamicImports = []
  }
  else if (options.disablePrefetchLinks === 'dynamicImports') {
    if (entry.dynamicImports?.length)
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
