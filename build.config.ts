import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      name : 'core',
      input: 'src/core/index',
    },
  ],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
