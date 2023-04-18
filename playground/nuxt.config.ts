export default defineNuxtConfig({
  modules   : ['../src/module'],
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
