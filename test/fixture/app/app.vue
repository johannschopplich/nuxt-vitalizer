<script setup lang="ts">
import { ref } from 'vue'
import logo from './assets/logo.png'

// The widget stays unmounted, so Nuxt renders a prefetch link for its chunk rather than a preload.
const isWidgetVisible = ref(false)
</script>

<template>
  <div>
    nuxt-vitalizer fixture
    <img :src="logo" alt="">
    <LazyHeavyWidget v-if="isWidgetVisible" />
  </div>
</template>
