import {
  type AxiosRequestConfig,
  createLazyton,
} from '@privyid/nuapi/core'

const useApi = createLazyton({ prefixURL: '/api' })

export async function getUser (config?: AxiosRequestConfig) {
  return await useApi().get('/users', config)
}
