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

  // Proves Nuxt emits these unaided, so the zeros in the other suites mean something. This is also
  // the state in which the module registers no hook at all.
  it('renders a prefetch link for the chunk of the unmounted cookie banner', () => {
    expect(prefetched(html, 'script')).toHaveLength(2)
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({ modulepreload: 4, prefetchScript: 2, prefetchImage: 1, stylesheet: 3 })
  })
})
