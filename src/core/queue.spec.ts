import MockAdapter from 'axios-mock-adapter'
import Axios from 'axios'
import { createApi } from '.'
import {
  beforeAll,
  afterEach,
  describe,
  it,
  expect,
} from 'vitest'

let mock: MockAdapter

beforeAll(() => {
  mock = new MockAdapter(Axios, { delayResponse: 1 })
})

afterEach(() => {
  mock.reset()
})

describe('QueueAdapter', () => {
  it('should run 3 requests first, and queue last 3 requests', async () => {
    mock.onGet('/ping').reply(200, 'Pong')

    const result: number[] = []
    const api              = createApi({ queue: { worker: 3 } })

    await Promise.race([
      Promise.all([
        api.get('/ping').then(() => result.push(1)),
        api.get('/ping').then(() => result.push(2)),
        api.get('/ping').then(() => result.push(3)),
      ]),
      Promise.all([
        api.get('/ping').then(() => result.push(4)),
        api.get('/ping').then(() => result.push(5)),
        api.get('/ping').then(() => result.push(6)),
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
    mock.onGet('/ping').reply(200, 'Pong')

    const result: number[] = []
    const api              = createApi({ queue: { worker: 1 } })

    await Promise.all([
      api.get('/ping').then(() => result.push(1)),
      api.get('/ping').then(() => result.push(2)),
      api.get('/ping', { priority: 3 }).then(() => result.push(3)),
      api.get('/ping').then(() => result.push(4)),
      api.get('/ping', { priority: 5 }).then(() => result.push(5)),
    ])

    expect(result).toHaveLength(5)
    expect(result).toStrictEqual([
      1,
      5,
      3,
      2,
      4,
    ])
  })
})
