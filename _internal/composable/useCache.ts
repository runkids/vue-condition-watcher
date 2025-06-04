import { Cache } from '../types'
import { serializeFunc, sortObject, stringifyQuery } from '../utils/common'

export function useCache(fetcher: (params: object) => Promise<any>, provider: Cache) {
  const baseKey = serializeFunc(fetcher)
  function formatKey(key) {
    return `${baseKey}@${stringifyQuery(sortObject(key))}`
  }
  return {
    set: (key, value, ttl?: number) => provider.set(formatKey(key), value, ttl),
    get: (key) => provider.get(formatKey(key)),
    delete: (key) => provider.delete(formatKey(key)),
    cached: (key) => provider.has(formatKey(key)),
  }
}
