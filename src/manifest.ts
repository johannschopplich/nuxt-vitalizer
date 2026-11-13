import type { ResourceMeta } from 'vue-bundle-renderer'
import type { ModuleOptions } from './module'
import { basename } from './stylesheets'

/**
 * Strips the resource hints the options disable from one manifest entry.
 *
 * @returns Whether the entry changed
 */
export function stripResourceHints(
  entry: ResourceMeta,
  options: ModuleOptions,
  isInlineStylesEnabled: boolean,
  inlinedStylesheets: ReadonlySet<string>,
): boolean {
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

  // Nuxt empties `css` for every chunk whose styles it inlined, but the map it looks the sources up
  // in is keyed by `src` – so a chunk shared between two parents, which has none, keeps an array
  // whose rules are on the page twice. Chunks that do carry a `src` are Nuxt's to decide.
  // See https://github.com/nuxt/nuxt/issues/35255
  if (options.disableStylesheets && isInlineStylesEnabled && entry.resourceType === 'script' && !entry.src && entry.css) {
    const stylesheets = entry.css.filter(stylesheet => !inlinedStylesheets.has(basename(stylesheet)))
    if (stylesheets.length < entry.css.length) {
      entry.css = stylesheets
      isChanged = true
    }
  }

  return isChanged
}
