import { reactive, toRefs, ref, watch, Ref, watchEffect, inject, InjectionKey } from 'vue'
import { ConditionsType } from './types'
import { filterNoneValueObject, createParams, createQueryString, syncQuery2Conditions } from './utils'
import clone from 'rfdc'
import { Router } from 'vue-router'

type FetcherType = (params: ConditionsType) => Promise<any>
type ProvideKeyName<T> = InjectionKey<T> | string

interface QueryOptions<T> {
  sync?: ProvideKeyName<T>
  ignore?: string[]
}

interface Config {
  fetcher: FetcherType
  conditions: ConditionsType
  defaultParams?: ConditionsType
  beforeFetch?: (conditions: ConditionsType) => ConditionsType
}

interface ResultInterface {
  conditions: { [x: string]: any }
  loading: Ref<boolean | false>
  data: Ref<any | null>
  refresh: Ref<() => void>
  error: Ref<any | null>
}

export default function useConditionWatcher<T extends Config, E extends QueryOptions<E>>(
  config: T,
  queryOptions?: E
): ResultInterface {
  let router: Router
  const _conditions = reactive(config.conditions)
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  const refresh = ref(() => {})
  const query = ref({})
  const completeInitialConditions = ref(false)

  const fetch = (conditions: ConditionsType) => {
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

  watchEffect(
    (onInvalidate) => {
      if (!completeInitialConditions.value) return
      const conditions2Object: ConditionsType = { ..._conditions }
      let customConditions: ConditionsType = {}
      const deepCopyCondition: ConditionsType = clone({ proto: true })(conditions2Object)

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

      fetch(finalConditions)

      onInvalidate(() => {
        //todo cancel promise
      })
    },
    {
      flush: 'pre',
    }
  )

  if (
    queryOptions &&
    (typeof queryOptions.sync === 'string' || typeof queryOptions.sync === 'function') &&
    queryOptions.sync.length
  ) {
    router = inject(queryOptions.sync)
    if (router && router.isReady && router.isReady()) {
      // do once when created
      syncQuery2Conditions(_conditions, router.currentRoute.value.query)
      // watch query changed
      watch(query, async () => {
        const path: string = router.currentRoute.value.path
        const queryString = createQueryString(query.value, queryOptions.ignore || [])
        await router.push(path + '?' + queryString)
      })
    } else {
      throw new ReferenceError('[vue-condition-watcher] Could not found vue-router instance.')
    }
  }

  //sync query object before fetch
  completeInitialConditions.value = true

  return {
    conditions: _conditions,
    loading,
    data,
    refresh,
    error,
  }
}

function useFetchData<T>(fetcher: () => Promise<T>) {
  const state = reactive({
    loading: false,
    error: null,
    result: null,
  })

  let lastPromise: Promise<T>
  const use = async () => {
    state.error = null
    state.loading = true
    const promise = (lastPromise = fetcher())
    try {
      const result = await promise
      if (lastPromise === promise) {
        state.result = result
      }
    } catch (e) {
      state.error = e
    } finally {
      state.loading = false
    }
  }

  return {
    ...toRefs(state),
    use,
  }
}
