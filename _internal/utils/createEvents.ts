/* eslint-disable @typescript-eslint/no-empty-function */
import { hasDocument, hasWindow, isDocumentVisibility } from './helper'

// These function inspired from VueUse's `createEventHook`
function useSubscribe() {
  const fns: Array<(...args) => void> = []

  const off = (fn: (...args) => void) => {
    const index = fns.indexOf(fn)
    if (index !== -1) fns.splice(index, 1)
  }

  const on = (fn: (...args) => void) => {
    fns.push(fn)
    return {
      off: () => off(fn),
    }
  }

  const trigger = (...args) => {
    fns.forEach((fn) => fn(...args))
  }

  return {
    on,
    trigger,
  }
}

let online = true
const hasWin = hasWindow()
const hasDoc = hasDocument()

function createFocusEvent(eventHook) {
  if (hasWin && window.addEventListener) {
    window.addEventListener('focus', eventHook.trigger)
  }
  return () => {
    window.removeEventListener('focus', eventHook.trigger)
  }
}

function createVisibilityEvent(eventHook) {
  const handler = () => eventHook.trigger(isDocumentVisibility())
  if (hasDoc && document.addEventListener) {
    document.addEventListener('visibilitychange', handler)
  }
  return () => {
    document.removeEventListener('visibilitychange', handler)
  }
}

function createReconnectEvent(eventHook) {
  const onOnline = () => {
    online = true
    eventHook.trigger(online)
  }
  // nothing to revalidate, just update the status
  const onOffline = () => {
    online = false
    eventHook.trigger(online)
  }
  if (hasWin && window.addEventListener) {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
  }
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

export function createEvents() {
  const conditionEvent = useSubscribe()
  const responseEvent = useSubscribe()
  const errorEvent = useSubscribe()
  const finallyEvent = useSubscribe()
  const focusEvent = useSubscribe()
  const visibilityEvent = useSubscribe()
  const reconnectEvent = useSubscribe()

  const stopFocusEvent = createFocusEvent(focusEvent)
  const stopVisibilityEvent = createVisibilityEvent(visibilityEvent)
  const stopReconnectEvent = createReconnectEvent(reconnectEvent)

  return {
    conditionEvent,
    responseEvent,
    errorEvent,
    finallyEvent,
    focusEvent,
    reconnectEvent,
    visibilityEvent,
    stopFocusEvent,
    stopReconnectEvent,
    stopVisibilityEvent,
  }
}
