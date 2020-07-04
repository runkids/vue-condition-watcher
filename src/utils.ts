import { ConditionsType } from './types'

declare global {
  interface ObjectConstructor {
    fromEntries(xs: [string | number | symbol, any][]): object
  }
}

const fromEntries = (xs: [string | number | symbol, any][]) =>
  Object.fromEntries ? Object.fromEntries(xs) : xs.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

export function createParams(conditions: ConditionsType, defaultParams?: ConditionsType): ConditionsType {
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

export function filterNoneValueObject(object: ConditionsType): ConditionsType {
  return fromEntries(
    Object.entries(object).filter((item) => {
      const value: any = item[1]
      return typeof value !== 'undefined' && value !== null && value !== '' && value.length !== 0
    })
  )
}

export function stringifyQuery(params: ConditionsType, ignoreKeys?: string[]): string {
  const esc = encodeURIComponent
  return Object.entries(params)
    .filter(
      ([key, value]: [string, unknown]): boolean =>
        typeof value !== 'undefined' &&
        value !== null &&
        value !== '' &&
        (Array.isArray(value) ? value.length !== 0 : true) &&
        (ignoreKeys && ignoreKeys.length ? !ignoreKeys.includes(key) : true)
    )
    .map(([key, value]) => {
      return esc(key) + (value != null ? '=' + esc(value) : '')
    })
    .join('&')
}

export function syncQuery2Conditions(conditions: ConditionsType, query: ConditionsType): void {
  const conditions2Object = { ...conditions }
  const noQuery = Object.keys(query).length === 0
  Object.keys(conditions2Object).forEach((key) => {
    if (key in query || noQuery) {
      if (conditions2Object[key] instanceof Date) {
        conditions[key] = noQuery ? null : new Date(query[key])
        return
      }
      conditions[key] = Array.isArray(conditions2Object[key])
        ? noQuery || !query[key].length
          ? []
          : query[key].split(',')
        : typeof conditions2Object[key] === 'number'
        ? noQuery
          ? 0
          : +query[key]
        : noQuery
        ? ''
        : query[key]
    }
  })
}
