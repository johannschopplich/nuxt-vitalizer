import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { countLinks, prefetched } from './head-links'

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

  it('keeps the modulepreload links Nuxt renders', () => {
    expect(countLinks(html, 'modulepreload')).toBeGreaterThan(0)
  })

  // Nuxt inlines these styles as well, so this link is the duplication `disableStylesheets` removes.
  it('keeps the stylesheet link of the shared chunk', () => {
    expect(countLinks(html, 'stylesheet')).toBe(3)
    expect(html).toContain('.base-card')
  })
})
