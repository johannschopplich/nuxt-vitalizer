import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { countLinks } from './head-links'

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

  it('renders no stylesheet link for the shared chunk', () => {
    expect(countLinks(html, 'stylesheet')).toBe(0)
  })

  // Removing the link is only safe because the same rules reach the page inlined. Without this the
  // suite would pass on a page that lost its styles.
  it('keeps the inlined styles of the shared chunk', () => {
    expect(html).toContain('.base-card')
  })
})
