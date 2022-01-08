<template>
  <router-view></router-view>
</template>

<script lang="ts">
const cache = new Map()

export default {
  name: 'App',
  provide: {
    cacheProvider: () => cache
  }
}
</script>