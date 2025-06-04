import { Ref, ref, unref, watchEffect } from 'vue-demi'

/** Configuration for polling behaviour */
export interface PollingOptions {
  interval: number | Ref<number>
  whenHidden?: boolean
  whenOffline?: boolean
  isActive: Ref<boolean>
  isOnline: Ref<boolean>
  error: Ref<any>
  callback: () => Promise<any>
}

/**
 * Handle polling logic separately.
 */
export function usePolling(options: PollingOptions) {
  const timer = ref<() => void>()
  const {
    interval,
    whenHidden = false,
    whenOffline = false,
    isActive,
    isOnline,
    error,
    callback,
  } = options

  watchEffect((onCleanup) => {
    const intv = unref(interval)
    if (intv) {
      timer.value = (() => {
        let id: any = null
        function next() {
          const i = unref(interval)
          if (i && id !== -1) {
            id = setTimeout(run, i)
          }
        }
        function run() {
          if (
            !error.value &&
            (whenHidden || isActive.value) &&
            (whenOffline || isOnline.value)
          ) {
            callback().then(next)
          } else {
            next()
          }
        }
        next()
        return () => id && clearTimeout(id)
      })()
    }

    onCleanup(() => {
      timer.value && timer.value()
    })
  })

  return () => {
    timer.value && timer.value()
  }
}
