import { createApi, QueuePriority } from '.'
import {
  describe,
  it,
  expect,
} from 'vitest'

describe('QueueAdapter', () => {
  it('should run 3 requests first, and queue last 3 requests', async () => {
    const result: number[] = []
    const api              = createApi({
      baseURL: process.env.BASE_URL,
      queue  : { worker: 3 },
    })

    await Promise.race([
      Promise.all([
        api.get('/api/ping').then(() => result.push(1)),
        api.get('/api/ping').then(() => result.push(2)),
        api.get('/api/ping').then(() => result.push(3)),
      ]),
      Promise.all([
        api.get('/api/ping').then(() => result.push(4)),
        api.get('/api/ping').then(() => result.push(5)),
        api.get('/api/ping').then(() => result.push(6)),
      ]),
    ])

    expect(result).toHaveLength(3)
    expect(result).toStrictEqual([
      1,
      2,
      3,
    ])
  })

  it('should run request with higher priority first', async () => {
    const result: number[] = []
    const api              = createApi({
      baseURL: process.env.BASE_URL,
      queue  : { worker: 1 },
    })

    await Promise.all([
      api.get('/api/ping').then(() => result.push(1)),
      api.get('/api/ping').then(() => result.push(2)),
      api.get('/api/ping', { priority: QueuePriority.LOW }).then(() => result.push(3)),
      api.get('/api/ping').then(() => result.push(4)),
      api.get('/api/ping', { priority: QueuePriority.HIGH }).then(() => result.push(5)),
    ])

    expect(result).toHaveLength(5)
    expect(result).toStrictEqual([
      1,
      5,
      2,
      4,
      3,
    ])
  })
})
