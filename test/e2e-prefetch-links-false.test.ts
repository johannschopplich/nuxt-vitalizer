import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { linkCounts, prefetched } from './head-links'

describe('disablePrefetchLinks (false)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePrefetchLinks: false,
      },
    },
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  // Proves Nuxt prefetches the banner chunk unaided, so the script prefetch zeros in the other suites
  // mean something.
  it('renders a prefetch link for the chunk of the unmounted cookie banner', async () => {
    const chunks = await Promise.all(prefetched(html, 'script').map(link => $fetch<string>(link.href)))

    expect(chunks).toContainEqual(expect.stringContaining('CookieBanner'))
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({
      modulepreload: 4,
      prefetchScript: 3,
      prefetchImage: 1,
      stylesheet: 2,
    })
  })
})
