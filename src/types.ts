import { Ref, InjectionKey, UnwrapRef } from 'vue-demi'

export type Fn = () => void

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
  conditions: O
  defaultParams?: object
  immediate?: boolean
  initialData?: any
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
  readonly loading: Ref<boolean | false>
  readonly data: Ref<any | null>
  readonly error: Ref<any | null>
  execute: (throwOnFailed: boolean) => Promise<any>
  resetConditions: VoidFunction
  onConditionsChange: (fn: (newConditions, oldConditions) => void) => void
  onFetchSuccess: (fn: (response) => void) => void
  onFetchError: (fn: (error) => void) => void
  onFetchFinally: (fn: (error) => void) => void
}
