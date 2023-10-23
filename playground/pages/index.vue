<template>
  <h1>Hello Index.vue</h1>
  <button @click="refresh()">
    Reload
  </button>
  <button @click="register()">
    Register
  </button>
  <pre v-if="pending">Loading...</pre>
  <pre v-else>{{ data }}</pre>
  <pre v-if="error">{{ error }}</pre>
</template>

<script setup>
import { getUser } from '~/api/coba'
import { useAsyncData } from '#app'
import { useApi } from '@privyid/nuapi/core'

const { data, refresh, pending, error } = await useAsyncData('users', async () => {
  const { data } = await getUser({ requestId: 'get-user' })

  return data
})

function register () {
  const form = new FormData()

  form.append('email', 'eve.holt@reqres.in')
  form.append('password', 'pistol')

  useApi().post('/api/regi', form)
}
</script>
