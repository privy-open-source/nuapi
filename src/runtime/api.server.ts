import {
  useRuntimeConfig,
  useRequestEvent,
  useRequestHeaders,
  defineNuxtPlugin,
  useRequestURL,
} from '#imports'
import {
  type ApiConfig,
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

export default defineNuxtPlugin(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const event   = useRequestEvent()!
  const url     = useRequestURL()
  const config  = useRuntimeConfig()
  const headers = useRequestHeaders()

  let instance = event.$api

  if (!instance) {
    const origin  = url.origin
    const baseURL = joinURL(origin, config.app.baseURL)

    const options: ApiConfig = {
      baseURL,
      headers,
    }

    instance   = createApi(options)
    event.$api = instance
  }

  setApi(instance)

  return { provide: { api: instance } }
})
