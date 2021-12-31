import { Ref, InjectionKey, UnwrapRef } from 'vue-demi'

type Fn = () => void

export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>

export type Conditions<T> = {
  [K in keyof T]: T[K]
}

export type ConditionsType = {
  [key: string]: any
}

export interface OnFetchErrorContext<T = any, E = any> {
  error: E
  data: T | null
}

export interface Config<O> {
  fetcher: (params: object) => Promise<any>
  immediate?: boolean
  initialData?: any
  conditions: O
  defaultParams?: object
  beforeFetch?: (conditions: O & ConditionsType, cancel: Fn) => ConditionsType
  afterFetch?: (data: any) => any
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface QueryOptions<K> {
  sync?: InjectionKey<any> | string
  navigation?: 'push' | 'replace'
  ignore?: Array<K>
}

export interface UseConditionWatcherReturn<O> {
  conditions: UnwrapNestedRefs<O>
  loading: Ref<boolean | false>
  data: Ref<any | null>
  error: Ref<any | null>
  execute: () => Promise<any>
}
