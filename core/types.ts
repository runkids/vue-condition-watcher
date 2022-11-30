import { Cache, HistoryOptions } from 'vue-condition-watcher/_internal'
import { Ref, UnwrapNestedRefs } from 'vue-demi'

export type { HistoryOptions }

export type VoidFn = () => void
export type Conditions<T> = {
  [K in keyof T]: T[K]
}
export type FinalResult<Result, AfterFetchResult> =
  | Promise<AfterFetchResult extends Result ? Result : AfterFetchResult>
  | AfterFetchResult extends Result
  ? Result
  : AfterFetchResult

export type OnConditionsChangeReturnValue<C> = Partial<UnwrapNestedRefs<C>>

export type OnConditionsChangeContext<O> = (
  newConditions: OnConditionsChangeReturnValue<O>,
  oldConditions: OnConditionsChangeReturnValue<O>
) => void

export interface OnFetchErrorContext<T = any, E = any> {
  error: E
  data: T | null
}

type MutateFunction<T> = (arg: (oldData: T) => any) => void
type MutateData = (newData: any) => void
export interface Mutate<T> extends MutateFunction<T>, MutateData {}

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
  beforeFetch?: (
    conditions: Partial<Cond> & Record<string, any>,
    cancel: VoidFn
  ) => Promise<Record<string, any>> | Record<string, any>
  afterFetch?: (data: Result) => FinalResult<Result, AfterFetchResult>
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface UseConditionWatcherReturn<Cond, Result> {
  conditions: UnwrapNestedRefs<Cond>
  readonly isFetching: Ref<boolean>
  readonly isLoading: Ref<boolean>
  readonly data: Readonly<Ref<Result | undefined>>
  readonly error: Ref<any | undefined>
  execute: (throwOnFailed?: boolean) => void
  mutate: Mutate<Result>
  resetConditions: (conditions?: object) => void
  onConditionsChange: (fn: OnConditionsChangeContext<Cond>) => void
  onFetchSuccess: (fn: (response: any) => void) => void
  onFetchError: (fn: (error: any) => void) => void
  onFetchFinally: (fn: (error: any) => void) => void
}
