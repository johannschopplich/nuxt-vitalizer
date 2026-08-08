<script setup lang="ts">
import { ref } from 'vue'

// The widget stays unmounted, so Nuxt renders a prefetch link for its chunk rather than a preload.
const isWidgetVisible = ref(false)
</script>

<template>
  <div>
    nuxt-vitalizer fixture
    <LazyHeavyWidget v-if="isWidgetVisible" />
  </div>
</template>
