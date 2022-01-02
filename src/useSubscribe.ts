// These function inspired from VueUse's `createEventHook`

export function useSubscribe() {
  const fns: Array<(...args) => void> = []
  const on = (fn: (...args) => void) => {
    fns.push(fn)
  }

  const trigger = (...args) => {
    fns.forEach((fn) => fn(...args))
  }

  return {
    on,
    trigger,
  }
}
