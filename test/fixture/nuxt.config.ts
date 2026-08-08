import { defineNuxtConfig } from 'nuxt/config'
import NuxtVitalizer from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtVitalizer],

  compatibilityDate: '2026-01-01',
})
