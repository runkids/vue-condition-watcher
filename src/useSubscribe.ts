export function useSubscribe<T = any>() {
  const fns: Array<(param: T) => void> = []
  const on = (fn: (param: T) => void) => {
    fns.push(fn)
  }

  const trigger = (param: T) => {
    fns.forEach((fn) => fn(param))
  }

  return {
    on,
    trigger,
  }
}
