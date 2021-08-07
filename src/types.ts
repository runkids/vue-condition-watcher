import { Ref, InjectionKey, UnwrapRef } from 'vue-demi'

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>

export type Conditions<T> = {
  [K in keyof T]: T[K]
}

export type ConditionsType = {
  [key: string]: any
}

export interface Config<O> {
  fetcher: (params: ConditionsType) => Promise<any>
  conditions: Readonly<Conditions<O>>
  defaultParams?: ConditionsType
  beforeFetch?: (conditions: ConditionsType) => ConditionsType
  afterFetch?: (data: any) => void
}

export interface QueryOptions<K> {
  sync?: InjectionKey<any> | string
  navigation?: 'push' | 'replace'
  ignore?: Array<K>
}

export interface Result<O> {
  conditions: UnwrapNestedRefs<Conditions<O>>
  loading: Ref<boolean | false>
  data: Ref<any | null>
  refresh: Ref<() => void>
  error: Ref<any | null>
}
