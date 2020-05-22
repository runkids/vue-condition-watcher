import { filterNoneValueObject } from '../src/utils'

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
