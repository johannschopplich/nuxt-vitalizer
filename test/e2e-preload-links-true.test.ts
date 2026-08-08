import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { countLinks, linkCounts, prefetched } from './head-links'

describe('disablePreloadLinks (true)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePrefetchLinks: false,
        disablePreloadLinks: true,
      },
    },
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('renders no modulepreload link', () => {
    expect(countLinks(html, 'modulepreload')).toBe(0)
  })

  it('still renders the entry script tag', () => {
    expect(html).toContain('<script type="module"')
  })

  it('drops the prefetch link of the unmounted cookie banner along with the preload set', () => {
    expect(prefetched(html, 'script')).toHaveLength(0)
  })

  // The image is never a preload, so nothing about it is derived from the preload set.
  it('keeps the prefetch link for the image', () => {
    expect(prefetched(html, 'image')).toHaveLength(1)
  })

  // A stylesheet carries a preload flag too, but the render-blocking link is not derived from it.
  it('keeps every stylesheet link', () => {
    expect(countLinks(html, 'stylesheet')).toBe(3)
  })

  // The stylesheet of a dynamically imported chunk enters the prefetch set through `dynamicDeps`,
  // which the preload set has no say over – unlike the chunk's own script.
  it('keeps the prefetch link for the stylesheet of a dynamically imported chunk', async () => {
    const contact = await $fetch<string>('/contact')

    expect(prefetched(contact, 'style')).toContainEqual(
      expect.objectContaining({ href: expect.stringContaining('lazy-widget') }),
    )
    expect(prefetched(contact, 'script')).toHaveLength(0)
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({ modulepreload: 0, prefetchScript: 0, prefetchImage: 1, stylesheet: 3 })
  })
})
