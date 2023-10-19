import {
  useRuntimeConfig,
  useRequestEvent,
  defineNuxtPlugin,
} from '#imports'
import {
  type ApiConfig,
  type ApiInstance,
  createApi,
  setApi,
} from '@privyid/nuapi/core'
import getURL from 'requrl'
import { joinURL } from 'ufo'

declare module 'h3' {
  interface H3Event {
    $api?: ApiInstance,
  }
}

export default defineNuxtPlugin(() => {
  const event  = useRequestEvent()
  const config = useRuntimeConfig()

  let instance = event.$api

  if (!instance) {
    const host    = getURL(event?.node?.req)
    const baseURL = joinURL(host, config.app.baseURL)

    const options: ApiConfig = {
      baseURL,
      headers: { 'accept-encoding': 'gzip, deflate' },
    }

    instance   = createApi(options)
    event.$api = instance
  }

  setApi(instance)

  return { provide: { api: instance } }
})
