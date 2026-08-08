<script setup lang="ts">
import { ref } from 'vue'
import { vendorClass } from '../lib/vendor-widget'

const hasConsent = ref(true)
</script>

<template>
  <div>
    <BaseCard>home</BaseCard>
    <PricingSection />
    <p :class="vendorClass">
      vendor
    </p>
    <LazyCookieBanner v-if="!hasConsent" />
  </div>
</template>
