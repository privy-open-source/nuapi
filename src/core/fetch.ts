import {
  type InternalAxiosRequestConfig,
  type AxiosAdapter,
  type AxiosResponse,
} from 'axios'
import {
  joinURL,
  cleanDoubleSlashes,
} from 'ufo'
import {
  ofetch,
  FetchError,
  type FetchResponse,
} from 'ofetch'
import { AxiosError } from 'axios'

type ResponseType = 'blob' | 'text' | 'arrayBuffer' | 'stream'

export default class FetchAdapter {
  private readonly fetch: AxiosAdapter

  constructor (adapter: AxiosAdapter) {
    this.fetch = adapter
  }

  getBaseURL (config: InternalAxiosRequestConfig) {
    let result: string = '/'

    if (config.baseURL && config.prefixURL)
      result = joinURL(config.baseURL, config.prefixURL)

    else if (config.baseURL)
      result = config.baseURL

    else if (config.prefixURL)
      result = config.prefixURL

    return cleanDoubleSlashes(result)
      .replace('localhost', '127.0.0.1')
      .replace('0.0.0.0', '127.0.0.1')
  }

  getResponseType (config: InternalAxiosRequestConfig): ResponseType | undefined {
    if (config.responseType === 'arraybuffer')
      return 'arrayBuffer'

    return config.responseType as ResponseType
  }

  getErrorCodeFromStatus (status: number = 500): string {
    if (status >= 400 && status < 500)
      return 'ERR_BAD_REQUEST'

    if (status >= 500 && status < 600)
      return 'ERR_BAD_RESPONSE'

    return 'ERR_BAD_OPTION'
  }

  createAxiosResponse (config: InternalAxiosRequestConfig, response: FetchResponse<unknown>): AxiosResponse {
    return {
      config,
      data      : response._data,
      status    : response.status,
      statusText: response.statusText,
      headers   : Object.fromEntries(response.headers.entries()),
    }
  }

  async sendWithAxios (config: InternalAxiosRequestConfig) {
    return await this.fetch({
      ...config,
      baseURL: this.getBaseURL(config),
    })
  }

  async sendWithFetch (config: InternalAxiosRequestConfig) {
    try {
      const reqHeaders = new Headers(config.headers ?? {})

      // We need remove Content-Type header when body is FormData
      if (config.data instanceof FormData)
        reqHeaders.delete('Content-Type')

      const response = await ofetch.raw(config.url ?? '/', {
        baseURL     : this.getBaseURL(config),
        headers     : reqHeaders,
        body        : config.data,
        method      : config.method,
        params      : config.params,
        timeout     : config.timeout,
        signal      : config.signal as AbortSignal,
        responseType: this.getResponseType(config),
        retry       : false,
      })

      return this.createAxiosResponse(config, response)
    } catch (error) {
      if (error instanceof FetchError) {
        throw new AxiosError(
          `Request failed with status code ${error.response?.status ?? 500}`,
          this.getErrorCodeFromStatus(error.status),
          config,
          error.request,
          error.response && this.createAxiosResponse(config, error.response),
        )
      }

      throw error
    }
  }

  isFetchSupported (config: InternalAxiosRequestConfig) {
    return typeof config.onUploadProgress !== 'function'
      && typeof config.onDownloadProgress !== 'function'
      && config.responseType !== 'document'
  }

  adapter (): AxiosAdapter {
    return async (config) => {
      return this.isFetchSupported(config)
        ? await this.sendWithFetch(config)
        : await this.sendWithAxios(config)
    }
  }
}
