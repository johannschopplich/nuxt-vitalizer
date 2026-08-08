import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks, prefetched } from './head-links'

describe('disablePreloadLinks true', async () => {
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

  it('renders no modulepreload link', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'modulepreload')).toBe(0)
  })

  it('still renders the entry script tag', async () => {
    const html = await $fetch<string>('/')

    expect(html).toContain('<script type="module"')
  })

  // Nuxt derives the prefetch set from the preload set, so this option reaches further than its
  // name says – even with `disablePrefetchLinks` off.
  it('drops the prefetch link of the unmounted widget along with the preload set', async () => {
    const html = await $fetch<string>('/')

    expect(prefetched(html, 'script')).toHaveLength(0)
  })

  it('keeps the prefetch link for the image, which is not a preload', async () => {
    const html = await $fetch<string>('/')

    expect(prefetched(html, 'image')).toHaveLength(1)
  })
})
