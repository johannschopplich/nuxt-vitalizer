<script setup lang="ts">
import logo from './assets/logo.png'
</script>

<template>
  <div>
    <img :src="logo" alt="">
    <NuxtPage />
  </div>
</template>

<style scoped>
div {
  color: #333;
}
</style>
