import { Cache } from './../types'
import { serializeFunc, sortObject, stringifyQuery } from '../utils/common'

export function useCache(fetcher: (params: object) => Promise<any>, provider: Cache) {
  const baseKey = serializeFunc(fetcher)
  function formatString(key) {
    return `${baseKey}@${stringifyQuery(sortObject(key))}`
  }
  return {
    set: (key, value) => provider.set(formatString(key), value),
    get: (key) => (provider.get(formatString(key)) ? provider.get(formatString(key)) : undefined),
    delete: (key) => provider.delete(formatString(key)),
    cached: (key) => provider.get(formatString(key)) !== undefined,
  }
}
