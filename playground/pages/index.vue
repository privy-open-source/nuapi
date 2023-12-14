<template>
  <h1>Hello Index.vue</h1>
  <button @click="refresh()">
    Reload
  </button>
  <button
    :disabled="!file"
    @click="register()">
    Register
  </button>
  <input
    type="file"
    accept="image/*"
    @change="onChange">
  <img :src="preview">
  <pre v-if="pending">Loading...</pre>
  <pre v-else>{{ data }}</pre>
  <pre v-if="error">{{ error }}</pre>
</template>

<script setup lang="ts">
import { getUser } from '~/api/coba'
import { useAsyncData } from '#app'
import { ref, watchEffect } from 'vue-demi'
import { useApi } from '@privyid/nuapi/core'

const file    = ref()
const preview = ref()

const { data, refresh, pending, error } = await useAsyncData('users', async () => {
  const { data } = await getUser({ requestId: 'get-user' })

  return data
})

function onChange (event: InputEvent) {
  const target = event.target as HTMLInputElement
  const files  = target.files

  if (files)
    file.value = files[0]
}

function register () {
  const form = new FormData()

  form.append('email', 'eve.holt@reqres.in')
  form.append('password', 'pistol')

  useApi().post('/api/regi', form)
}

watchEffect((onCleanup) => {
  if (file.value) {
    const url = URL.createObjectURL(file.value)

    onCleanup(() => {
      URL.revokeObjectURL(url)
    })

    preview.value = url
  }
})
</script>
