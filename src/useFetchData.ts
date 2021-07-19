import { reactive, toRefs } from 'vue-demi'

export function useFetchData<T>(fetcher: () => Promise<T>): any {
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
