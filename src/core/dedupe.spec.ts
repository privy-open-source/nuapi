import { useApi } from '.'
import {
  describe,
  it,
  expect,
} from 'vitest'

describe('DedupeAdapter', () => {
  it('should cancel previous request with same requestKey', async () => {
    const api    = useApi()
    const a      = api.get('/api/ping', { requestKey: 'ping' })
    const b      = api.get('/api/ping', { requestKey: 'ping' })
    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })

  it('should do nothing if requestKey is different', async () => {
    const api    = useApi()
    const a      = api.get('/api/ping', { requestKey: 'ping/a' })
    const b      = api.get('/api/ping', { requestKey: 'ping/b' })
    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('fulfilled')
    expect(result[1].status).toBe('fulfilled')
  })

  it('should be able to cancel via AbortController', async () => {
    const api        = useApi()
    const controller = new AbortController()
    const signal     = controller.signal

    const a = api.get('/api/ping', { requestKey: 'ping/d', signal })
    const b = api.get('/api/ping', { requestKey: 'ping/e' })

    controller.abort()

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })
})

describe('cancel', () => {
  it('should be cancel request only specific requestKey', async () => {
    const api = useApi()
    const a   = api.get('/api/ping', { requestKey: 'ping/i' })
    const b   = api.get('/api/ping', { requestKey: 'ping/j' })

    api.cancel('ping/i')

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('fulfilled')
  })
})

describe('cancelAll', () => {
  it('should be cancel all active request', async () => {
    const api = useApi()
    const a   = api.get('/api/ping', { requestKey: 'ping/x' })
    const b   = api.get('/api/ping', { requestKey: 'ping/y' })

    api.cancelAll()

    const result = await Promise.allSettled([a, b])

    expect(result[0].status).toBe('rejected')
    expect(result[1].status).toBe('rejected')
  })
})
