import { useApi } from './global'
import type {
  ApiInstance,
  ErrorHook,
  Hooks,
  HooksMap,
  RequestHook,
  ResponseHook,
} from './types'

/**
 * Add global on-request handler
 * @param fn handler
 */
export function onRequest (fn: RequestHook): number
/**
 * Add on-request handler to instance
 * @param fn handler
 * @param instance target instance
 */
export function onRequest (fn: RequestHook, instance: ApiInstance): number
export function onRequest (fn: RequestHook, instance = useApi()) {
  return addHook('onRequest', fn, instance)
}

/**
 * Add global on-response handler
 * @param fn handler
 */
export function onResponse (fn: ResponseHook): number
/**
 * Add on-response handler to instance
 * @param fn handler
 * @param instance target instance
 */
export function onResponse (fn: ResponseHook, instance: ApiInstance): number
export function onResponse (fn: ResponseHook, instance = useApi()) {
  return addHook('onResponse', fn, instance)
}

/**
 * Add global on-request-error
 * @param fn handler
 */
export function onRequestError (fn: ErrorHook): number
/**
 * Add on-request-error to instance
 * @param fn handler
 * @param instance instance
 */
export function onRequestError (fn: ErrorHook, instance: ApiInstance): number
export function onRequestError (fn: ErrorHook, instance = useApi()) {
  return addHook('onRequestError', fn, instance)
}

/**
 * Add global on-response-error handler.
 * @param fn
 */
export function onResponseError (fn: ErrorHook): number
/**
 * Add on-response-error handler to instance.
 * @param fn handler
 * @param instance target instance
 */
export function onResponseError (fn: ErrorHook, instance: ApiInstance): number
export function onResponseError (fn: ErrorHook, instance = useApi()) {
  return addHook('onResponseError', fn, instance)
}

/**
 * Add hook to global instance
 * @param name event name
 * @param fn handler
 */
export function addHook<K extends keyof Hooks> (name: K, fn: Hooks[K]): number | undefined
/**
 * Add hook to instance
 * @param name event name
 * @param fn handler
 * @param instance target instance
 */
export function addHook<K extends keyof Hooks> (name: K, fn: Hooks[K], instance: ApiInstance): number | undefined
export function addHook<K extends keyof Hooks> (name: K, fn: Hooks[K], instance = useApi()): number | undefined {
  let id: number | undefined

  switch (name) {
    case 'onRequest': {
      id = instance.interceptors.request.use((config) => fn(config) ?? Promise.resolve(config))
      break
    }

    case 'onRequestError': {
      id = instance.interceptors.request.use(undefined, (error) => fn(error) ?? Promise.reject(error))
      break
    }

    case 'onResponse': {
      id = instance.interceptors.response.use((response) => fn(response) ?? Promise.resolve(response))
      break
    }

    case 'onResponseError': {
      id = instance.interceptors.response.use(undefined, (error) => fn(error) ?? Promise.reject(error))
      break
    }
  }

  if (id !== undefined)
    instance.hooks[name].set(id, fn)

  return id
}

/**
 * Remove hook from global instance
 * @param name hook name
 * @param id hook id
 */
export function removeHook<K extends keyof HooksMap> (name: K, id: number): void
/**
 * Remove hook from instance
 * @param name hook name
 * @param id hook id
 * @param instance target instance
 */
export function removeHook<K extends keyof HooksMap> (name: K, id: number, instance: ApiInstance): void
export function removeHook<K extends keyof HooksMap> (name: K, id: number, instance = useApi()): void {
  if (name === 'onRequest' || name === 'onRequestError')
    instance.interceptors.request.eject(id)

  else if (name === 'onResponse' || name === 'onResponseError')
    instance.interceptors.response.eject(id)

  instance.hooks[name].delete(id)
}

/**
 * Reset all global hooks
 */
export function resetHook (): void
/**
 * Reset all hook from instance
 * @param instance target instance
 */
export function resetHook (instance: ApiInstance): void
export function resetHook (instance = useApi()) {
  const hooks = Object.keys(instance.hooks) as Array<keyof HooksMap>

  for (const name of hooks) {
    for (const id of instance.hooks[name].keys())
      removeHook(name, id, instance)
  }
}

/**
 * Copy hook from instance to instance
 * @param from Source instance
 * @param to Target instance
 */
export function copyHook (from: ApiInstance, to: ApiInstance): ApiInstance {
  const hooks = Object.keys(from.hooks) as Array<keyof HooksMap>

  for (const name of hooks) {
    for (const fn of from.hooks[name].values())
      addHook(name, fn, to)
  }

  return to
}

export {
  onResponseError as onError,
}
