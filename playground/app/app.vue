<script setup lang="ts">
import { useHead } from '#imports'
import NuxtIcon from '~/assets/icon-green.svg'

if (import.meta.server) {
  useHead({
    title: 'Nuxt Vitalizer',
    link: [
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css' },
    ],
  })
}
</script>

<template>
  <header>
    <h1>Nuxt Vitalizer</h1>
  </header>

  <h2>Images</h2>
  <img
    v-if="NuxtIcon"
    :src="NuxtIcon"
    alt="Nuxt icon"
    class="icon"
  >
</template>

<style>
.icon {
  width: 100px;
  height: 100px;
}
</style>
