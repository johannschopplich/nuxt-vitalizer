import type { Plugin } from 'vite'

const CSS_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)(?:\?[^.]+)?$/
const QUERY_RE = /\?.*$/

/**
 * Records which emitted stylesheets hold nothing but Vue component styles.
 *
 * @remarks
 * Nuxt inlines the `<style>` block of a Vue component and nothing else – its `inBundle` predicate
 * is `isVue(moduleId) || isEntry`. So a stylesheet whose rules all come from Vue components is
 * inlined a second time into the HTML, and one with any other source reaches the page through its
 * link alone. Rollup does not record that for a stylesheet merged out of several chunks, which is
 * exactly the shared chunk this module cares about, so the sources are walked here instead.
 */
export function collectInlinedStylesheets(inlined: Set<string>): Plugin {
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
          && [...sources].every(source => source.replace(QUERY_RE, '').endsWith('.vue'))
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
