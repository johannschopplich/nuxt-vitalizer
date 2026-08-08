<script setup lang="ts">
import { vendorClass } from '../lib/vendor-widget'
</script>

<template>
  <div>
    <BaseCard>about</BaseCard>
    <FeatureList />
    <p :class="vendorClass">
      vendor
    </p>
  </div>
</template>
