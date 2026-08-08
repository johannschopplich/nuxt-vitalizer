import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks } from './head-links'

describe('disablePrefetchLinks true', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePrefetchLinks: true,
      },
    },
  })

  // The default mode leaves this one standing, which is the whole difference between the two.
  it('renders no prefetch link for the image the page imports', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'prefetch')).toBe(0)
  })
})
