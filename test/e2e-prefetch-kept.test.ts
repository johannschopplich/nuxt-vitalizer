import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks } from './head-links'

describe('disablePrefetchLinks off', async () => {
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
  it('renders a prefetch link for the unmounted widget', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'prefetch')).toBeGreaterThan(0)
  })
})
