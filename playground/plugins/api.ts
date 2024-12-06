import { defineNuxtPlugin } from '#app'
import { onRequest } from '@privyid/nuapi/core'

export default defineNuxtPlugin({
  dependsOn: ['nuapi:plugin'],
  setup () {
    onRequest((config) => {
      if (!config.headers.Authorization)
        config.headers.Authorization = 'Bearer 123456'

      return config
    })
  },
})
