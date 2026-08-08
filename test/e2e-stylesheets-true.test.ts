import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { headLinks } from './head-links'

describe('disableStylesheets (true)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      vitalizer: {
        disableStylesheets: true,
      },
    },
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('drops the stylesheet link of the shared chunk', () => {
    expect(stylesheets(html)).not.toContain('BaseCard')
  })

  // Dropping the link is only safe because the same rules reach the page inlined. Without this the
  // suite would pass on a page that lost its styles.
  it('keeps the inlined styles of the shared chunk', () => {
    expect(html).toContain('.base-card')
  })

  it('keeps the stylesheet link of the global CSS, which Nuxt never inlined', () => {
    expect(stylesheets(html)).toEqual([expect.stringContaining('entry')])
    expect(html).not.toContain('font-family:system-ui')
  })
})

function stylesheets(html: string): string[] {
  return headLinks(html).filter(link => link.rel === 'stylesheet').map(link => link.href)
}
