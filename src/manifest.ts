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

  // Nuxt empties `css` for every chunk whose styles it inlined, but its pass keys on `src` – so a
  // chunk shared between two parents, which has none, keeps an array whose styles are on the page
  // twice. Chunks that do carry a `src` are Nuxt's to decide, and it keeps the ones it did not
  // inline: global CSS from `nuxt.config` lives on the entry and its link is the only copy.
  // See https://github.com/nuxt/nuxt/issues/35255
  if (options.disableStylesheets && isInlineStylesEnabled && entry.resourceType === 'script' && !entry.src) {
    entry.css = []
  }
}
