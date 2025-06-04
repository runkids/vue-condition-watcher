import { Cache } from '../types'
import { sortObject } from '../utils/common'
import { getFetcherId } from '../utils/fetcherId'

export function useCache(fetcher: (params: object) => Promise<any>, provider: Cache) {
  const baseKey = getFetcherId(fetcher)
  function formatKey(key: Record<string, any>) {
    return `${baseKey}@${JSON.stringify(sortObject(key))}`
  }
  return {
    set: (key, value, ttl?: number) => provider.set(formatKey(key), value, ttl),
    get: (key) => provider.get(formatKey(key)),
    delete: (key) => provider.delete(formatKey(key)),
    cached: (key) => provider.has(formatKey(key)),
  }
}
