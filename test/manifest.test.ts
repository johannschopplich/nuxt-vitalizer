import type { ResourceMeta } from 'vue-bundle-renderer'
import { describe, expect, it } from 'vitest'
import { stripResourceHints } from '../src/manifest'

function entry(): ResourceMeta {
  return {
    file: 'entry.js',
    isEntry: true,
    dynamicImports: ['widget.js'],
    prefetch: true,
    preload: true,
  }
}

describe('stripResourceHints', () => {
  it('empties dynamicImports when disablePrefetchLinks is dynamicImports', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePrefetchLinks: 'dynamicImports' })

    expect(meta.dynamicImports).toEqual([])
  })

  it('keeps the prefetch flag when disablePrefetchLinks is dynamicImports', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePrefetchLinks: 'dynamicImports' })

    expect(meta.prefetch).toBe(true)
  })

  it('clears the prefetch flag when disablePrefetchLinks is true', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePrefetchLinks: true })

    expect(meta.prefetch).toBe(false)
    expect(meta.dynamicImports).toEqual([])
  })

  it('keeps dynamicImports when disablePrefetchLinks is false', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePrefetchLinks: false })

    expect(meta.dynamicImports).toEqual(['widget.js'])
    expect(meta.prefetch).toBe(true)
  })

  it('clears the preload flag when disablePreloadLinks is true', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePreloadLinks: true })

    expect(meta.preload).toBe(false)
  })

  it('keeps the preload flag when disablePreloadLinks is false', () => {
    const meta = entry()
    stripResourceHints(meta, { disablePreloadLinks: false })

    expect(meta.preload).toBe(true)
  })

  it('leaves the css of an entry untouched', () => {
    const meta: ResourceMeta = { ...entry(), css: ['entry.css'] }
    stripResourceHints(meta, { disablePrefetchLinks: true, disablePreloadLinks: true })

    expect(meta.css).toEqual(['entry.css'])
  })
})
