import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  setApi,
  useApi,
} from './global'
import { createApi } from './instance'

describe('useApi', () => {
  it('should return same instance and same instance (singleton)', () => {
    const a = useApi()
    const b = useApi()

    expect(a).toStrictEqual(b)
  })
})

describe('setApi', () => {
  it('should be able to replace global instance', () => {
    const old   = useApi()
    const fresh = createApi()

    setApi(fresh)

    const last = useApi()

    expect(last).toStrictEqual(fresh)
    expect(last).not.toStrictEqual(old)
  })
})
