import { fileURLToPath } from 'node:url'
import MyModule from '../src/module'

export default defineNuxtConfig({
  modules   : ['@privyid/nhp', MyModule],
  alias     : { '@privyid/nuapi/core': fileURLToPath(new URL('../src/core/', import.meta.url)) },
  nuapi     : {},
  typescript: {
    tsConfig: {
      compilerOptions: {
        strict          : false,
        strictNullChecks: true,
      },
    },
  },
})
