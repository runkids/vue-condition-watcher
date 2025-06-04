type ArgumentsTuple = [any, ...unknown[]] | readonly [any, ...unknown[]]
export type Arguments = string | ArgumentsTuple | Record<any, any> | null | undefined | false
/** Type used as cache key */
export type Key = Arguments | (() => Arguments)
/** Basic cache interface used by the composables */
export interface Cache<Data = any> {
  /** Check if a value exists and not expired */
  has(key: Key): boolean
  /** Get cached value */
  get(key: Key): Data | undefined
  /** Set cache value with optional ttl(ms) */
  set(key: Key, value: Data, ttl?: number): void
  /** Delete cache entry */
  delete(key: Key): void
}

/**
 * Options used when synchronizing conditions with browser history.
 */
export interface HistoryOptions<K> {
  sync: {
    currentRoute: any
    replace: (string) => any
    push: (string) => any
  }
  navigation?: 'push' | 'replace'
  ignore?: Array<K>
}
