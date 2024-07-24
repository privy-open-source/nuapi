import { useApi } from '.'
import {
  getCode,
  getMessage,
  isApiError,
} from './error'
import {
  describe,
  it,
  expect,
} from 'vitest'

describe('Error utils', () => {
  describe('getCode', () => {
    it('should be able to get error code with getCode()', async () => {
      const api = useApi()

      try {
        await api.get('/api/error/422')
      } catch (error) {
        const code = getCode(error)

        expect(code).toBe(422)
      }
    })

    it('should return 500 if error not an api error', () => {
      const error = new Error('Hehe')
      const code  = getCode(error)

      expect(code).toBe(500)
    })
  })

  describe('getMessage', () => {
    it('should return error message in response body if present', async () => {
      const api = useApi()

      try {
        await api.get('/api/error/422')
      } catch (error) {
        const message = getMessage(error)

        expect(message).toBe('Validation Error')
      }
    })

    it('should return error message in if response body has no error\'s message', async () => {
      const api = useApi()

      try {
        await api.get('/api/error/404')
      } catch (error) {
        const message = getMessage(error)

        expect(message).toBe('Request failed with status code 404')
      }
    })

    it('should return error message even if error not an api error', async () => {
      const error   = new Error('Hehe')
      const message = getMessage(error)

      expect(message).toBe('Hehe')
    })
  })

  describe('isApiError()', () => {
    it('should be able to check error is ApiError or not with isApiError()', async () => {
      const api          = useApi()
      const normalError  = new Error('Not Error')
      const resposeError = await (api.get('/api/error/500', { retry: false }).catch((error) => error))
      const grpcError    = await (api.get('/api/error/422').catch((error) => error))

      expect(isApiError(normalError)).toBe(false)
      expect(isApiError(resposeError)).toBe(false)
      expect(isApiError(grpcError)).toBe(true)
    })
  })
})
