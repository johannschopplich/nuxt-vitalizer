import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { headLinks } from './head-links'

describe('disableStylesheets (true) without inline styles', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      features: {
        inlineStyles: false,
      },
      vitalizer: {
        disableStylesheets: true,
      },
    },
  })

  // Nothing is inlined here, so every link is the only copy of its rules and the option is inert.
  it('keeps the stylesheet link of the shared chunk', async () => {
    const html = await $fetch<string>('/')

    expect(headLinks(html).filter(link => link.rel === 'stylesheet')).toContainEqual(
      expect.objectContaining({ href: expect.stringContaining('BaseCard') }),
    )
    expect(html).not.toContain('.base-card')
  })
})
