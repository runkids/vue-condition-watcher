// These function inspired from VueUse's `createEventHook`
function useSubscribe() {
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

export function createEvents() {
  const conditionEvent = useSubscribe()
  const responseEvent = useSubscribe()
  const errorEvent = useSubscribe()
  const finallyEvent = useSubscribe()

  return {
    conditionEvent,
    responseEvent,
    errorEvent,
    finallyEvent,
  }
}
