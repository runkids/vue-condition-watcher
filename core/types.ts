import { Ref, UnwrapNestedRefs } from 'vue-demi'
import { Cache, HistoryOptions } from 'vue-condition-watcher/_internal'

export type VoidFn = () => void
export type Conditions<T> = {
  [K in keyof T]: T[K]
}

export type OnConditionsChangeReturnValue<C> = Partial<UnwrapNestedRefs<C>>

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

export interface Config<Cond = Record<string, any>, Result = unknown, AfterFetchResult = Result> {
  fetcher: (...args: any) => Promise<Result>
  conditions?: Cond
  defaultParams?: Record<string, any>
  immediate?: boolean
  manual?: boolean
  initialData?: any
  history?: HistoryOptions<keyof Cond>
  pollingInterval?: number | Ref<number>
  pollingWhenHidden?: boolean
  pollingWhenOffline?: boolean
  revalidateOnFocus?: boolean
  cacheProvider?: () => Cache<any>
  beforeFetch?: (conditions: Partial<Cond>, cancel: VoidFn) => Promise<Partial<Cond>> | Partial<Cond>
  afterFetch?: (
    data: Result
  ) => Promise<AfterFetchResult extends Result ? Result : AfterFetchResult> | AfterFetchResult extends Result
    ? Result
    : AfterFetchResult
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface UseConditionWatcherReturn<Cond, Result> {
  conditions: UnwrapNestedRefs<Cond>
  readonly isFetching: Ref<boolean>
  readonly loading: Ref<boolean>
  readonly data: Readonly<Ref<Result | undefined>>
  readonly error: Ref<any | undefined>
  execute: (throwOnFailed?: boolean) => void
  mutate: Mutate
  resetConditions: (conditions?: object) => void
  onConditionsChange: (fn: OnConditionsChangeContext<Cond>) => void
  onFetchSuccess: (fn: (response: any) => void) => void
  onFetchError: (fn: (error: any) => void) => void
  onFetchFinally: (fn: (error: any) => void) => void
}
