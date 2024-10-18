import type {
  AxiosStatic,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
} from 'axios'
import type QueueAdapter from './queue'
import type { QueueOptions } from './queue'
import type { RetryOnHandler } from './retry'
import type DedupeAdapter from './dedupe'
import type FetchAdapter from './fetch'
import type RetryAdapter from './retry'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Queue priority
     */
    priority?: number,
    /**
     * @deprecated rename to `requestKey` because it's confusing with `X-Request-ID`
     */
    requestId?: string,
    /**
     * Request Identifier, prior request with same key will canceled
     */
    requestKey?: string,
    /**
     * Prefix URL
     */
    prefixURL?: string,
    /**
     * Maximal retries
     * @default 2 // (except for 'POST', 'PATCH', 'PUT', 'DELETE')
     */
    retry?: number | boolean,
    /**
     * Retry on status code
     * @default
     * [
        408, // Request Timeout
        409, // Conflict
        425, // Too Early
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
      ]
    */
    retryStatus?: number[] | ((statuses: number[]) => number[]),
    /**
     * Custom condition method
     */
    retryOn?: RetryOnHandler,
    /**
     * Retry delay
     * @default 1000
     */
    retryDelay?: number,
  }
}

export interface ApiConfig extends AxiosRequestConfig {
  queue?: QueueOptions,
}

type onFulfilledOf<T> = T extends (onFulfilled: infer R) => number ? NonNullable<R> : never

type onRejectedOf<T> = T extends (onFulfilled: undefined, onRejected: infer R) => number ? NonNullable<R> : never

export type ApiResponse<T> = Promise<AxiosResponse<T>>

export type RequestHook = onFulfilledOf<AxiosStatic['interceptors']['request']['use']>

export type ResponseHook = onFulfilledOf<AxiosStatic['interceptors']['response']['use']>

export type ErrorHook = onRejectedOf<AxiosStatic['interceptors']['response']['use']>

export type Hook = RequestHook | ResponseHook | ErrorHook

export interface Hooks {
  onRequest: RequestHook,
  onResponse: ResponseHook,
  onRequestError: ErrorHook,
  onResponseError: ErrorHook,
}

export type HooksMap = {
  [K in keyof Hooks]: Map<number, Hooks[K]>
}

export interface LazyInstance {
  (): ApiInstance,
  setApi: (instance: ApiInstance) => void,
}

export interface ApiInstance extends AxiosInstance {
  hooks: HooksMap,
  cancel: InstanceType<typeof DedupeAdapter>['cancel'],
  cancelAll: InstanceType<typeof DedupeAdapter>['cancelAll'],
  dedupe: DedupeAdapter,
  queue: QueueAdapter,
  fetch: FetchAdapter,
  retry: RetryAdapter,
  parent?: ApiInstance,
  create: (this: ApiInstance, config?: ApiConfig) => ApiInstance,
}

export type ApiResolver = () => ApiInstance | undefined
