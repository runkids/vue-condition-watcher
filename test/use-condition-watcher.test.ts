import { useConditionWatcher } from '../src'
import { isRef, isReactive, isReadonly, createApp, nextTick } from 'vue'

jest.useFakeTimers()
const timeout = (milliseconds: number) => jest.advanceTimersByTime(milliseconds)
const tick = async (times: number) => {
  for (let _ in [...Array(times).keys()]) {
    await nextTick()
  }
}

function doAsync(c) {
  setTimeout(() => {
    c()
  }, 0)
}

describe('useConditionWatcher', () => {
  const root = document.createElement('div')
  const consoleWarnSpy = jest.spyOn(console, 'warn')

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })

  /**
   * @jest-environment jsdom
   */

  test('use jsdom in this test file', () => {
    expect(root).not.toBeNull()
  })

  it(`Check return value's type`, () => {
    const config = {
      fetcher: (params) => new Promise((resolve) => resolve(params)),
      conditions: {
        gender: ['male'],
        results: 9,
      },
    }
    const { conditions, data, error, loading, execute } = useConditionWatcher(config)

    expect(isReactive(conditions)).toBeTruthy()
    expect(isRef(data)).toBeTruthy()
    expect(isRef(error)).toBeTruthy()
    expect(isRef(loading)).toBeTruthy()
    expect(typeof loading.value === 'boolean').toBeTruthy()
    expect(typeof execute === 'function').toBeTruthy()
  })

  it(`Check data, error, loading is readonly`, () => {
    const config = {
      fetcher: (params) => new Promise((resolve) => resolve(params)),
      conditions: {
        gender: ['male'],
        results: 9,
      },
    }
    const { data, error, loading } = useConditionWatcher(config)

    expect(isReadonly(data)).toBeTruthy()
    expect(isReadonly(error)).toBeTruthy()
    expect(isReadonly(loading)).toBeTruthy()
  })

  it(`Condition should be change`, () => {
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

  it(`Should return data from a promise`, () => {
    const vm = createApp({
      template: `<div>{{data}}</div>`,
      setup() {
        const config = {
          fetcher: () => new Promise((resolve) => resolve('ConditionWatcher')),
          immediate: true,
          conditions: {
            gender: ['male'],
            results: 9,
          },
        }
        return useConditionWatcher(config)
      },
    }).mount(root)

    doAsync(async () => {
      expect(vm.$el.textContent).toBe('')
      await tick(1)
      expect(vm.$el.textContent).toBe('ConditionWatcher')
    })
  })

  it(`Loading state should return true until promise resolve`, () => {
    const vm = createApp({
      template: `<div>loading:{{loading}}, result:{{data}}</div>`,
      setup() {
        const config = {
          fetcher: () => new Promise((resolve) => setTimeout(() => resolve('ConditionWatcher'), 200)),
          conditions: {
            gender: ['male'],
            results: 9,
          },
        }
        return useConditionWatcher(config)
      },
    }).mount(root)

    doAsync(async () => {
      await tick(1)
      expect(vm.$el.textContent).toBe('loading:true, result:')
      timeout(200)
      await tick(1)
      expect(vm.$el.textContent).toBe('loading:false, result:ConditionWatcher')
    })
  })

  it(`Fetcher's params should same by condition and defaultParams`, () => {
    const vm = createApp({
      template: `<div>{{data}}</div>`,
      setup() {
        const config = {
          fetcher: (params) => new Promise((resolve) => resolve(JSON.stringify(params))),
          conditions: {
            results: 9,
            name: 'runkids',
          },
          defaultParams: {
            limit: 10,
            offset: 1,
          },
        }
        return useConditionWatcher(config)
      },
    }).mount(root)

    doAsync(async () => {
      await tick(1)
      expect(JSON.parse(vm.$el.textContent)).toMatchObject({
        results: 9,
        name: 'runkids',
        limit: 10,
        offset: 1,
      })
    })
  })

  it(`Fetcher's params should same with beforeFetch return object`, () => {
    const vm = createApp({
      template: `<div>{{data}}</div>`,
      setup() {
        const config = {
          fetcher: (params) => new Promise((resolve) => resolve(JSON.stringify(params))),
          conditions: {
            results: 9,
            date: new Date('2020-05-22'),
          },
          beforeFetch(conditions) {
            const d = conditions.date
            conditions.date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
            return conditions
          },
        }
        return useConditionWatcher(config)
      },
    }).mount(root)

    doAsync(async () => {
      await tick(1)
      expect(JSON.parse(vm.$el.textContent)).toMatchObject({
        results: 9,
        date: '2020-5-22',
      })
    })
  })

  it(`If conditions attribute's type is array, fetcher's param should be string`, () => {
    const vm = createApp({
      template: `<div>{{data}}</div>`,
      setup() {
        const config = {
          fetcher: (params) => new Promise((resolve) => resolve(params.gender)),
          conditions: {
            gender: ['male', 'female'],
          },
        }
        return useConditionWatcher(config)
      },
    }).mount(root)

    doAsync(async () => {
      await tick(1)
      expect(vm.$el.textContent).toBe('male,female')
    })
  })

  it(`Initial values of conditions by config`, () => {
    const vm = createApp({
      template: `<div>{{conditions.count}}</div>`,
      setup() {
        const { conditions, resetConditions } = useConditionWatcher({
          fetcher: (params) => new Promise((resolve) => resolve(params)),
          conditions: {
            count: 0,
          },
        })

        conditions.count = 10

        resetConditions()

        return {
          conditions,
        }
      },
    }).mount(root)

    doAsync(async () => {
      await tick(1)
      expect(vm.$el.textContent).toBe('0')
    })
  })
})
