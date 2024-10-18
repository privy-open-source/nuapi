import {
  describe,
  it,
  expect,
  vi as jest,
} from 'vitest'
import {
  createApi,
  createLazyton,
  onRequest,
  QueuePriority,
} from '.'

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
