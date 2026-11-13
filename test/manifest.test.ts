import { describe, expect, it } from 'vitest'
import { stripResourceHints } from '../src/manifest'

describe('stripResourceHints', () => {
  it('returns false for an entry it leaves unchanged', () => {
    const entry = { file: 'entry.js', resourceType: 'script' as const }

    expect(stripResourceHints(entry, { disablePrefetchLinks: true, disablePreloadLinks: true })).toBe(false)
  })
})
