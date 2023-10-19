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
      mode : 'server',
      src  : resolve('runtime/api.server'),
      order: -20,
    })

    addPlugin({
      mode : 'client',
      src  : resolve('runtime/api.client'),
      order: -20,
    })

    extendViteConfig((config) => {
      config.optimizeDeps?.include?.push('axios')
    })
  },
})
