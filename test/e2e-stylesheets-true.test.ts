import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { headLinks, linkCounts } from './head-links'

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

  it('drops the stylesheet link of the shared chunk whose rules Nuxt inlined', () => {
    expect(stylesheets(html)).not.toContainEqual(expect.stringContaining('BaseCard'))
  })

  // Dropping the link is only safe because the same rules reach the page inlined. Without this the
  // suite would pass on a page that lost its styles.
  it('keeps the inlined styles of that shared chunk', () => {
    expect(html).toContain('.base-card')
  })

  // `vendor.css` arrives through a `.ts` module, which Nuxt's inline-styles pass never touches.
  it('keeps the stylesheet link of the shared chunk Nuxt did not inline', () => {
    expect(stylesheets(html)).toContainEqual(expect.stringContaining('vendor-widget'))
    expect(html).not.toContain('#f0f')
  })

  it('keeps the stylesheet link of the global CSS from `nuxt.config`', () => {
    expect(stylesheets(html)).toContainEqual(expect.stringContaining('entry'))
    expect(html).not.toContain('font-family:system-ui')
  })

  it('removes no other stylesheet link', () => {
    expect(stylesheets(html)).toHaveLength(2)
  })

  // Every number the README's matrix quotes for this row, so the table cannot drift from the build.
  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({ modulepreload: 4, prefetchScript: 0, prefetchImage: 1, stylesheet: 2 })
  })
})

function stylesheets(html: string): string[] {
  return headLinks(html).filter(link => link.rel === 'stylesheet').map(link => link.href)
}
