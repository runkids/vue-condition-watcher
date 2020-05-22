import { ConditionsType } from './types'

declare global {
  interface ObjectConstructor {
    fromEntries(xs: [string | number | symbol, any][]): object
  }
}

const fromEntries = (xs: [string | number | symbol, any][]) =>
  Object.fromEntries ? Object.fromEntries(xs) : xs.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

export function createParams(conditions: ConditionsType, defaultParams: ConditionsType): ConditionsType {
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
