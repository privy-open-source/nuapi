import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  useApi,
  createApi,
  setApi,
} from '.'
import {
  beforeAll,
  afterEach,
  describe,
  it,
  expect,
  afterAll,
} from 'vitest'

const BASE_URL = 'http://localhost:3000'

const server = setupServer(
  http.get(`${BASE_URL}/api/ping`, () => {
    return HttpResponse.json({ message: 'Pong' })
  }),
)

beforeAll(() => {
  server.listen()

  setApi(createApi({ baseURL: BASE_URL }))
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('DedupeAdapter', () => {
  it('should cancel previous request with same requestId', async () => {
    const api    = useApi()
    const a      = api.get('/api/ping', { requestId: 'ping' })
    const b      = api.get('/api/ping', { requestId: 'ping' })
    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })

  it('should do nothing if requestId is different', async () => {
    const api    = useApi()
    const a      = api.get('/api/ping', { requestId: 'ping/a' })
    const b      = api.get('/api/ping', { requestId: 'ping/b' })
    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('fulfilled')
    expect(result[1].status).toBe('fulfilled')
  })

  it('should be able to cancel via AbortController', async () => {
    const api        = useApi()
    const controller = new AbortController()
    const signal     = controller.signal

    const a = api.get('/api/ping', { requestId: 'ping/d', signal })
    const b = api.get('/api/ping', { requestId: 'ping/e' })

    controller.abort()

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })
})

describe('cancel', () => {
  it('should be cancel request only specific requestId', async () => {
    const api = useApi()
    const a   = api.get('/api/ping', { requestId: 'ping/i' })
    const b   = api.get('/api/ping', { requestId: 'ping/j' })

    api.cancel('ping/i')

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })
})

describe('cancelAll', () => {
  it('should be cancel all active request', async () => {
    const api = useApi()
    const a   = api.get('/api/ping', { requestId: 'ping/x' })
    const b   = api.get('/api/ping', { requestId: 'ping/y' })

    api.cancelAll()

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('rejected')
  })
})
