import { reactive, toRefs, ref, watch, watchEffect } from 'vue'

export default function useConditionWatcher({
  fetcher,
  conditions,
  defaultParams = {},
  beforeFetchData = (params: object) => params,
}) {
  const _conditions = reactive(conditions)
  const loading = ref(false)
  const data = ref([])
  const error = ref(null)
  const refresh = ref(() => {})

  if (typeof beforeFetchData !== 'function') {
    throw new Error(
      `[useConditionWatcher]: argument has to be function, but received ${typeof beforeFetchData}`
    )
  }

  watchEffect(() => {
    const conditions2Object: object = { ..._conditions }
    const cloneDeepCondition: object = JSON.parse(
      JSON.stringify(conditions2Object)
    )
    const customConditions: object = beforeFetchData(cloneDeepCondition)

    if (
      !customConditions ||
      typeof customConditions !== 'object' ||
      customConditions.constructor !== Object
    ) {
      throw new Error(
        `[useConditionWatcher]: beforeFetchData return value should to be an object`
      )
    }

    const validateCustomConditions =
      Object.keys(customConditions).length !== 0 &&
      customConditions.constructor === Object

    // if custom conditions has value, just use custom conditions
    // filterNoneValueObject will filter no value like [] , '', null, undefined
    // example. {name: '', items: [], age: 0, tags: null}
    // return result will be {age: 0}
    const finalCondition = filterNoneValueObject(
      validateCustomConditions ? customConditions : conditions2Object
    )

    const params = createParams(finalCondition, defaultParams)

    const {
      loading: fetchDataLoading,
      result: fetchDataResult,
      error: fetchDataError,
      use: fetchData,
    } = useFetchData(() => fetcher(params))

    refresh.value = fetchData

    fetchData()

    watch([fetchDataResult, fetchDataLoading, fetchDataError], (values) => {
      data.value = values[0]
      loading.value = values[1]
      error.value = values[2]
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

function useFetchData(fetcher) {
  const state = reactive({
    loading: false,
    error: null,
    result: null,
  })

  let lastPromise
  const use = async (...args:any) => {
    state.error = null
    state.loading = true
    const promise = (lastPromise = fetcher(...args))
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

function createParams(conditions, defaultParams) {
  const _conditions = {
    ...conditions,
    ...defaultParams,
  }

  Object.entries(_conditions).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      _conditions[key] = value.join(',')
    }
  })
  return _conditions
}

function filterNoneValueObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter((item) => {
      const value: any = item[1]
      return (
        typeof value !== 'undefined' &&
        value !== null &&
        value !== '' &&
        value.length !== 0
      )
    })
  )
}
