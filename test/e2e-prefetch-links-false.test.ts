import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { prefetched } from './head-links'

describe('disablePrefetchLinks false', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePrefetchLinks: false,
      },
    },
  })

  // Guards the reason the module exists: Nuxt still emits these on its own.
  it('renders a prefetch link for the chunk of the unmounted widget', async () => {
    const html = await $fetch<string>('/')

    expect(prefetched(html, 'script').length).toBeGreaterThan(0)
  })
})
