<template>
  <div>
    Nuxt module playground!
    <pre>{{ users }}</pre>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useApi } from '../src/core'

const users = ref([])

onMounted(async () => {
  const { data } = await useApi().get('https://reqres.in/api/users')

  users.value = data
})
</script>
