import {
  defineNuxtPlugin,
  useNuxtApp,
  useRequestEvent,
  useRequestHeaders,
  useRequestURL,
  useRuntimeConfig,
} from '#imports'
import {
  type ApiInstance,
  createApi,
  setApi,
  setResolver,
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
      instance = createApi({
        baseURL: joinURL(url.origin, config.app.baseURL),
        headers,
      })
    }

    if (import.meta.server) {
      if (event)
        event.$api = instance

      setResolver(() => useNuxtApp().$api)
    }

    setApi(instance)

    return { provide: { api: instance } }
  },
})
