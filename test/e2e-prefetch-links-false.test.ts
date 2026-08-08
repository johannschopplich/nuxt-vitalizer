import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { prefetched } from './head-links'

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

  // Guards the reason the module exists: Nuxt still emits these on its own. This also covers the
  // path where every option is off and the module never registers its hook.
  it('renders a prefetch link for the chunk of the unmounted cookie banner', () => {
    expect(prefetched(html, 'script').length).toBeGreaterThan(0)
  })
})
