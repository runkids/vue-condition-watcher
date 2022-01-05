import { Ref, InjectionKey, UnwrapNestedRefs } from 'vue-demi'

export type Fn = () => void

export type Conditions<T> = {
  [K in keyof T]: T[K]
}

export type ConditionsType = {
  [key: string]: any
}

export type OnConditionsChangeReturnValue<C> = Partial<UnwrapNestedRefs<C>> & ConditionsType

export type OnConditionsChangeContext<O> = (
  newConditions: OnConditionsChangeReturnValue<O>,
  oldConditions: OnConditionsChangeReturnValue<O>
) => void

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
  execute: (throwOnFailed?: boolean) => Promise<any>
  resetConditions: VoidFunction
  onConditionsChange: (fn: OnConditionsChangeContext<O>) => void
  onFetchSuccess: (fn: (response: any) => void) => void
  onFetchError: (fn: (error: any) => void) => void
  onFetchFinally: (fn: (error: any) => void) => void
}
