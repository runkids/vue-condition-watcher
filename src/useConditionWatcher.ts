import { reactive, toRefs, ref, watch, Ref, watchEffect } from 'vue'
import { ConditionsType } from './types'
import { filterNoneValueObject, createParams } from './utils'
import clone from 'rfdc'

type FetcherType = (params: ConditionsType) => Promise<any>

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

export default function useConditionWatcher<T extends Config>(config: T): ResultInterface {
  const _conditions = reactive(config.conditions)
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  const refresh = ref(() => {})

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

  watchEffect((onInvalidate) => {
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

    const finalConditions: ConditionsType = filterNoneValueObject(
      validateCustomConditions ? customConditions : conditions2Object
    )

    const fetchParams = createParams(finalConditions, config.defaultParams)

    fetch(fetchParams)

    onInvalidate(() => {
      //todo cancel promise
    })
  })

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
