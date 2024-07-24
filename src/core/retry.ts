/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/no-throw-literal */
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import {
  getCode,
  getHeader,
  isAxiosError,
  isCancel,
} from './error'

export type RetryOnHandler = (error: unknown) => boolean | Promise<boolean>

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retryCount?: number,
  }
}

const PAYLOAD_METHODS = new Set([
  'PATCH',
  'POST',
  'PUT',
  'DELETE',
])

const RETRY_STATUS_CODES = [
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class RetryAdapter {
  protected fetch: AxiosAdapter

  constructor (adapter: AxiosAdapter) {
    this.fetch = adapter
  }

  protected getRetryMax (config: InternalAxiosRequestConfig): number {
    if (typeof config.retry === 'number' && Number.isFinite(config.retry))
      return config.retry

    if (!PAYLOAD_METHODS.has(String(config.method).toUpperCase()))
      return 2

    return 0
  }

  protected getRetryCount (config: InternalAxiosRequestConfig): number {
    return config.retryCount ?? 0
  }

  protected getRetryDelay (config: InternalAxiosRequestConfig, error: unknown) {
    if (isAxiosError(error)) {
      const retryAfter = getHeader(error, 'Retry-After') ?? getHeader(error, 'retry-after')

      if (retryAfter) {
        if (/^\d+$/.test(retryAfter))
          return 1000 * Number.parseInt(retryAfter)

        const exp  = Date.parse(retryAfter)
        const diff = exp - Date.now()

        if (diff > 0)
          return diff
      }
    }

    return 1000 * (this.getRetryCount(config) + 1)
  }

  protected async isNeedRetry (config: InternalAxiosRequestConfig, error: unknown) {
    if (config.retry === false)
      return false

    if (isCancel(error))
      return false

    if (typeof config.retryOn === 'function' && await config.retryOn(error))
      return true

    if (this.getRetryCount(config) < this.getRetryMax(config)) {
      const code        = getCode(error)
      const statusCodes = config.retryStatus ?? RETRY_STATUS_CODES

      return statusCodes.includes(code)
    }

    return false
  }

  protected async sendWithRetry (config: InternalAxiosRequestConfig) {
    try {
      return await this.fetch(config)
    } catch (error) {
      if (!(await this.isNeedRetry(config, error)))
        throw error

      await delay(this.getRetryDelay(config, error))

      return this.sendWithRetry({
        ...config,
        retryCount: this.getRetryCount(config) + 1,
      })
    }
  }

  public adapter (): AxiosAdapter {
    return (config) => {
      return this.sendWithRetry(config)
    }
  }
}
