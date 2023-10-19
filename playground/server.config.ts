import { defineServer } from '@privyid/nhp/core'

export default defineServer([
  {
    name     : 'coba',
    baseUrl  : '/api',
    targetUrl: 'https://reqres.in/api',
  },
])
