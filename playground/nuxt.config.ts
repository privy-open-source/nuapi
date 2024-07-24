import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules   : ['@privyid/nhp', '../src/module'],
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
