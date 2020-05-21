import { useConditionWatcher } from '../src/index'
import { isRef, isReactive } from 'vue'

describe('useConditionWatcher', () => {
  const consoleWarnSpy = jest.spyOn(console, 'warn')

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })

  it(`Check return value's type`, async () => {
    const config = {
      fetcher: (params) => new Promise((resolve) => resolve(params)),
      conditions: {
        gender: ['male'],
        results: 9,
      },
    }
    const { conditions, data, error, loading, refresh } = useConditionWatcher(
      config
    )

    expect(isReactive(conditions)).toBeTruthy()
    expect(isRef(data)).toBeTruthy()
    expect(isRef(error)).toBeTruthy()
    expect(isRef(loading)).toBeTruthy()
    expect(isRef(refresh)).toBeTruthy()
    expect(typeof loading.value === 'boolean').toBeTruthy()
    expect(typeof refresh.value === 'function').toBeTruthy()
  })

  it(`Check condition has been change`, () => {
    const config = {
      fetcher: (params) => new Promise((resolve) => resolve(params)),
      conditions: {
        gender: ['male'],
        results: 9,
      },
    }
    const { conditions } = useConditionWatcher(config)

    expect(conditions).toMatchObject({
      gender: ['male'],
      results: 9,
    })
    conditions.results = 10
    conditions.gender = ['male', 'female']

    expect(conditions).toMatchObject({
      gender: ['male', 'female'],
      results: 10,
    })
  })
})
