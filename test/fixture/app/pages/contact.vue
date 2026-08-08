<script setup lang="ts">
import { ref } from 'vue'
import { vendorClass } from '../lib/vendor-widget'

const widgetClass = ref('')

async function loadWidget() {
  const { lazyWidgetClass } = await import('../lib/lazy-widget')
  widgetClass.value = lazyWidgetClass
}
</script>

<template>
  <div>
    <p :class="vendorClass">
      vendor
    </p>
    <button type="button" :class="widgetClass" @click="loadWidget">
      load
    </button>
  </div>
</template>
