import Axios from 'axios'
import FetchAdapter from './fetch'
import QueueAdapter from './queue'
import type {
  ApiConfig,
  ApiInstance,
  HooksMap,
  LazyInstance,
} from './types'
import DedupeAdapter from './dedupe'
import RetryAdapter from './retry'
import defu from 'defu'
import { useApi } from './global'
import { copyHook } from './hooks'

function toValue<T extends object = any> (value: T | (() => T)) {
  return typeof value === 'function'
    ? value()
    : value
}
/**
 * Create new lazy-singleton instance
 * @param options Axios create options
 * @param fresh Create fresh instance instead of cloning global instance
 * @example
 *  const useApi = createLazyton({ prefixURL: '/api/anu' })
 *
 *  useApi().get('/url/endpoint/')
 */
export function createLazyton (options: ApiConfig | (() => ApiConfig) = {}, fresh = false): LazyInstance {
  let api: ApiInstance

  const getApi = function () {
    if (!api) {
      api = fresh
        ? createApi(toValue(options))
        : useApi().create(toValue(options))
    }

    return api
  }

  const setApi = function (instance: ApiInstance) {
    api = instance
  }

  return Object.assign(getApi, { setApi })
}

/**
 * Create new api instance
 * @param options
 */
export function createApi (options: ApiConfig = {}, parent?: ApiInstance): ApiInstance {
  /**
   * Adapter Pipeline:
   * Retry => Dedupe => Queue => Fetch
   */
  const originalAdapter = Axios.getAdapter(options.adapter ?? Axios.defaults.adapter)
  const fetch           = parent?.fetch ?? new FetchAdapter(originalAdapter)
  const queue           = parent?.queue ?? new QueueAdapter(fetch.adapter(), options.queue)
  const dedupe          = parent?.dedupe ?? new DedupeAdapter(queue.adapter())
  const retry           = parent?.retry ?? new RetryAdapter(dedupe.adapter())
  const adapter         = retry.adapter()
  const instance        = Axios.create({ ...options, adapter })

  const hooks: HooksMap = {
    onRequest      : new Map(),
    onResponse     : new Map(),
    onRequestError : new Map(),
    onResponseError: new Map(),
  }

  return Object.assign(instance, {
    queue,
    dedupe,
    retry,
    fetch,
    hooks,
    parent,
    cancel   : dedupe.cancel.bind(dedupe),
    cancelAll: dedupe.cancelAll.bind(dedupe),
    create   : function (this: ApiInstance, newOptions: ApiConfig = {}): ApiInstance {
      const instance = createApi(defu<ApiConfig, [ApiConfig, ApiConfig]>(
        newOptions,
        { adapter: originalAdapter },
        options,
      ), this)

      return copyHook(this, instance)
    },
  })
}
