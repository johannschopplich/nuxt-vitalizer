import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { countLinks, linkCounts } from './head-links'

describe('disablePrefetchLinks (true)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePrefetchLinks: true,
      },
    },
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  // The default mode leaves the image standing, which is the whole difference between the two.
  it('renders no prefetch link at all', () => {
    expect(countLinks(html, 'prefetch')).toBe(0)
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({ modulepreload: 4, prefetchScript: 0, prefetchImage: 0, stylesheet: 3 })
  })
})
