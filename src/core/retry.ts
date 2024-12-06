/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/no-throw-literal */
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { getCode, isCancel } from './error'
import { defuFn } from 'defu'

export type RetryOnHandler = (error: unknown) => boolean | Promise<boolean>

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retryCount: number,
    retryStatus: number[],
    retryDelay: number,
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

    if (PAYLOAD_METHODS.has(String(config.method).toUpperCase()) && config.retry !== true)
      return 0

    return 2
  }

  protected async isNeedRetry (config: InternalAxiosRequestConfig, error: unknown) {
    if (config.retry === false)
      return false

    if (isCancel(error))
      return false

    if (typeof config.retryOn === 'function' && await config.retryOn(error))
      return true

    if (config.retryCount < this.getRetryMax(config))
      return config.retryStatus.includes(getCode(error))

    return false
  }

  protected async sendWithRetry (config: InternalAxiosRequestConfig) {
    try {
      return await this.fetch(config)
    } catch (error) {
      const cfg = defuFn(config, {
        retryCount : 0,
        retryStatus: RETRY_STATUS_CODES,
        retryDelay : 1000,
      })

      if (!(await this.isNeedRetry(cfg, error)))
        throw error

      await delay((cfg.retryCount + 1) * cfg.retryDelay)

      return this.sendWithRetry({
        ...config,
        retryCount: (cfg.retryCount + 1),
      })
    }
  }

  public adapter (): AxiosAdapter {
    return (config) => {
      return this.sendWithRetry(config)
    }
  }
}
