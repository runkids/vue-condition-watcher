import { Conditions, Config, Mutate, UseConditionWatcherReturn, VoidFn } from './types'
import {
  UnwrapNestedRefs,
  computed,
  getCurrentInstance,
  isRef,
  onUnmounted,
  reactive,
  readonly,
  ref,
  shallowRef,
  unref,
  watch,
  watchEffect,
} from 'vue-demi'
import { containsProp, isNoData as isDataEmpty, isObject, isServer, rAF } from 'vue-condition-watcher/_internal'
import { createEvents, useCache, useHistory, usePromiseQueue, usePolling, MemoryCache } from 'vue-condition-watcher/_internal'
import {
  createParams,
  deepClone,
  filterNoneValueObject,
  isEquivalent,
  pick,
  syncQuery2Conditions,
} from 'vue-condition-watcher/_internal'

export default function useConditionWatcher<
  ConditionT extends Record<string, any>,
  ResponseT,
  TransformedT = ResponseT
>(
  config: Config<ConditionT, ResponseT, TransformedT>
): UseConditionWatcherReturn<ConditionT, TransformedT extends ResponseT ? ResponseT : TransformedT> {
  function isFetchConfig(obj: Record<string, any>): obj is typeof config {
    return containsProp(
      obj,
      'fetcher',
      'conditions',
      'defaultParams',
      'initialData',
      'manual',
      'immediate',
      'history',
      'pollingInterval',
      'pollingWhenHidden',
      'pollingWhenOffline',
      'revalidateOnFocus',
      'cacheProvider',
      'beforeFetch',
      'afterFetch',
      'onFetchError'
    )
  }

  function isHistoryOption() {
    if (!config.history || !config.history.sync) return false
    return containsProp(config.history, 'navigation', 'ignore', 'sync')
  }

  // default config
  let watcherConfig: typeof config = {
    fetcher: config.fetcher,
    conditions: config.conditions,
    immediate: true,
    manual: false,
    initialData: undefined,
    pollingInterval: isRef(config.pollingInterval) ? config.pollingInterval : ref(config.pollingInterval || 0),
    pollingWhenHidden: false,
    pollingWhenOffline: false,
    revalidateOnFocus: false,
    cacheProvider: () => new MemoryCache(),
    cacheTtl: undefined,
  }

  // update config
  if (isFetchConfig(config)) {
    watcherConfig = { ...watcherConfig, ...config }
  }
  const cache = useCache(watcherConfig.fetcher, watcherConfig.cacheProvider())

  const backupIntiConditions = deepClone(watcherConfig.conditions)
  const _conditions = reactive<ConditionT>(watcherConfig.conditions)

  const isFetching = ref(false)
  const isOnline = ref(true)
  const isActive = ref(true)

  const data = shallowRef(
    cache.cached(backupIntiConditions) ? cache.get(backupIntiConditions) : watcherConfig.initialData || undefined
  )
  const error = ref(undefined)
  const query = ref({})

  let stopPolling: VoidFn = () => {}

  const { enqueue } = usePromiseQueue()
  // - create fetch event & condition event & web event
  const {
    conditionEvent,
    responseEvent,
    errorEvent,
    finallyEvent,
    reconnectEvent,
    focusEvent,
    visibilityEvent,
    stopFocusEvent,
    stopReconnectEvent,
    stopVisibilityEvent,
  } = createEvents()

  const resetConditions = (cond?: Record<string, any>): void => {
    const conditionKeys = Object.keys(_conditions)
    Object.assign(_conditions, isObject(cond) ? pick(cond, conditionKeys) : backupIntiConditions)
  }

  const isLoading = computed(() => !error.value && !data.value)

  const conditionsChangeHandler = async (conditions, throwOnFailed = false) => {
    const checkThrowOnFailed = typeof throwOnFailed === 'boolean' ? throwOnFailed : false
    if (isFetching.value) return
    isFetching.value = true
    error.value = undefined
    const conditions2Object: Conditions<ConditionT> = conditions
    let customConditions: Record<string, any> = {}
    const deepCopyCondition: Conditions<ConditionT> = deepClone(conditions2Object)

    if (typeof watcherConfig.beforeFetch === 'function') {
      let isCanceled = false
      customConditions = await watcherConfig.beforeFetch(deepCopyCondition, () => {
        isCanceled = true
      })
      if (isCanceled) {
        isFetching.value = false
        return Promise.resolve(undefined)
      }
      if (!customConditions || typeof customConditions !== 'object' || customConditions.constructor !== Object) {
        isFetching.value = false
        throw new Error(`[vue-condition-watcher]: beforeFetch should return an object`)
      }
    }

    const validateCustomConditions: boolean = Object.keys(customConditions).length !== 0

    /*
     * if custom conditions has value, just use custom conditions
     * filterNoneValueObject will filter no value like [] , '', null, undefined
     * example. {name: '', items: [], age: 0, tags: null}
     * return result will be {age: 0}
     */
    query.value = filterNoneValueObject(validateCustomConditions ? customConditions : conditions2Object)
    const finalConditions: Record<string, any> = createParams(query.value, watcherConfig.defaultParams)

    let responseData: any = undefined

    data.value = cache.cached(query.value) ? cache.get(query.value) : watcherConfig.initialData || undefined

    return new Promise((resolve, reject) => {
      config
        .fetcher(finalConditions)
        .then(async (fetchResponse) => {
          responseData = fetchResponse
          if (typeof watcherConfig.afterFetch === 'function') {
            responseData = await watcherConfig.afterFetch(fetchResponse)
          }
          if (responseData === undefined) {
            console.warn(`[vue-condition-watcher]: "afterFetch" return value is ${responseData}. Please check it.`)
          }
          if (!isEquivalent(data.value, responseData)) {
            data.value = responseData
          }
          if (!isEquivalent(cache.get(query.value), responseData)) {
            cache.set(query.value, responseData, watcherConfig.cacheTtl)
          }
          responseEvent.trigger(responseData)
          return resolve(fetchResponse)
        })
        .catch(async (fetchError) => {
          if (typeof watcherConfig.onFetchError === 'function') {
            ;({ data: responseData, error: fetchError } = await watcherConfig.onFetchError({
              data: undefined,
              error: fetchError,
            }))
            data.value = responseData || watcherConfig.initialData
            error.value = fetchError
          }
          errorEvent.trigger(fetchError)
          if (checkThrowOnFailed) {
            return reject(fetchError)
          }
          return resolve(undefined)
        })
        .finally(() => {
          isFetching.value = false
          finallyEvent.trigger()
        })
    })
  }

  const revalidate = (throwOnFailed = false) =>
    enqueue(() => conditionsChangeHandler({ ..._conditions }, throwOnFailed))

  function execute(throwOnFailed = false) {
    if (isDataEmpty(data.value) || isServer) {
      revalidate(throwOnFailed)
    } else {
      rAF(() => revalidate(throwOnFailed))
    }
  }

  // - Start polling with out setting to manual
  if (!watcherConfig.manual) {
    stopPolling = usePolling({
      interval: watcherConfig.pollingInterval,
      whenHidden: watcherConfig.pollingWhenHidden,
      whenOffline: watcherConfig.pollingWhenOffline,
      isActive,
      isOnline,
      error,
      callback: () => revalidate(),
    })
  }

  // - mutate: Modify `data` directly
  // - `data` is read only by default, recommend modify `data` at `afterFetch`
  // - When you need to modify `data`, you can use mutate() to directly modify data
  /*
   *  Two way to use mutate
   *  - 1.
   *     mutate(newData)
   *  - 2.
   *     mutate((draft) => {
   *        draft[0].name = 'runkids'
   *        return draft
   *     })
   */
  const mutate = (...args): Mutate<TransformedT extends ResponseT ? ResponseT : TransformedT> => {
    const arg = args[0]
    if (arg === undefined) {
      return data.value
    }
    if (typeof arg === 'function') {
      data.value = arg(deepClone(data.value))
    } else {
      data.value = arg
    }
    cache.set({ ..._conditions }, data.value, watcherConfig.cacheTtl)
    return data.value
  }

  // - History mode base on vue-router
  if (isHistoryOption()) {
    const historyOption = {
      sync: config.history.sync,
      ignore: config.history.ignore || [],
      navigation: config.history.navigation || 'push',
      listener(parsedQuery: Record<string, any>) {
        const queryObject = Object.keys(parsedQuery).length ? parsedQuery : backupIntiConditions
        syncQuery2Conditions(_conditions, queryObject, backupIntiConditions)
      },
    }
    useHistory(query, historyOption)
  }

  // - Automatic data fetching by default
  if (!watcherConfig.manual && watcherConfig.immediate) {
    execute()
  }

  watch(
    () => ({ ..._conditions }),
    (nc, oc) => {
      // - Deep check object if be true do nothing
      if (isEquivalent(nc, oc)) return
      conditionEvent.trigger(deepClone(nc), deepClone(oc))
      // - Automatic data fetching until manual to be false
      !watcherConfig.manual && enqueue(() => conditionsChangeHandler(nc))
    }
  )

  reconnectEvent.on((status: boolean) => {
    isOnline.value = status
  })

  visibilityEvent.on((status: boolean) => {
    isActive.value = status
  })

  const stopSubscribeFocus = focusEvent.on(() => {
    if (!isActive.value) return
    execute()
    // if (isHistoryOption() && cache.cached({ ..._conditions })) {
    //todo sync to query
    // }
  })

  if (!watcherConfig.revalidateOnFocus) {
    stopFocusEvent()
    stopSubscribeFocus.off()
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      stopPolling()
      stopFocusEvent()
      stopReconnectEvent()
      stopVisibilityEvent()
    })
  }

  return {
    conditions: _conditions as UnwrapNestedRefs<ConditionT>,
    data: readonly(data),
    error: readonly(error),
    isFetching: readonly(isFetching),
    isLoading,
    execute,
    mutate,
    resetConditions,
    onConditionsChange: conditionEvent.on,
    onFetchSuccess: responseEvent.on,
    onFetchError: errorEvent.on,
    onFetchFinally: finallyEvent.on,
  }
}
