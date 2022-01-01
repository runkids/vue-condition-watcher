import { reactive, ref, watch, inject, onMounted, onUnmounted } from 'vue-demi'
import { Config, QueryOptions, UseConditionWatcherReturn, Conditions, UnwrapNestedRefs } from './types'
import {
  filterNoneValueObject,
  createParams,
  stringifyQuery,
  syncQuery2Conditions,
  isEquivalent,
  deepClone,
  containsProp,
} from './utils'
import Queue from './queue'
import { useParseQuery } from './useParseQuery'
import { useSubscribe } from './useSubscribe'

export default function useConditionWatcher<O extends object, K extends keyof O>(
  config: Config<O>,
  queryOptions?: QueryOptions<K>
): UseConditionWatcherReturn<O> {
  function isFetchConfig(obj: object): obj is Config<O> {
    return containsProp(
      obj,
      'fetcher',
      'conditions',
      'defaultParams',
      'initialData',
      'immediate',
      'beforeFetch',
      'afterFetch',
      'onFetchError'
    )
  }

  let watcherConfig: Config<O> = {
    fetcher: config.fetcher,
    conditions: config.conditions,
    immediate: true,
    initialData: null,
  }

  if (isFetchConfig(config)) {
    watcherConfig = { ...watcherConfig, ...config }
  }

  let router = null

  const backupIntiConditions = deepClone(watcherConfig.conditions)
  const _conditions = reactive<O>(watcherConfig.conditions)

  const isFinished = ref(false)
  const isFetching = ref(false)

  const data = ref(watcherConfig.initialData || null)
  const error = ref(null)
  const query = ref({})

  const conditionEvent = useSubscribe<any>()

  if (queryOptions && typeof queryOptions.sync === 'string' && queryOptions.sync.length) {
    router = inject(queryOptions.sync)
    if (!router) {
      throw new ReferenceError(
        `[vue-condition-watcher] Could not found vue-router instance. Please check key: ${queryOptions.sync} is right!`
      )
    }
  }

  const resetConditions = (): void => {
    Object.assign(_conditions, backupIntiConditions)
  }

  const loading = (isLoading: boolean): void => {
    isFetching.value = isLoading
    isFinished.value = !isLoading
  }

  const syncConditionsByQuery = () => {
    const { query: initQuery } = useParseQuery()
    syncQuery2Conditions(_conditions, Object.keys(initQuery).length ? initQuery : backupIntiConditions)
  }

  const conditionChangeHandler = async (conditions) => {
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
          data.value = responseData
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
          return reject(fetchError)
        })
        .finally(() => {
          loading(false)
        })
    })
  }

  const execute = () => Queue.enqueue(() => conditionChangeHandler({ ..._conditions }))

  if (router) {
    // initial conditions by window.location.search. just do once.
    syncConditionsByQuery()
    // watch query changed to push
    watch(
      query,
      async () => {
        const path: string = router.currentRoute.value ? router.currentRoute.value.path : router.currentRoute.path
        const queryString = stringifyQuery(query.value, queryOptions.ignore)
        const location = path + '?' + queryString
        const navigation = () =>
          queryOptions.navigation === 'replace' ? router.replace(location) : router.push(location)
        await navigation().catch((e) => e)
      },
      { deep: true }
    )

    onMounted(() => {
      window.addEventListener('popstate', syncConditionsByQuery)
    })
    onUnmounted(() => {
      window.removeEventListener('popstate', syncConditionsByQuery)
    })
  }

  if (watcherConfig.immediate === true) {
    setTimeout(execute, 0)
  }

  watch(
    () => ({ ..._conditions }),
    (nc, oc) => {
      if (isEquivalent(nc, oc)) return
      conditionEvent.trigger([deepClone(nc), deepClone(oc)])
      Queue.enqueue(() => conditionChangeHandler(nc))
    }
  )

  return {
    conditions: _conditions as UnwrapNestedRefs<O>,
    loading: isFetching,
    data,
    error,
    execute,
    resetConditions,
    onConditionsChange: conditionEvent.on,
  }
}
