/* eslint-disable @typescript-eslint/promise-function-async */
import type { AxiosAdapter } from 'axios'

export default class DedupeAdapter {
  protected limit: Map<string, AbortController>
  protected fetch: AxiosAdapter

  constructor (adapter: AxiosAdapter) {
    this.fetch = adapter
    this.limit = new Map()
  }

  public cancel (requestKey: string) {
    const controller = this.limit.get(requestKey)

    if (controller)
      controller.abort()
  }

  public cancelAll () {
    for (const controller of this.limit.values())
      controller.abort()
  }

  public adapter (): AxiosAdapter {
    return (config) => {
      const requestKey = config.requestKey ?? config.requestId

      if (!requestKey)
        return this.fetch(config)

      this.cancel(requestKey)

      const controller = new AbortController()
      const signal     = controller.signal
      const onAborted  = () => {
        controller.abort()
      }

      this.limit.set(requestKey, controller)

      if (config.signal)
        config.signal.addEventListener?.('abort', onAborted)

      return new Promise((resolve, reject) => {
        this.fetch({ ...config, signal })
          .then(resolve)
          .catch(reject)
          .finally(() => {
            if (this.limit.get(requestKey) === controller)
              this.limit.delete(requestKey)

            if (config.signal)
              config.signal.removeEventListener?.('abort', onAborted)
          })
      })
    }
  }
}
