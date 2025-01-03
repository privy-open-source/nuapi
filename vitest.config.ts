import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./msw.setup.ts'],
    coverage  : { include: ['src/core/**'] },
  },
})
