import Axios, {
  type AxiosAdapter,
  type AxiosPromise,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import defu from 'defu'

interface QueueJob {
  config: InternalAxiosRequestConfig,
  priority: number,
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void,
  reject: (reason: unknown) => void,
}

export interface QueueOptions {
  worker: number,
}

export enum QueuePriority {
  /**
   * Higher priority
   */
  HIGH = 30,
  /**
   * Default priority
   */
  MEDIUM = 20,
  /**
   * Lower priority
   */
  LOW = 10,
}

export default class QueueAdapter {
  protected fetch: AxiosAdapter
  protected queue: QueueJob[]
  protected options: QueueOptions
  protected process: number

  constructor (adapter: AxiosAdapter, options?: Partial<QueueOptions>) {
    this.fetch   = adapter
    this.queue   = []
    this.process = 0
    this.options = defu(options, { worker: 5 })
  }

  protected enqueue (value: QueueJob) {
    let index = 0
    let count = this.queue.length

    while (count > 0) {
      const mid  = Math.trunc(count / 2)
      const it   = index + mid
      const node = this.queue[it]

      if (value.priority > node.priority) {
        index  = it + 1
        count -= (mid + 1)
      } else
        count = mid
    }

    this.queue.splice(index, 0, value)
  }

  protected dequeue () {
    return this.queue.pop()
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  protected add (config: InternalAxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      const onResolved: QueueJob['resolve'] = (response) => {
        resolve(response)
        onDone()
      }

      const onRejected: QueueJob['reject'] = (error) => {
        reject(error)
        onDone()
      }

      const onAborted = () => {
        onRejected(new Axios.Cancel())
      }

      const onDone = () => {
        if (config.signal)
          config.signal.removeEventListener?.('abort', onAborted)
      }

      if (config.signal)
        config.signal.addEventListener?.('abort', onAborted)

      if (config.signal?.aborted !== true) {
        const queue: QueueJob = {
          resolve : onResolved,
          reject  : onRejected,
          priority: config.priority ?? QueuePriority.MEDIUM,
          config,
        }

        this.enqueue(queue)

        // Next tick
        setTimeout(() => {
          this.run()
        }, 0)
      }
    })
  }

  protected run () {
    if (this.queue.length > 0 && this.process < this.options.worker) {
      this.process++

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const job    = this.dequeue()!
      const signal = job.config.signal

      // Skip to next job if already aborted
      if (signal?.aborted) {
        this.process--
        this.run()

        return
      }

      this.fetch(job.config)
        .then(job.resolve)
        .catch(job.reject)
        .finally(() => {
          this.process--
          this.run()
        })
    }
  }

  public adapter (): AxiosAdapter {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    return (config) => {
      return this.add(config)
    }
  }
}
