import { createLazyton } from './instance'
import type { ApiResolver } from './types'

let $resolver: ApiResolver

export function setResolver (resolver: ApiResolver) {
  $resolver = resolver
}

const getApi = createLazyton({}, true)

/**
 * Set global api instance
 * @param instance
 */
export const setApi = getApi.setApi

/**
 * Use global api instance
 * @example
 * let api = useApi()
 *
 * api.get('/some/endpoint')
 */
export const useApi = () => {
  return $resolver
    ? $resolver()
    : getApi()
}
