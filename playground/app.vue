<script setup lang="ts">
import { useServerHead } from '#imports'
import NuxtIcon from '~/assets/icon-green.svg'

useServerHead({
  title: 'Nuxt LCP Speedup',
  link: [
    { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css' },
  ],
})
</script>

<template>
  <header>
    <h1>Nuxt LCP Speedup</h1>
  </header>

  <h2>Images</h2>
  <img
    v-if="NuxtIcon"
    :src="NuxtIcon"
    alt="Nuxt icon"
    class="icon"
  >

  <h2>Delay Component Hydration</h2>
  <DelayHydration>
    <PlaygroundText />
  </DelayHydration>
</template>

<style>
.icon {
  width: 100px;
  height: 100px;
}
</style>
