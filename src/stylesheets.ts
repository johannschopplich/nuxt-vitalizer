import type { Plugin } from 'vite'

const CSS_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)(?:\?[^.]+)?$/
const QUERY_RE = /\?.*$/

/**
 * Records which emitted stylesheets hold nothing but Vue component styles.
 *
 * @remarks
 * Nuxt inlines a component's `<style>` block, and on top of that any `.css` the component imports
 * directly. Only the first is recognized here, so a stylesheet counts as inlined once every rule in
 * it comes out of a style block that `shouldInline` admits – narrower than Nuxt, and therefore wrong
 * only in the direction of keeping a link. Rollup records no sources for a stylesheet merged out of
 * several chunks, which is exactly the shared chunk this module cares about, so they are walked here
 * instead.
 *
 * @param inlined Receives the file name of every stylesheet Nuxt has a second, inlined copy of
 * @param shouldInline Nuxt's own `features.inlineStyles`, so that narrowing it narrows this too
 */
export function collectInlinedStylesheets(
  inlined: Set<string>,
  shouldInline: boolean | ((id?: string) => boolean),
): Plugin {
  return {
    name: 'vitalizer:inlined-stylesheets',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk')
          continue

        const stylesheets = chunk.viteMetadata?.importedCss
        if (!stylesheets?.size)
          continue

        const sources = new Set<string>()
        for (const moduleId of chunk.moduleIds) {
          if (CSS_RE.test(moduleId))
            sources.add(moduleId)

          // A component's style block is not a module of the chunk, only an import of one.
          for (const importedId of this.getModuleInfo(moduleId)?.importedIds ?? []) {
            if (CSS_RE.test(importedId))
              sources.add(importedId)
          }
        }

        const isFromVueAlone = sources.size > 0
          && [...sources].every((source) => {
            const moduleId = source.replace(QUERY_RE, '')
            return moduleId.endsWith('.vue')
              && (shouldInline === true || (typeof shouldInline === 'function' && shouldInline(moduleId)))
          })
        if (!isFromVueAlone)
          continue

        for (const stylesheet of stylesheets) {
          inlined.add(basename(stylesheet))
        }
      }
    },
  }
}

export function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}
