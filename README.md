<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: NuAPI
- Package name: @privyid/nuapi
- Description: My new Nuxt module
-->

# NuAPI

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> Nuxt HTTP Client module

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [📖 &nbsp;Documentation](https://www.jsdocs.io/package/@privyid/nuapi)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@privyid/nuapi?file=playground%2Fapp.vue) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ✅ Using Fetch instead of XHR
- ✅ Built-in adapter for Retry, Dedupe, and Priority Queue request.
- ✅ Composable hook for Axios interceptors.

## Compabilities

- Nuxt 3

## Quick Setup

1. Add `@privyid/nuapi` dependency to your project

```bash
yarn add --dev @privyid/nuapi
```

2. Add `@privyid/nuapi` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@privyid/nuapi'
  ]
})
```

That's it! You can now use NuAPI in your Nuxt app ✨

## Usage

```ts
import {
  createLazyton,
  ApiResponse,
  AxiosRequestConfig
} from '@privyid/nuapi'

const useApi = createLazyton({ prefixURL: '/api' })

interface User {
  userId: string,
  email: string,
  name: string
  role: string,
}

interface FormUser {
  name: string,
  email: string,
  role: string,
}

function getUserProfile (config?: AxiosRequestConfig): ApiResponse<User> {
  return useApi().get('/user/profile', config)
}

function postUserProfile (body: FormUser, config?: AxiosRequestConfig): ApiResponse<User> {
  return useApi().post('/user/profile', body, config)
}
```

## Hook

There are available hook for add request/response interceptors.

```ts
import {
  onRequest,
  onRequestError,
  onResponse,
  onResponseError,
  onError,
  getCode,
  getMessage,
} from '@privyid/nuapi/core'

function isUnauthorize (error: Error): boolean {
  const code    = getCode(error)
  const message = getMessage(error)

  return code === 401 && message.includes('Unauthorized')
}

/** set additional or custom headers */
onRequest((config) => {
  const token: string = cookies.get('session/token') || ''

  // check available authorization header
  // and set authorization header
  if (config.headers && !config.headers.Authorization && token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

/**
 * check unauthorize error response
 * cause of invalid or expired token
 */
onResponseError(async (error) => {
  if (isUnauthorize(error)) {
    await navigateTo('/login')
  }

  throw error
})
```

## Queue

All request per instance will be add into queue before sent with priority MEDIUM (`20`).
If you want to send your request first before the others, you can set using option `priority`. The higher priority will run first.

```ts
import { QueuePriority } from '@privyid/nuapi/core'

useApi().get('/document/load', {
  // Using presets
  priority: QueuePriority.HIGH,
  // Or using number
  priority: 50,
})
```

## Dedupe

Sometime, you want to cancel request with same endpoint like when you working with searching or filter.

NuAPI has built in function for this case. Just set `requestkey`, multiple sent request with same id will cancel last request before.

```ts
useApi().get('/document/load', {
  requestkey: 'document-load',
})
```

### Cancel Manually

Cancel spesific request by `requestKey` using `.cancel()`

```ts
useApi().cancel('document-load')
```

Or cancel all requests that have `requestKey` using `.cancelAll()`

```ts
useApi().cancelAll()
```

## Retry

NuAPI automatically retries request when got an error with status code:

- 408 - Request Timeout
- 409 - Conflict
- 425 - Too Early
- 429 - Too Many Requests
- 500 - Internal Server Error
- 502 - Bad Gateway
- 503 - Service Unavailable
- 504 - Gateway Timeout

By default will retries `3` times (except for `PATCH`, `POST`, `PUT`, `DELETE`) can be changed using option `retry`.

```ts
useApi().get('/document/load', {
  retry: 5,
})
```

### Customize Retry Condition

You can customize when request should retries using `retryOn`

```ts
useApi().get('/document/load', {
  retryOn (error) {
    return getCode(error) === 423
      && error.config.retryCount < 3
  },
})
```

## API

👉 You can learn more about usage in [JSDocs Documentation](https://www.jsdocs.io/package/@privyid/nuapi).

## Contribution

- Clone this repository
- Play [Nyan Cat](https://www.youtube.com/watch?v=QH2-TGUlwu4) in the background (really important!)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Run `yarn install`
- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start [playground](./playground) in development mode.

## License
[MIT](/LICENSE) License

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@privyid/nuapi/latest.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@privyid/nuapi

[npm-downloads-src]: https://img.shields.io/npm/dm/@privyid/nuapi.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@privyid/nuapi

[license-src]: https://img.shields.io/npm/l/@privyid/nuapi.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@privyid/nuapi

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?style=for-the-badge&logo=nuxt.js
[nuxt-href]: https://nuxt.com
