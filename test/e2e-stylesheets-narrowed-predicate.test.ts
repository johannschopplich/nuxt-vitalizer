import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { headLinks } from './head-links'

describe('disableStylesheets (true) with a narrowed inline-styles predicate', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      features: {
        inlineStyles: (id?: string) => !!id && id.includes('.vue') && !id.includes('BaseCard'),
      },
      vitalizer: { disableStylesheets: true },
    },
  })

  it('keeps the stylesheet link of the excluded component', async () => {
    const html = await $fetch<string>('/')

    expect(headLinks(html).filter(link => link.rel === 'stylesheet')).toContainEqual(
      expect.objectContaining({ href: expect.stringContaining('BaseCard') }),
    )
    expect(html).not.toContain('.base-card')
  })
})
