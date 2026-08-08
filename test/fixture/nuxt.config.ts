import { defineNuxtConfig } from 'nuxt/config'
import NuxtVitalizer from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtVitalizer],

  css: ['~/assets/global.css'],

  compatibilityDate: '2026-01-01',
})
