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

  if (isInlineStylesEnabled) {
    if (options.disableStylesheets === 'entry' && entry.isEntry && entry.css) {
      // Start from the end of the array and work backwards
      for (let i = entry.css.length - 1; i >= 0; i--) {
        if (entry.css[i]?.startsWith('entry')) {
          entry.css.splice(i, 1)
        }
      }
    }
    else if (options.disableStylesheets && entry.resourceType === 'script') {
      entry.css = []
    }
  }
}
