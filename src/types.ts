import { Ref, InjectionKey } from 'vue-demi'

export type ConditionsType = {
  [propName: string]: any
}

export type FetcherType = (params: ConditionsType) => Promise<any>
export type ProvideKeyName<T> = InjectionKey<T> | string

export interface QueryOptions<T> {
  sync?: ProvideKeyName<T> | 'router'
  navigation?: 'push' | 'replace'
  ignore?: string[]
}

export interface Config {
  fetcher: FetcherType
  conditions: ConditionsType
  defaultParams?: ConditionsType
  beforeFetch?: (conditions: ConditionsType) => ConditionsType
  afterFetch?: (data: any) => void
}

export interface ResultInterface {
  conditions: { [x: string]: any }
  loading: Ref<boolean | false>
  data: Ref<any | null>
  refresh: Ref<() => void>
  error: Ref<any | null>
}
