import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { linkCounts, prefetched } from './head-links'

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

  it('still renders the entry script tag', () => {
    expect(html).toContain('<script type="module"')
  })

  // It enters the prefetch set through `dynamicDeps`, which the preload set has no say over.
  it('keeps the prefetch link for the stylesheet of a dynamically imported chunk', async () => {
    const contact = await $fetch<string>('/contact')

    expect(prefetched(contact, 'style')).toContainEqual(
      expect.objectContaining({
        href: expect.stringContaining('lazy-widget'),
      }),
    )
    expect(prefetched(contact, 'script')).toHaveLength(0)
  })

  // An image carries no preload flag, and a stylesheet's render-blocking link ignores the one it
  // carries, so neither count follows the preload set.
  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({
      modulepreload: 0,
      prefetchScript: 0,
      prefetchImage: 1,
      stylesheet: 2,
    })
  })
})
