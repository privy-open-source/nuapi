import {
  describe,
  it,
  expect,
} from 'vitest'
import { getCode, useApi } from '.'

describe('RetryAdapter', () => {
  it('should resend request if error', async () => {
    const api      = useApi()
    const response = await api.get('/api/error/unstable', { retryDelay: 3 })

    expect(response.data).toStrictEqual({ message: 'Pong', data: { count: 2 } })
    expect(response.config.retryCount).toBe(2)
  })

  it('should stop retry if response still error', async () => {
    const api = useApi()

    try {
      await api.get('/api/error/500', { retryDelay: 3, retry: 1 })
    } catch (error) {
      expect(getCode(error)).toBe(500)
      expect(error.config.retryCount).toBe(1)
    }
  })

  it('should not retry if request has payload (POST / PUT / PATCH / DELETE)', async () => {
    const api = useApi()

    try {
      await api.post('/api/error/500', { retryDelay: 3 })
    } catch (error) {
      expect(getCode(error)).toBe(500)
      expect(error.config.retryCount).toBeUndefined()
    }
  })
})
