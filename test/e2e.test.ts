import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { countLinks } from './head-links'

describe('default options', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
  })

  it('renders no prefetch link for the unmounted widget', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'prefetch')).toBe(0)
  })

  it('renders the modulepreload links of the current page', async () => {
    const html = await $fetch<string>('/')

    expect(countLinks(html, 'modulepreload')).toBeGreaterThan(0)
  })
})
