import { reactive, ref, watch, readonly, UnwrapNestedRefs, onUnmounted, watchEffect, unref, isRef } from 'vue-demi'
import { Config, UseConditionWatcherReturn, Conditions, Mutate } from './types'
import { usePromiseQueue } from './hooks/usePromiseQueue'
import { useHistory } from './hooks/useHistory'
import { createEvents } from './utils/createEvents'
import { filterNoneValueObject, createParams, syncQuery2Conditions, isEquivalent, deepClone } from './utils/common'
import { containsProp, isServer, rAF } from './utils/helper'

export default function useConditionWatcher<O extends object, K extends keyof O>(
  config: Config<O, K>
): UseConditionWatcherReturn<O> {
  function isFetchConfig(obj: object): obj is Config<O, K> {
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
  let watcherConfig: Config<O, K> = {
    fetcher: config.fetcher,
    conditions: config.conditions,
    immediate: true,
    manual: false,
    initialData: null,
    pollingInterval: isRef(config.pollingInterval) ? config.pollingInterval : ref(config.pollingInterval || 0),
    pollingWhenHidden: false,
    pollingWhenOffline: false,
    revalidateOnFocus: false,
  }

  // update config
  if (isFetchConfig(config)) {
    watcherConfig = { ...watcherConfig, ...config }
  }

  const backupIntiConditions = deepClone(watcherConfig.conditions)
  const _conditions = reactive<O>(watcherConfig.conditions)

  const isFinished = ref(false)
  const isFetching = ref(false)
  const isOnline = ref(true)
  const isActive = ref(true)

  const data = ref(watcherConfig.initialData || null)
  const error = ref(null)
  const query = ref({})

  const pollingTimer = ref()

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

  const resetConditions = (): void => {
    Object.assign(_conditions, backupIntiConditions)
  }

  const loading = (isLoading: boolean): void => {
    isFetching.value = isLoading
    isFinished.value = !isLoading
  }

  const conditionsChangeHandler = async (conditions, throwOnFailed = false) => {
    const checkThrowOnFailed = typeof throwOnFailed === 'boolean' ? throwOnFailed : false
    if (isFetching.value) return
    loading(true)
    error.value = null
    const conditions2Object: Conditions<O> = conditions
    let customConditions: object = {}
    const deepCopyCondition: Conditions<O> = deepClone(conditions2Object)

    if (typeof watcherConfig.beforeFetch === 'function') {
      let isCanceled = false
      customConditions = await watcherConfig.beforeFetch(deepCopyCondition, () => {
        isCanceled = true
      })
      if (isCanceled) {
        loading(false)
        return Promise.resolve(null)
      }
      if (!customConditions || typeof customConditions !== 'object' || customConditions.constructor !== Object) {
        loading(false)
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
    const finalConditions: object = createParams(query.value, watcherConfig.defaultParams)

    let responseData: any = null

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
          data.value = responseData
          responseEvent.trigger(responseData)
          return resolve(fetchResponse)
        })
        .catch(async (fetchError) => {
          if (typeof watcherConfig.onFetchError === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;({ data: responseData, error: fetchError } = await watcherConfig.onFetchError({
              data: null,
              error: fetchError,
            }))
            data.value = responseData || watcherConfig.initialData
            error.value = fetchError
          }
          errorEvent.trigger(fetchError)
          if (checkThrowOnFailed) {
            return reject(fetchError)
          }
          return resolve(null)
        })
        .finally(() => {
          loading(false)
          finallyEvent.trigger()
          // - Start polling with out setting to manual
          if (watcherConfig.manual) return
          polling()
        })
    })
  }

  const revalidate = (throwOnFailed = false) =>
    enqueue(() => conditionsChangeHandler({ ..._conditions }, throwOnFailed))

  function execute(throwOnFailed = false) {
    if (!data || isServer) {
      revalidate(throwOnFailed)
    } else {
      // Delay the revalidate if we have data to return so we won't block
      rAF(() => revalidate(throwOnFailed))
    }
  }

  function polling() {
    if (pollingTimer.value) return

    watchEffect((onCleanup) => {
      if (unref(watcherConfig.pollingInterval)) {
        pollingTimer.value = (() => {
          let timerId = null
          function next() {
            const interval = unref(watcherConfig.pollingInterval)
            if (interval && timerId !== -1) {
              timerId = setTimeout(nun, interval)
            }
          }
          function nun() {
            // Only run when the page is visible, online and not errored.
            if (
              !error.value &&
              (watcherConfig.pollingWhenHidden || isActive.value) &&
              (watcherConfig.pollingWhenOffline || isOnline.value)
            ) {
              revalidate().then(next)
            } else {
              next()
            }
          }
          next()
          return () => timerId && clearTimeout(timerId)
        })()
      }

      onCleanup(() => {
        pollingTimer.value && pollingTimer.value()
      })
    })
  }

  // - mutate: Modify `data` directly
  // - `data` is read only by default, recommend modify `data` at `afterFetch`
  // - When you need to modify `data`, you can use mutate() to directly modify data
  const mutate = <Mutate>((newData) => (data.value = newData))

  // - History mode base on vue-router
  if (isHistoryOption()) {
    const historyOption = {
      sync: config.history.sync,
      ignore: config.history.ignore || [],
      navigation: config.history.navigation || 'push',
      listener(parsedQuery) {
        const queryObject = Object.keys(parsedQuery).length ? parsedQuery : backupIntiConditions
        syncQuery2Conditions(_conditions, queryObject)
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
    if (isHistoryOption()) {
      //todo sync query.value
    }
  })

  if (!watcherConfig.revalidateOnFocus) {
    stopFocusEvent()
    stopSubscribeFocus.off()
  }

  onUnmounted(() => {
    pollingTimer.value && pollingTimer.value()
    stopFocusEvent()
    stopReconnectEvent()
    stopVisibilityEvent()
  })

  return {
    conditions: _conditions as UnwrapNestedRefs<O>,
    loading: readonly(isFetching),
    data: readonly(data),
    error: readonly(error),
    execute,
    mutate,
    resetConditions,
    onConditionsChange: conditionEvent.on,
    onFetchSuccess: responseEvent.on,
    onFetchError: errorEvent.on,
    onFetchFinally: finallyEvent.on,
  }
}
