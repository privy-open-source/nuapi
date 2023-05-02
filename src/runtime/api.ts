import {
  useRuntimeConfig,
  useRequestEvent,
  defineNuxtPlugin,
} from '#imports'
import {
  type ApiConfig,
  createApi,
  setApi,
} from '@privyid/nuapi/core'
import getURL from 'requrl'
import { joinURL } from 'ufo'

export default defineNuxtPlugin(() => {
  const event   = useRequestEvent()
  const config  = useRuntimeConfig()
  const host    = getURL(event?.node?.req)
  const baseURL = joinURL(host, config.app.baseURL)

  const options: ApiConfig = {
    baseURL,
    headers: {},
  }

  if (process.server && options.headers) {
    // Don't accept brotli encoding because Node can't parse it
    options.headers['accept-encoding'] = 'gzip, deflate'
  }

  const instance = createApi(options)

  setApi(instance)

  return { provide: { api: instance } }
})
