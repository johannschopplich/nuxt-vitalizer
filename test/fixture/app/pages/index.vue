<script setup lang="ts">
import { ref } from 'vue'

const hasConsent = ref(true)
</script>

<template>
  <div>
    <BaseCard>home</BaseCard>
    <PricingSection />
    <LazyCookieBanner v-if="!hasConsent" />
  </div>
</template>
