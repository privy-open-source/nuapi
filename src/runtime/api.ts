import {
  defineNuxtPlugin,
  useRequestEvent,
  useRequestHeaders,
  useRequestURL,
  useRuntimeConfig,
} from '#imports'
import {
  type ApiInstance,
  createApi,
  setApi,
} from '@privyid/nuapi/core'
import { joinURL } from 'ufo'

declare module 'h3' {
  interface H3Event {
    $api?: ApiInstance,
  }
}

export default defineNuxtPlugin({
  name   : 'nuapi:plugin',
  enforce: 'pre',
  setup () {
    const event   = useRequestEvent()
    const url     = useRequestURL()
    const config  = useRuntimeConfig()
    const headers = useRequestHeaders()

    let instance = event?.$api

    if (!instance) {
      const origin  = url.origin
      const baseURL = joinURL(origin, config.app.baseURL)

      instance = createApi({
        baseURL,
        headers,
      })

      if (event)
        event.$api = instance
    }

    setApi(instance)

    return { provide: { api: instance } }
  },
})
