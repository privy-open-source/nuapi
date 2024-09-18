import { type AxiosResponse } from 'axios'
import {
  describe,
  it,
  expect,
  vi as jest,
} from 'vitest'
import {
  type RequestHook,
  type ResponseHook,
  createApi,
  createLazyton,
  onError,
  onRequest,
  onRequestError,
  onResponse,
  onResponseError,
  removeHook,
  resetHook,
  setApi,
  useApi,
  copyHook,
  QueuePriority,
} from '.'

describe('useApi', () => {
  it('should return same instance and same instance (singleton)', () => {
    const a = useApi()
    const b = useApi()

    expect(a).toStrictEqual(b)
  })
})

describe('setApi', () => {
  it('should be able to replace global instance', () => {
    const old   = useApi()
    const fresh = createApi()

    setApi(fresh)

    const last = useApi()

    expect(last).toStrictEqual(fresh)
    expect(last).not.toStrictEqual(old)
  })
})

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

describe('Inherit instance', () => {
  it('should be able to create new instance with same config', async () => {
    const a = createApi({ baseURL: `${process.env.BASE_URL as string}/v1`, headers: { foo: 'bar' } })
    const b = a.create({ baseURL: `${process.env.BASE_URL as string}/v2` })

    expect(b).not.toStrictEqual(a)

    const response = await b.get('/api/ping')

    expect(b.parent).toBe(a)
    expect(response.config.headers?.foo).toBe('bar')
    expect(response.data.data).toStrictEqual({ version: 'v2' })
  })

  it('should be copy hook to new instance', async () => {
    const a  = createApi({ baseURL: `${process.env.BASE_URL as string}/v1`, headers: { foo: 'bar' } })
    const fn = jest.fn((config) => config)

    onRequest(fn, a)

    const b        = a.create({ baseURL: `${process.env.BASE_URL as string}/v2` })
    const expected = expect.objectContaining({
      baseURL: `${process.env.BASE_URL as string}/v2`,
      headers: expect.objectContaining({ foo: 'bar' }),
    })

    await b.get('/api/ping')

    expect(fn).toBeCalled()
    expect(fn).toBeCalledWith(expected)
  })

  it('should prefixing baseUrl if prefixURL is present', async () => {
    const a        = createApi({ baseURL: process.env.BASE_URL, headers: { foo: 'bar' } })
    const b        = a.create({ prefixURL: 'api' })
    const response = await b.get('user')

    expect(response.status).toBe(200)
    expect(response.data.data).toBe('data-user')
  })

  it('should share queue in same parent instance', async () => {
    const a = createApi({ baseURL: process.env.BASE_URL, queue: { worker: 1 } })
    const b = a.create({ prefixURL: 'v1/api' })
    const c = a.create({ prefixURL: 'v2/api' })

    const result: number[] = []

    await Promise.all([
      a.get('api/ping').then(() => { result.push(99) }),
      b.get('ping').then(() => { result.push(1) }),
      b.get('ping', { priority: QueuePriority.LOW }).then(() => { result.push(2) }),
      c.get('ping').then(() => { result.push(3) }),
      c.get('ping', { priority: QueuePriority.HIGH }).then(() => { result.push(4) }),
    ])

    expect(result).toStrictEqual([
      4,
      99,
      1,
      3,
      2,
    ])
  })
})

describe('lazyton', () => {
  it('should create lazy instance', () => {
    const useLazy = createLazyton({ baseURL: '/v1' })

    const a = useLazy()
    const b = useLazy()

    expect(typeof useLazy).toBe('function')
    expect(a).toStrictEqual(b)
  })

  it('should inherit hook from global', async () => {
    const useLazy = createLazyton({ prefixURL: '/api' })
    const fn      = jest.fn((config) => config)

    onRequest(fn)

    await useLazy().get('/ping')

    expect(fn).toBeCalled()
  })

  it('should create fresh instace if parameter fresh set to true', async () => {
    const useLazy = createLazyton({ baseURL: `${process.env.BASE_URL as string}/api` }, true)
    const fn      = jest.fn((config) => config)
    const a       = useLazy()

    onRequest(fn)

    await a.get('/ping')

    expect(fn).not.toBeCalled()
  })
})
