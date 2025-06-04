type ConditionsType = Record<string, any>

declare global {
  interface ObjectConstructor {
    fromEntries(xs: [string | number | symbol, any][]): Record<string, unknown>
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

export function stringifyQuery(params: ConditionsType, ignoreKeys?: any[]): string {
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

export function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

export function syncQuery2Conditions(
  conditions: ConditionsType,
  query: ConditionsType,
  backupIntiConditions: ConditionsType
): void {
  const conditions2Object = { ...conditions }
  const noQuery = Object.keys(query).length === 0
  Object.keys(conditions2Object).forEach((key) => {
    if (key in query || noQuery) {
      const conditionType = typeOf(conditions2Object[key])
      switch (conditionType) {
        case 'date':
          conditions[key] = noQuery ? '' : new Date(query[key])
          break
        case 'array':
          conditions[key] =
            noQuery || !query[key].length ? [] : typeOf(query[key]) === 'string' ? query[key].split(',') : query[key]

          if (backupIntiConditions[key].length && conditions[key].length) {
            let originArrayValueType = typeOf(backupIntiConditions[key][0])
            conditions[key] = conditions[key].map((v: any) => {
              switch (originArrayValueType) {
                case 'number':
                  return Number(v)
                case 'date':
                  return new Date(v)
                case 'boolean':
                  return v === 'true'
                default:
                  return String(v)
              }
            })
          }
          break
        case 'string':
          conditions[key] = noQuery ? '' : String(query[key])
          break
        case 'number':
          conditions[key] = noQuery ? 0 : Number(query[key])
          break
        case 'boolean':
          conditions[key] = noQuery ? '' : Boolean(query[key])
          break
        default:
          conditions[key] = noQuery ? '' : query[key]
          break
      }
    }
  })
}

export function isEquivalentString(a: ConditionsType, b: ConditionsType, ignore: string[]) {
  return stringifyQuery(a, ignore) === stringifyQuery(b, ignore)
}

export function isEquivalent(x: any, y: any) {
  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y
  }
  if (x.constructor !== y.constructor) {
    return false
  }
  if (x instanceof Function) {
    return x === y
  }
  if (x instanceof RegExp) {
    return x === y
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false
  }
  if (x instanceof Date) {
    return false
  }
  if (!(x instanceof Object)) {
    return false
  }
  if (!(y instanceof Object)) {
    return false
  }
  let p = Object.keys(x)
  return (
    Object.keys(y).every((i) => {
      return p.indexOf(i) !== -1
    }) &&
    p.every((i) => {
      return isEquivalent(x[i], y[i])
    })
  )
}

export function deepClone(obj): any {
  if (obj === null) return null
  let clone = Object.assign({}, obj)
  Object.keys(clone).forEach((key) => {
    if (obj[key] instanceof Date) {
      const original = obj[key]
      clone[key] = new Date(original)
      return
    }
    clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]
  })
  return Array.isArray(obj) && obj.length
    ? (clone.length = obj.length) && Array.from(clone)
    : Array.isArray(obj)
    ? Array.from(obj)
    : clone
}

export function sortObject(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key]
      return obj
    }, {})
}

export function pick(obj: Record<string, any>, keys: string[]) {
  const res = {}
  keys.forEach((key) => {
    if (key in obj) {
      res[key] = obj[key]
    }
  })
  return res
}

