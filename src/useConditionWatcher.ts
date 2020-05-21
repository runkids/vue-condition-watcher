import { reactive, toRefs, ref, watch, watchEffect, Ref } from 'vue'
import { ConditionsType } from './types'
import { filterNoneValueObject, createParams } from './utils'

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
  data: Ref<any[]>
  refresh: Ref<() => void>
  error: Ref<any | null>
}

export default function useConditionWatcher<T extends Config>(
  config: T
): ResultInterface {
  const _conditions = reactive(config.conditions)
  const loading = ref(false)
  const data = ref([])
  const error = ref(null)
  const refresh = ref(() => {})

  watchEffect(() => {
    const conditions2Object: ConditionsType = { ..._conditions }
    let customConditions: ConditionsType = {}
    const cloneDeepCondition: ConditionsType = JSON.parse(
      JSON.stringify(conditions2Object)
    )

    if (typeof config.beforeFetch === 'function') {
      customConditions = config.beforeFetch(cloneDeepCondition)
    }

    const validateCustomConditions = Object.keys(customConditions).length !== 0

    /*
     * if custom conditions has value, just use custom conditions
     * filterNoneValueObject will filter no value like [] , '', null, undefined
     * example. {name: '', items: [], age: 0, tags: null}
     * return result will be {age: 0}
     */

    const finalCondition = filterNoneValueObject(
      validateCustomConditions ? customConditions : conditions2Object
    )

    const params = createParams(finalCondition, config.defaultParams)

    const {
      loading: fetchDataLoading,
      result: fetchDataResult,
      error: fetchDataError,
      use: fetchData,
    } = useFetchData(() => config.fetcher(params))

    refresh.value = fetchData

    fetchData()

    watch([fetchDataResult, fetchDataError, fetchDataLoading], (values) => {
      data.value = values[0]
      error.value = values[1]
      loading.value = values[2] as boolean
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
