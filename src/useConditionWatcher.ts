import { reactive, ref, watch, inject, onMounted, onUnmounted } from 'vue-demi'
import { ConditionsType, Config, QueryOptions, ResultInterface } from './types'
import {
  filterNoneValueObject,
  createParams,
  stringifyQuery,
  syncQuery2Conditions,
  isEquivalent,
  deepClone,
} from './utils'
import { useFetchData } from './useFetchData'
import { useParseQuery } from './useParseQuery'

export default function useConditionWatcher<T extends Config, E extends QueryOptions<E>>(
  config: T,
  queryOptions?: E
): ResultInterface {
  let router = null
  const backupIntiConditions = deepClone(config.conditions)
  const _conditions = reactive(config.conditions)
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  const refresh = ref(() => {})
  const query = ref({})
  const completeInitialConditions = ref(false)

  const syncConditionsByQuery = () => {
    const { query: initQuery } = useParseQuery()
    syncQuery2Conditions(_conditions, Object.keys(initQuery).length ? initQuery : backupIntiConditions)
    completeInitialConditions.value = true
  }

  const fetch = (conditions: ConditionsType): void => {
    const { loading: fetchLoading, result: fetchResult, error: fetchError, use: fetchData } = useFetchData(() =>
      config.fetcher(conditions)
    )

    refresh.value = fetchData
    loading.value = true

    fetchData()

    watch([fetchResult, fetchError, fetchLoading], (values) => {
      data.value = values[0]
      error.value = values[1]
      loading.value = values[2] as boolean
    })
  }

  const conditionChangeHandler = (conditions) => {
    const conditions2Object: ConditionsType = conditions
    let customConditions: ConditionsType = {}
    const deepCopyCondition: ConditionsType = deepClone(conditions2Object)

    if (typeof config.beforeFetch === 'function') {
      customConditions = config.beforeFetch(deepCopyCondition)
      if (!customConditions || typeof customConditions !== 'object' || customConditions.constructor !== Object) {
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
    const finalConditions: ConditionsType = createParams(query.value, config.defaultParams)

    if (!completeInitialConditions.value) return
    fetch(finalConditions)
  }

  watch(
    () => ({ ..._conditions }),
    (nc, oc) => {
      if (completeInitialConditions.value && isEquivalent(nc, oc)) return
      conditionChangeHandler(nc)
    }
  )

  if (queryOptions && typeof queryOptions.sync === 'string' && queryOptions.sync.length) {
    router = inject(queryOptions.sync)
    if (router) {
      // initial conditions by window.location.search. just do once.
      syncConditionsByQuery()
      conditionChangeHandler({ ..._conditions })
      // watch query changed to push
      watch(query, async () => {
        const path: string = router.currentRoute.value ? router.currentRoute.value.path : router.currentRoute.path
        const queryString = stringifyQuery(query.value, queryOptions.ignore || [])
        await router.push(path + '?' + queryString).catch((e) => e)
      })

      onMounted(() => {
        window.addEventListener('popstate', syncConditionsByQuery)
      })
      onUnmounted(() => {
        window.removeEventListener('popstate', syncConditionsByQuery)
      })
    } else {
      throw new ReferenceError(
        `[vue-condition-watcher] Could not found vue-router instance. Please check key: ${queryOptions.sync} is right!`
      )
    }
  } else {
    completeInitialConditions.value = true
    conditionChangeHandler({ ..._conditions })
  }

  return {
    conditions: _conditions,
    loading,
    data,
    refresh,
    error,
  }
}
