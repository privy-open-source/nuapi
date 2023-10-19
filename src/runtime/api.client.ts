import {
  useRuntimeConfig,
  defineNuxtPlugin,
} from '#imports'
import {
  type ApiConfig,
  createApi,
  setApi,
} from '@privyid/nuapi/core'
import { joinURL } from 'ufo'

export default defineNuxtPlugin(() => {
  const config  = useRuntimeConfig()
  const host    = window.location.origin
  const baseURL = joinURL(host, config.app.baseURL)

  const options: ApiConfig = {
    baseURL,
    headers: {},
  }

  const instance = createApi(options)

  setApi(instance)

  return { provide: { api: instance } }
})
