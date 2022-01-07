export function containsProp(obj: any, ...props: string[]) {
  if (!isObject(obj)) return false
  return props.some((k) => k in obj)
}

const STR_UNDEFINED = 'undefined'

export const hasWindow = () => typeof window != STR_UNDEFINED
export const hasDocument = () => typeof document != STR_UNDEFINED
export const isDocumentVisibility = () => hasDocument() && window?.document?.visibilityState === 'visible'
export const hasRequestAnimationFrame = () => hasWindow() && typeof window['requestAnimationFrame'] != STR_UNDEFINED
export const isNil = (val: unknown) => val === null || val === undefined
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

export const isServer = !hasWindow()
export const rAF = (f: (...args: any[]) => void) =>
  hasRequestAnimationFrame() ? window['requestAnimationFrame'](f) : setTimeout(f, 1)
