import {
  createResolver,
  defineNuxtModule,
  addPlugin,
  extendViteConfig,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name         : '@privyid/nuapi',
    configKey    : 'nuapi',
    compatibility: { nuxt: '>=3.0.0' },
  },
  setup () {
    const { resolve } = createResolver(import.meta.url)

    addPlugin({
      mode: 'all',
      src : resolve('runtime/api'),
    })

    extendViteConfig((config) => {
      config.optimizeDeps?.include?.push('axios')
    })
  },
})
