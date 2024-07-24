import {
  delay,
  http,
  HttpResponse,
} from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
} from 'vitest'
import { setApi, createApi } from './src/core'

const BASE_URL = 'http://localhost:3000'

const server = setupServer(
  http.all('*', async () => {
    await delay(2)
  }),

  http.get(`${BASE_URL}/api/ping`, () => {
    return HttpResponse.json({ message: 'Pong' })
  }),

  http.get(`${BASE_URL}/v1/api/ping`, () => {
    return HttpResponse.json({ message: 'Pong', data: { version: 'v1' } })
  }),

  http.get(`${BASE_URL}/v2/api/ping`, () => {
    return HttpResponse.json({ message: 'Pong', data: { version: 'v2' } })
  }),

  http.get(`${BASE_URL}/api/user`, () => {
    return HttpResponse.json({ data: 'data-user' })
  }),

  http.get(`${BASE_URL}/api/error/404`, () => {
    return HttpResponse.json({
      code   : 404,
      details: [],
    }, { status: 404 })
  }),

  http.get(`${BASE_URL}/api/error/422`, () => {
    return HttpResponse.json({
      code   : 422,
      message: 'Validation Error',
      details: [
        {
          type_url: 'type_url',
          value   : 'base64string',
        },
      ],
    }, { status: 422 })
  }),

  http.get(`${BASE_URL}/api/error/500`, () => {
    return new HttpResponse(undefined, { status: 500 })
  }),
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  setApi(createApi({ baseURL: BASE_URL }))
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

process.env.BASE_URL = BASE_URL
