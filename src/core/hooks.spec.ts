import {
  describe,
  expect,
  it,
  vi as jest,
} from 'vitest'
import { useApi } from './global'
import {
  copyHook,
  onError,
  onRequest,
  onRequestError,
  onResponse,
  onResponseError,
  removeHook,
  resetHook,
} from './hooks'
import type { AxiosResponse } from 'axios'
import type { RequestHook, ResponseHook } from './types'
import { createApi } from './instance'

describe('Hooks utils', () => {
  it('should be able to registering on-request hook using onRequest()', async () => {
    const api      = useApi()
    const fn       = jest.fn((config) => config)
    const config   = { headers: { foo: 'bar' } }
    const expected = expect.objectContaining({ headers: expect.objectContaining({ foo: 'bar' }) })

    onRequest(fn)

    await api.get('/api/ping', config)

    expect(fn).toBeCalled()
    expect(fn).toBeCalledWith(expected)
  })

  it('should be able to registering on-response hook using onResponse()', async () => {
    const api      = useApi()
    const fn       = jest.fn((response: AxiosResponse) => response)
    const expected = expect.objectContaining({ data: { message: 'Pong' } })

    onResponse(fn)

    await api.get('/api/ping')

    expect(fn).toBeCalled()
    expect(fn).toBeCalledWith(expected)
  })

  it('should be able to registering on-request-error hook using onRequestError()', async () => {
    const api = useApi()
    const fn  = jest.fn(async (error) => await Promise.reject(error))

    onRequestError(fn)

    // mock request error
    onRequest(jest.fn().mockRejectedValue('Hehe'))

    try {
      await api.get('/api/ping')
    } catch {
      expect(fn).toBeCalledTimes(1)
      expect(fn).toBeCalledWith('Hehe')
    }
  })

  it('should be able to registering on-response-error hook using onResponseError()', async () => {
    const api = useApi()
    const fn  = jest.fn((error) => error)

    onResponseError(fn)

    try {
      await api.get('/api/error/422')
    } catch {
      expect(fn).toBeCalled()
    }
  })

  it('should be able to registering on-request-error and on-request-error hook using onError()', async () => {
    const api = useApi()
    const fn  = jest.fn(async (error) => await Promise.reject(error))

    onError(fn)

    // mock request error
    const mockId = onRequest(jest.fn().mockRejectedValue('On Request Error'))

    try {
      await api.get('/api/ping')
    } catch {
      expect(fn).toBeCalledTimes(1)
      expect(fn).toHaveBeenNthCalledWith(1, 'On Request Error')
    }

    removeHook('onRequest', mockId)

    try {
      await api.get('/api/error/422')
    } catch {
      expect(fn).toBeCalledTimes(2)
      expect(fn).toHaveBeenNthCalledWith(2, expect.objectContaining({ message: 'Request failed with status code 422' }))
    }
  })

  it('should be able to remove hook with removeHook()', async () => {
    const api = useApi()
    const fn  = jest.fn((response: AxiosResponse) => response)
    const id  = onResponse(fn)

    removeHook('onResponse', id)

    await api.get('/api/user')

    expect(fn).not.toBeCalled()
  })

  it('should remove all hook with resetHook()', async () => {
    const api = useApi()
    const fn  = jest.fn(() => {})

    onRequest(fn as unknown as RequestHook)
    onResponse(fn as unknown as ResponseHook)
    onRequestError(fn)
    onResponseError(fn)

    resetHook()

    await api.get('/api/ping')

    expect(fn).not.toBeCalled()
  })
})

describe('copyHook', () => {
  it('should be copy hook to new instance', async () => {
    const a        = createApi({ baseURL: `${process.env.BASE_URL as string}/v1`, headers: { foo: 'bar' } })
    const b        = createApi({ baseURL: `${process.env.BASE_URL as string}/v2`, headers: { foo: 'bar' } })
    const fn       = jest.fn((config) => config)
    const expected = expect.objectContaining({
      baseURL: `${process.env.BASE_URL as string}/v2`,
      headers: expect.objectContaining({ foo: 'bar' }),
    })

    onRequest(fn, a)
    copyHook(a, b)

    await b.get('/api/ping')

    expect(fn).toBeCalled()
    expect(fn).toBeCalledWith(expected)
  })
})
