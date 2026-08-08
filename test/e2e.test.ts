import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks, prefetched } from './head-links'

describe('default options', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
  })

  it('renders no prefetch link for the chunk of the unmounted widget', async () => {
    const html = await $fetch<string>('/')

    expect(prefetched(html, 'script')).toHaveLength(0)
  })

  it('renders a prefetch link for the image the page imports', async () => {
    const html = await $fetch<string>('/')

    expect(prefetched(html, 'image')).toHaveLength(1)
  })

  it('keeps the modulepreload links Nuxt renders', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'modulepreload')).toBeGreaterThan(0)
  })
})
