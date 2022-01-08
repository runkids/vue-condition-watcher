import { Cache } from './../types'
import { sortObject, stringifyQuery } from '../utils/common'

export function useCache(provider: Cache) {
  function formatString(key) {
    return stringifyQuery(sortObject(key))
  }
  return {
    set: (key, value) => provider.set(formatString(key), value),
    get: (key) => (provider.get(formatString(key)) ? provider.get(formatString(key)) : undefined),
    delete: (key) => provider.delete(formatString(key)),
    cached: (key) => provider.get(formatString(key)) !== undefined,
  }
}
