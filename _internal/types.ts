type ArgumentsTuple = [any, ...unknown[]] | readonly [any, ...unknown[]]
export type Arguments = string | ArgumentsTuple | Record<any, any> | null | undefined | false
export type Key = Arguments | (() => Arguments)
export interface Cache<Data = any> {
  get(key: Key): Data | null | undefined
  set(key: Key, value: Data): void
  delete(key: Key): void
}

export interface HistoryOptions<K> {
  sync: {
    currentRoute: any
    replace: (string) => any
    push: (string) => any
  }
  navigation?: 'push' | 'replace'
  ignore?: Array<K>
}
