import type { AxiosAdapter } from 'axios'

export default class DedupeAdapter {
  protected limit: Map<string, AbortController>
  protected fetch: AxiosAdapter

  constructor (adapter: AxiosAdapter) {
    this.fetch = adapter
    this.limit = new Map()
  }

  cancel (requestId: string) {
    const controller = this.limit.get(requestId)

    if (controller)
      controller.abort()
  }

  cancelAll () {
    for (const controller of this.limit.values())
      controller.abort()
  }

  adapter (): AxiosAdapter {
    return async (config) => {
      const requestId = config.requestId

      if (!requestId)
        return await this.fetch(config)

      this.cancel(requestId)

      const controller = new AbortController()
      const signal     = controller.signal
      const onAborted  = () => {
        controller.abort()
      }

      this.limit.set(requestId, controller)

      if (config.signal)
        config.signal.addEventListener?.('abort', onAborted)

      return await new Promise((resolve, reject) => {
        this.fetch({ ...config, signal })
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.limit.delete(requestId)

            if (config.signal)
              config.signal.removeEventListener?.('abort', onAborted)
          })
      })
    }
  }
}
