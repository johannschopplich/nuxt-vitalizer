import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { countLinks, linkCounts, prefetched } from './head-links'

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

  it('serves the shared chunk styles both inlined and as a link', () => {
    expect(html).toContain('.base-card')
    expect(countLinks(html, 'stylesheet')).toBe(3)
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({ modulepreload: 4, prefetchScript: 0, prefetchImage: 1, stylesheet: 3 })
  })
})
