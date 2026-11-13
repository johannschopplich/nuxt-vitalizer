import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { headLinks, linkCounts, prefetched } from './head-links'

describe('default options', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('renders no prefetch link for the chunk of the unmounted cookie banner', () => {
    expect(prefetched(html, 'script')).toHaveLength(0)
  })

  it('renders a prefetch link for the image the page imports', () => {
    expect(prefetched(html, 'image')).toHaveLength(1)
  })

  it('inlines the shared chunk styles without a stylesheet link', () => {
    expect(html).toContain('.base-card')
    expect(headLinks(html).filter(link => link.rel === 'stylesheet')).not.toContainEqual(
      expect.objectContaining({
        href: expect.stringContaining('BaseCard'),
      }),
    )
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({
      modulepreload: 4,
      prefetchScript: 0,
      prefetchImage: 1,
      stylesheet: 2,
    })
  })
})
