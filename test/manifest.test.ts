import { describe, expect, it } from 'vitest'
import { stripResourceHints } from '../src/manifest'

describe('stripResourceHints', () => {
  it('returns false for an entry it leaves unchanged', () => {
    const entry = { file: 'entry.js', resourceType: 'script' as const }

    expect(stripResourceHints(entry, { disablePrefetchLinks: 'dynamicImports' }, true, new Set())).toBe(false)
  })

  it('returns true once it clears the dynamic imports', () => {
    const entry = {
      file: 'entry.js',
      resourceType: 'script' as const,
      dynamicImports: ['CookieBanner.vue'],
    }

    expect(stripResourceHints(entry, { disablePrefetchLinks: 'dynamicImports' }, true, new Set())).toBe(true)
  })
})
