import {
  filterNoneValueObject,
  createParams,
  stringifyQuery,
  syncQuery2Conditions,
  isEquivalent,
  deepClone,
  typeOf,
} from 'vue-condition-watcher/_internal'
import { describe, expect, test } from 'vitest'

describe('utils: isEquivalent', () => {
  it(`Check Object Equality`, () => {
    const current = {
      name: '',
      tags: [],
      phone: undefined,
      address: null,
      data: new Date(),
    }
    const old = {
      name: '',
      tags: [],
      phone: undefined,
      address: null,
      data: new Date(),
    }
    expect(isEquivalent(current, old)).toBeTruthy()
  })
})

describe('utils: typeof', () => {
  it(`Is array`, () => {
    expect(typeOf([])).toEqual('array')
  })
  it(`Is date`, () => {
    expect(typeOf(new Date())).toEqual('date')
  })
  it(`Is object`, () => {
    expect(typeOf({})).toEqual('object')
  })
  it(`Is number`, () => {
    expect(typeOf(1)).toEqual('number')
  })
  it(`Is string`, () => {
    expect(typeOf('hi')).toEqual('string')
  })
  it(`Is null`, () => {
    expect(typeOf(null)).toEqual('null')
  })
  it(`Is undefined`, () => {
    expect(typeOf(undefined)).toEqual('undefined')
  })
  it(`Is function`, () => {
    expect(
      typeOf(() => {
        //
      })
    ).toEqual('function')
  })
})

describe('utils: deepClone', () => {
  it(`Check Object deepClone`, () => {
    const current = {
      name: '',
      tags: [],
      phone: undefined,
      address: null,
      data: new Date(),
    }
    const newObj = deepClone(current)
    expect(newObj !== current).toBeTruthy()
    expect(newObj.data !== current.data).toBeTruthy()
  })
})

describe('utils: filterNoneValueObject', () => {
  it(`Should be return empty object`, () => {
    const conditions = {
      name: '',
      tags: [],
      phone: undefined,
      address: null,
    }
    const result = filterNoneValueObject(conditions)

    expect(Object.keys(result).length === 0).toBeTruthy()
  })

  it(`Should be return an object with key: [age]`, () => {
    const conditions = {
      name: '',
      tags: [],
      phone: undefined,
      address: null,
      age: 20,
    }
    const result = filterNoneValueObject(conditions)

    expect(Object.keys(result).length === 1).toBeTruthy()
    expect(result).toMatchObject({ age: 20 })
  })
})

describe('utils: stringifyQuery', () => {
  it('should return query string', () => {
    const conditions = {
      age: 20,
      tags: ['react', 'vue'],
    }
    const params = createParams(conditions)
    const query = stringifyQuery(params)
    expect(query).toBe('age=20&tags=react%2Cvue')
  })

  it('should return query string and filter keys', () => {
    const conditions = {
      age: 20,
      tags: ['react', 'vue'],
    }
    const params = createParams(conditions)
    const query = stringifyQuery(params, ['age'])
    expect(query).toBe('tags=react%2Cvue')
  })
})

describe('utils: syncQuery2Conditions', () => {
  it('should sync query object to conditions', () => {
    const query = {
      age: 50,
      tags: 'react,vue',
    }
    const conditions = {
      age: 20,
      tags: ['react', 'vue'],
    }
    syncQuery2Conditions(conditions, query, conditions)
    expect(conditions).toMatchObject({
      age: 50,
      tags: ['react', 'vue'],
    })
  })

  it('should sync query object to conditions with date', () => {
    const query = {
      date: '2020-01-02',
    }
    const conditions = {
      date: new Date(),
    }
    syncQuery2Conditions(conditions, query, conditions)
    expect(Object.prototype.toString.call(conditions.date) === '[object Date]').toBeTruthy()
  })

  it('should sync query object to conditions with Array<string>', () => {
    const query = {
      daterange: ['2020-01-02', '2020-01-03'],
    }
    const conditions = {
      daterange: [],
    }
    syncQuery2Conditions(conditions, query, conditions)
    expect(conditions.daterange).toMatchObject(['2020-01-02', '2020-01-03'])
  })

  it('should sync query object to conditions with Array<number>', () => {
    const query = {
      daterange: [1, 2],
    }
    const conditions = {
      daterange: [],
    }
    syncQuery2Conditions(conditions, query, conditions)
    expect(conditions.daterange).toMatchObject([1, 2])
  })

  it('if query is empty conditions should set init value', () => {
    const query = {}
    const conditions = {
      date: new Date(),
      string: 'runkids',
      array: ['react', 'vue'],
      boolean: false,
      undefined: undefined,
      null: null,
    }
    syncQuery2Conditions(conditions, query, conditions)

    expect(conditions).toMatchObject({
      date: '',
      string: '',
      array: [],
      boolean: '',
      undefined: '',
      null: '',
    })
  })
})
