import { defineEventHandler } from 'h3'
import process from 'node:process'

export default defineEventHandler(() => {
  if (!global.gc) {
    return {
      code   : 400,
      message: 'GC not available',
    }
  }

  const before = process.memoryUsage()

  global.gc()

  const after = process.memoryUsage()
  const diff  = {
    rss         : before.rss - after.rss,
    heapTotal   : before.heapTotal - after.heapTotal,
    heapUsed    : before.heapUsed - after.heapUsed,
    external    : before.external - after.external,
    arrayBuffers: before.arrayBuffers - after.arrayBuffers,
  }

  return {
    code   : 200,
    message: 'Memory clerer',
    data   : {
      before,
      after,
      diff,
    },
  }
})
