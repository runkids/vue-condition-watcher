import { Cache, HistoryOptions } from 'vue-condition-watcher/_internal'
import { Ref, UnwrapNestedRefs } from 'vue-demi'

export type { HistoryOptions }

export type VoidFn = () => void
export type Conditions<T> = {
  [K in keyof T]: T[K]
}
export type FinalResult<ResponseT, TransformedT> =
  | Promise<TransformedT extends ResponseT ? ResponseT : TransformedT>
  | (TransformedT extends ResponseT ? ResponseT : TransformedT)

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

export interface Config<ConditionT = Record<string, any>, ResponseT = unknown, TransformedT = ResponseT> {
  /**
   * Function used to fetch data.
   */
  fetcher: (...args: any) => Promise<ResponseT>
  /**
   * Conditions that trigger fetching.
   */
  conditions?: ConditionT
  defaultParams?: Record<string, any>
  immediate?: boolean
  manual?: boolean
  initialData?: any
  history?: HistoryOptions<keyof ConditionT>
  pollingInterval?: number | Ref<number>
  pollingWhenHidden?: boolean
  pollingWhenOffline?: boolean
  revalidateOnFocus?: boolean
  cacheProvider?: () => Cache<any>
  /**
   * Time-to-live in milliseconds for cache entries.
   */
  cacheTtl?: number
  beforeFetch?: (
    conditions: Partial<ConditionT> & Record<string, any>,
    cancel: VoidFn
  ) => Promise<Record<string, any>> | Record<string, any>
  afterFetch?: (data: ResponseT) => FinalResult<ResponseT, TransformedT>
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface UseConditionWatcherReturn<ConditionT, DataT> {
  conditions: UnwrapNestedRefs<ConditionT>
  readonly isFetching: Ref<boolean>
  readonly isLoading: Ref<boolean>
  readonly data: Readonly<Ref<DataT | undefined>>
  readonly error: Ref<any | undefined>
  execute: (throwOnFailed?: boolean) => void
  mutate: Mutate<DataT>
  resetConditions: (conditions?: object) => void
  onConditionsChange: (fn: OnConditionsChangeContext<ConditionT>) => void
  onFetchSuccess: (fn: (response: any) => void) => void
  onFetchError: (fn: (error: any) => void) => void
  onFetchFinally: (fn: (error: any) => void) => void
}
