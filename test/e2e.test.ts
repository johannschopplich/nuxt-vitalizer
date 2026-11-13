import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { beforeAll, describe, expect, it } from 'vitest'
import { linkCounts } from './head-links'

describe('default options', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
  })

  let html: string

  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('renders the link counts the README states', () => {
    expect(linkCounts(html)).toEqual({
      modulepreload: 4,
      prefetchScript: 0,
      prefetchImage: 1,
      stylesheet: 2,
    })
  })
})
