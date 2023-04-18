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

Opinionated Rest Client, Powered by Axios

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@privyid/nuapi?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://www.jsdocs.io/package/@privyid/nuapi)

## Features

<!-- Highlight some of the features your module provide here -->
- ✅ Built-in adapter for Dedupe, and Priority Queue request.
- ✅ Composible hook for Axios interceptors.

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
    '@privyid/nuapi/modules'
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
} from '@privyid/nuapi'

function isUnauthorize (error: Error): boolean {
  const code    = getCode(error)
  const message = getMessage(error)

  return code === 401 && message === 'Unauthorized'
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

All request per instance will be add into queue before sent with priority `1`.
If you want to send your request first before the others, you can set using option `priority`. The higher priority will run first.

```ts
useApi().get('/document/load', {
  priority: 2,
})
```

## Dedupe

Sometime, you want to cancel request with same endpoint like when you working with searching or filter.

NuGrpc API has built in function for this case. Just set `requestId`, multiple sent request with same id will cancel last request before.

```ts
useApi().get('/document/load', {
  requestId: 'document-load',
})
```
## API

:point_right: You can learn more about usage in [JSDocs Documentation](https://www.jsdocs.io/package/@privyid/nuapi).

## Development

```bash
# Install dependencies
yarn install

# Generate type stubs
yarn dev:prepare

# Develop with the playground
yarn dev

# Build the playground
yarn dev:build

# Run ESLint
yarn lint

# Run Vitest
yarn test
yarn test:watch

# Release new version
yarn release
```

## License
[MIT](/LICENSE) License

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@privyid/nuapi/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@privyid/nuapi

[npm-downloads-src]: https://img.shields.io/npm/dm/@privyid/nuapi.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@privyid/nuapi

[license-src]: https://img.shields.io/npm/l/@privyid/nuapi.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@privyid/nuapi

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
