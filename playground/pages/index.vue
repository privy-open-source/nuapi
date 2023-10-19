<template>
  <h1>Hello Index.vue</h1>
  <button @click="refresh()">
    Reload
  </button>
  <pre v-if="pending">Loading...</pre>
  <pre v-else>{{ data }}</pre>
</template>

<script setup>
import { useApi } from '@privyid/nuapi/core'
import { useAsyncData } from '#app'

const { data, refresh, pending } = await useAsyncData('users', async () => {
  const { data } = await useApi().get('/api/users')

  return data
},
)
</script>
