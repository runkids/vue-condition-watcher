import { Ref, UnwrapNestedRefs } from 'vue-demi'

export type ConditionsType = {
  [key: string]: any
}

export type Fn = () => void

export type Conditions<T> = {
  [K in keyof T]: T[K]
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

type MutateData = (newData: any) => void
type MutateFunction = (arg: (oldData: any) => any) => void
export interface Mutate extends MutateData, MutateFunction {}

export interface HistoryOptions<K> {
  sync: {
    currentRoute: any
    replace: (string) => any
    push: (string) => any
  }
  navigation?: 'push' | 'replace'
  ignore?: Array<K>
}

export interface Config<O, K> {
  fetcher: (params: object) => Promise<any>
  conditions?: O
  defaultParams?: object
  immediate?: boolean
  manual?: boolean
  initialData?: any
  history?: HistoryOptions<K>
  pollingInterval?: number | Ref<number>
  pollingWhenHidden?: boolean
  pollingWhenOffline?: boolean
  revalidateOnFocus?: boolean
  beforeFetch?: (conditions: O & ConditionsType, cancel: Fn) => ConditionsType
  afterFetch?: (data: any) => any
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface UseConditionWatcherReturn<O> {
  conditions: UnwrapNestedRefs<O>
  readonly loading: Ref<boolean | false>
  readonly data: Ref<any | null>
  readonly error: Ref<any | null>
  execute: (throwOnFailed?: boolean) => void
  mutate: Mutate
  resetConditions: VoidFunction
  onConditionsChange: (fn: OnConditionsChangeContext<O>) => void
  onFetchSuccess: (fn: (response: any) => void) => void
  onFetchError: (fn: (error: any) => void) => void
  onFetchFinally: (fn: (error: any) => void) => void
}
