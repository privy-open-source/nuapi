import { defineNuxtPlugin } from '#app'
import { getUser } from '../api/coba'

export default defineNuxtPlugin(async () => {
  await getUser()
})
