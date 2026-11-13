import type { ResourceMeta } from 'vue-bundle-renderer'
import type { ModuleOptions } from './module'

/** @returns Whether the entry changed */
export function stripResourceHints(entry: ResourceMeta, options: ModuleOptions): boolean {
  let isChanged = false

  // `vue-bundle-renderer` builds the prefetch set from two sources: a walk of `dynamicImports`, and
  // the static `css`, `assets` and `imports` of the page's own chunks. Clearing the dynamic imports
  // empties the first – the image survives because it arrives through the second, as a static asset
  // of the entry.
  if (options.disablePrefetchLinks === true && entry.prefetch) {
    entry.prefetch = false
    isChanged = true
  }

  if (options.disablePrefetchLinks && entry.dynamicImports?.length) {
    entry.dynamicImports = []
    isChanged = true
  }

  if (options.disablePreloadLinks && entry.preload) {
    entry.preload = false
    isChanged = true
  }

  return isChanged
}
