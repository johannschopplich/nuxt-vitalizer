import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks } from './head-links'

describe('disablePreloadLinks on', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disablePreloadLinks: true,
      },
    },
  })

  it('renders no modulepreload link', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'modulepreload')).toBe(0)
  })

  it('renders no preload link', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'preload')).toBe(0)
  })
})
