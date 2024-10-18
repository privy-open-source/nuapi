import { createLazyton } from './instance'

/**
 * Use global api instance
 * @example
 * let api = useApi()
 *
 * api.get('/some/endpoint')
 */
export const useApi = createLazyton({}, true)

/**
 * Set global api instance
 * @param instance
 */
export const setApi = useApi.setApi
