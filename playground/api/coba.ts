import { createLazyton } from '@privyid/nuapi/core'

const useApi = createLazyton({ prefixURL: '/api' })

export async function getUser () {
  return await useApi().get('/users')
}
