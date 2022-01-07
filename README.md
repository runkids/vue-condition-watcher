English | [繁體中文](./README-zh_TW.md)

# vue-condition-watcher 🕶

[![CircleCI](https://circleci.com/gh/runkids/vue-condition-watcher.svg?style=svg)](https://circleci.com/gh/runkids/vue-condition-watcher) [![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![vue3](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://composition-api.vuejs.org/) [![npm](https://img.shields.io/npm/v/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher)  [![npm](https://img.shields.io/npm/dt/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher) [![bundle size](https://badgen.net/bundlephobia/minzip/vue-condition-watcher)](https://bundlephobia.com/result?p=vue-condition-watcher) [![npm](https://img.shields.io/npm/l/vue-condition-watcher.svg)](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE)

## Introduction

Vue composition API for automatic data fetching. Easily control and sync to URL query string by conditions
> requires Node.js 12.0.0 or higher.

#### Features

  ✔ Automatic fetch data when conditions changed.<br>
  ✔ Automatic filter falsy value in conditions before fetch.<br>
  ✔ Automatic converts the corresponding type. (string, number, array, date)<br>
  ✔ Store the conditions within the URL query string every time a condition is changed<br>
  ✔ Sync the state with the query string and initialize off of that and that back/forward/execute work.<br>
  ✔ Avoiding the race condition.<br>
  ✔ Dependent request before update data. <br/>
  ✔ Easily manage paged data and customized your pagination hook. <br/>
  ✔ Revalidation on focus & network recovery <br/>
  ✔ Polling <br/>
  ✔ Local mutation <br/>
  ✔ TypeScript support <br/>
  ✔ Works for Vue 2 & 3 by the power of [vue-demi](https://github.com/vueuse/vue-demi)
  
  <img src=".github/vue-conditions-watcher.gif"/>

[👉 Download Vue3 example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples/vue3) (Use [Vite](https://github.com/vuejs/vite))

```bash
cd examples/vue3
yarn 
yarn serve
````

[👉 Download Vue2 @vue/composition-api example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples/vue2)

```bash
cd examples/vue2
yarn 
yarn serve
````

### 👉 Online demo with vue-infinite-scroll

[![Edit vue-condition-watcher demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vue-condition-watcher-demo-0wfgc?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue)

## Getting Started

### Installation

In your project

```bash
yarn add vue-condition-watcher
```

Or with npm

```bash
npm install vue-condition-watcher
```

CDN

```javascript
https://unpkg.com/vue-condition-watcher/dist/index.js
```

### Quick Start

This is a simple example for `vue-next` and `vue-router-next`

First you need to create a fetcher function, use the native `fetch` or libs like Axios. Then import `useConditionWatcher` and start using it.

```javascript
createApp({
  template: `
    <div class="filter">
      <input v-model="conditions.name">
      <button @click="execute">Refetch</button>
    </div>
    <div class="container">
      {{ !loading ? data : 'Loading...' }}
    </div>
    <div v-if="error">{{ error }}</div>
  `,
  setup() {
    const fetcher = params => axios.get('/user/', {params})
    const router = useRouter()

    const { conditions, data, loading, error } = useConditionWatcher(
      {
        fetcher,
        conditions: {
          name: ''
        },
        history: {
          sync: router
        }
      }
    )
    return { conditions, data, loading, error }
  },
})
.use(router)
.mount(document.createElement('div'))
```

You can use the value of `data`, `error`, and `loading` to determine the current state of the request.

When the `conditions.name` value changes, will fire the `lifecycle` to fetching data again.

Use `config.history` of sync to `sync: router`. Will store the conditions within the URL query string every time conditions change.

### Basic Usage

```js
const { conditions, data, error, loading, execute, resetConditions, onConditionsChange } = useConditionWatcher(config)
```

### Execute Fetch

`conditions` is reactive proxy, easy execute fetch when `conditions` value changed

```js
const { conditions } = useConditionWatcher({
  fetcher,
  conditions: {
    page: 0
  },
  defaultParams: {
    opt_expand: 'date'
  }
})

conditions.page = 1 // fetch data with payload { page: 1, opt_expand: 'date' }

conditions.page = 2 // fetch data with payload { page: 2, opt_expand: 'date' }
```

Just call `execute` function to send a request if you need.

```js
const { conditions, execute: refetch } = useConditionWatcher({
  fetcher,
  conditions: {
    page: 0
  },
   defaultParams: {
    opt_expand: 'date'
  }
})

refetch() // fetch data with payload { page: 0, opt_expand: 'date' }
```

Force update conditions in time.

```js
const { conditions, resetConditions } = useConditionWatcher({
  fetcher,
  immediate: false,
  conditions: {
    page: 0,
    name: '',
    date: []
  },
})

// initial conditions then fire onConditionsChange event
Object.assign(conditions, {
  name: 'runkids',
  date: ['2022-01-01', '2022-01-02']
})

// Reset conditions
function reset () {
  Object.assign(conditions, {
    page: 0,
    name: '',
    date: []
  })

  // Or you can just use `resetConditions` function to initial value.
  resetConditions()
}
```

### Conditions Change Event

`onConditionsChange` can help you handle conditions changed.
Will return new value and old value.

```js
const { conditions, onConditionsChange } = useConditionWatcher({
  fetcher,
  conditions: {
    page: 0
  },
})

conditions.page = 1

onConditionsChange((conditions, preConditions)=> {
  console.log(conditions) // { page: 1}
  console.log(preConditions) // { page: 0}
})
```

### Fetch Event

The `onFetchResponse`, `onFetchError` and `onFetchFinally` will fire on fetch request.

```ts
const { onFetchResponse, onFetchError, onFetchFinally } = useConditionWatcher(config)

onFetchResponse((response) => {
  console.log(response)
})

onFetchError((error) => {
  console.error(error)
})

onFetchFinally(() => {
  //todo
})
```

### Prevent Request

Setting the `immediate` to false will prevent the request until the `execute`
function called or conditions changed.

```js
const { execute } = useConditionWatcher({
  fetcher,
  conditions,
  immediate: false,
})

execute()
```

### Manually Trigger Request

By default, `vue-condition-watcher` will automatically trigger fetch data. You can pass `manual` to disable the default fetch and then use `execute()` to trigger fetch data.

```js
const { execute } = useConditionWatcher({
  fetcher,
  conditions,
  manual: true,
})

execute()
```

### Intercepting Request

The `beforeFetch` let you modify conditions before fetch, or you can call `cancel` function to stop fetch.

```js
useConditionWatcher({
  fetcher,
  conditions: {
    date: ['2022/01/01', '2022/01/02']
  },
  initialData: [],
  async beforeFetch(conditions, cancel) {
    // await something
    await doSomething ()

    // conditions is an object clone copy from config.conditions
    const {date, ...baseConditions} = conditions
    const [after, before] = date
    baseConditions.created_at_after = after
    baseConditions.created_at_before = before

    return baseConditions
  }
})
```

The `afterFetch` can intercept the response before data updated, **also your can requestss depend on each other 🎭**

```js
const { data } = useConditionWatcher({
  fetcher,
  conditions,
  async afterFetch(response) {
    //response.data = {id: 1, name: 'runkids'}
    if(response.data === null) {
      return []
    }
    // requests depend on each other
    // the loading is still be true until fire `onFetchFinally`
    const finalResponse = await otherAPIById(response.data.id)

    return finalResponse // [{message: 'Hello', sender: 'runkids'}]
  }
})

console.log(data) //[{message: 'Hello', sender: 'runkids'}]
```

The `onFetchError` can intercept the response before data and error updated

```js
const { data, error } = useConditionWatcher({
  fetcher,
  conditions,
  async onFetchError({data, error}) {
    if(error.code === 401) {
      await doSomething()
    }

    return {
      data: [],
      error: 'Error Message'
    }
  }
})

console.log(data) //[]
console.log(error) //'Error Message'
```

### Configs

- `fetcher` (⚠️Required) : A promise returning function to fetch your data
- `conditions` (⚠️Required) : An object of conditions, also to be initial value
- `defaultParams`: An object of fetcher's default
parameters
- `initialData`: `data` default value is null, and you can setting `data` default value by use this config
- `immediate`: Setting the `immediate` to false will prevent the request until the `execute` function called. `immediate` default is `true`.
- `manual`: You can use `manual` to disabled automatically fetch data
- `history`: Sync conditions value to URL query string
- `beforeFetch`: You can modify conditions before fetch, or you can call second of arguments to stop fetch this time.
- `afterFetch`: You can modify data before update. also can use `mutate` modify too. But still recommend modify `data` at `afterFetch`.
- `onFetchError`: Handle error, and you can modify data and error before update here.

### Return Values

- `conditions`( `reactive` ) : An object and returns a reactive proxy of conditions
- `data`( `👁‍🗨 readonly & ⚠️ ref` ) : Data resolved by `config.fetcher`
- `error`( `👁‍🗨 readonly & ref` ) : Error thrown by `config.fetcher`  
- `loading`( `👁‍🗨 readonly & ref` ) : Request is fetching
- `execute`: The function to trigger the request
- `mutate`: You can use mutate() to directly modify `data` **( By default, data is readonly )**
- `resetConditions`: Reset conditions to initial value
- `onConditionsChange`: Will fire on conditions changed
- `onFetchSuccess`: Will fire on fetch request success
- `onFetchError`: Will fire on fetch request error
- `onFetchFinally`: Will fire on fetch finished

## Lifecycle

<img src=".github/vue-condition-watcher_lifecycle.jpeg"/>

- ##### `onConditionsChange`

  Fire new conditions value and old conditions value.

  ```js
  onConditionsChange((cond, preCond)=> {
    console.log(cond)
    console.log(preCond)
  })
  ```

- ##### `beforeFetch`

  You can modify conditions before fetch, or you can call second of arguments to stop fetch this time.

  ```js
  const { conditions } = useConditionWatcher({
    fetcher,
    conditions,
    beforeFetch
  })

  async function beforeFetch(cond, cancel){
    if(!cond.token) {
      // stop fetch
      cancel()
      // will fire onConditionsChange again
      conditions.token = await fetchToken()
    }
    return cond
  })
  ```

- ##### `afterFetch` & `onFetchSuccess`

  `afterFetch` fire before `onFetchSuccess`<br/>
  `afterFetch` can modify data before update.
  ||Type|Modify data before update| Dependent request |
  |-----|--------|------|------|
  |afterFetch| config | ⭕️ | ⭕️ |
  |onFetchSuccess  | event | ❌ | ❌ |

  ```html
    <template> 
      {{ data?.detail }} <!-- 'xxx' -->
    </template>
  ```

   ```js
  const { data, onFetchSuccess } = useConditionWatcher({
    fetcher,
    conditions,
    async afterFetch(response){
      //response = { id: 1 }
      const detail = await fetchDataById(response.id)
      return detail // { id: 1, detail: 'xxx' }
    })
  })

  onFetchSuccess((response)=> {
    console.log(response) // { id: 1, detail: 'xxx' }
  })
  ```

- ##### `onFetchError(config)` & `onFetchError(event)`

  `config.onFetchError` fire before `event.onFetchError`<br/>
  `config.onFetchError` can modify data and error before update.
  ||Type|Modify data before update|Modify error before update|
  |-----|--------|------|------|
  |onFetchError| config | ⭕️ | ⭕️ |
  |onFetchError  | event | ❌ | ❌ |

   ```js
  const { onFetchError } = useConditionWatcher({
    fetcher,
    conditions,
    onFetchError(ctx){
      return {
        data: [],
        error: 'Error message.'
      }
    })
  })

  onFetchError((error)=> {
    console.log(error) // origin error data
  })
  ```

- ##### `onFetchFinally`

  Will fire on fetch finished.

  ```js
  onFetchFinally(async ()=> {
    //do something
  })
  ```

## Make It Reusable

You might need to reuse the data in many places. It is incredibly easy to create reusable hooks of `vue-condition-watcher` :

```js
function useUserExpensesHistory (id) {
  const { conditions, data, error, loading } = useConditionWatcher({
    fetcher: params => api.user(id, { params }),
    defaultParams: {
      opt_expand: 'amount,place'
    },
    conditions: {
      daterange: []
    }
    immediate: false,
    initialData: [],
    beforeFetch(cond, cancel) {
      if(!id) {
        cancel()
      }
      const { daterange, ...baseCond } = cond
      if(daterange.length) {
        [baseCond.created_at_after, baseCond.created_at_before] = [
          daterange[0],
          daterange[1]
        ]
      }
      return baseCond
    }
  })

  return {
    histories: data,
    isFetching: loading,
    isError: error,
    daterange: conditions.daterange
  }
}
```

And use it in your components:

```js
<script setup>
  const { 
    daterange, 
    histories, 
    isFetching, 
    isError 
  } = useUserExpensesHistory(route.params.id)

  onMounted(() => {
    //start first time data fetching after initial date range
    daterange = [new Date(), new Date()]
  })
</script>
```

```html
<template>
  <el-date-picker
    v-model="daterange"
    :disabled="isFetching"
    type="daterange"
  />
  <div v-for="history in histories" :key="history.id">
    {{ `${history.created_at}: ${history.amount}` }}
  </div>
</template>
```

Congratulations! 🥳 You have learned how to use composition-api with `vue-condition-watcher`.

Now we can manage the paging information use `vue-condition-watcher` .

## Pagination

Here is an example use Django the limit and offset functions and Element UI.

Create `usePagination`

```js
function usePagination () {
  let cancelFlag = false // check this to cancel fetch

  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()
  
  const { conditions, data, execute, resetConditions, onConditionsChange, onFetchFinally } = useConditionWatcher(
    {
      fetcher: api.list,
      conditions: {
        daterange: [],
        limit: 20,
        offset: 0
      }
      immediate: true,
      initialData: [],
      history: {
        sync: router,
        // You can ignore the key of URL query string, prevent users from entering unreasonable numbers by themselves.
        // The URL will look like ?offset=0 not show `limit`
        ignore: ['limit'] 
      },
      beforeFetch
    }, 
  )

  // use on pagination component
  const currentPage = computed({
    get: () => conditions.offset / conditions.limit + 1,
    set: (page) => {
      conditions.offset = (page - 1) * conditions.limit
    }
  })

  // onConditionsChange -> beforeFetch -> onFetchFinally
  onConditionsChange((newCond, oldCond) => {
    // When conditions changed, reset offset to 0 and then will fire beforeEach again.
    if (newCond.offset !== 0 && newCond.offset === oldCond.offset) {
      cancelFlag = true
      conditions.offset = 0
    }
  })

  async function beforeFetch(cond, cancel) {
    if (cancelFlag) {
      // cancel fetch when cancelFlag be true
      cancel()
      cancelFlag = false // reset cancelFlag 
      return cond
    }
    // start loading
    await nextTick()
    startLoading()
    const { daterange, ...baseCond } = cond
    if(daterange.length) {
      [baseCond.created_at_after, baseCond.created_at_before] = [
        daterange[0],
        daterange[1]
      ]
    }
    return baseCond
  }

  onFetchFinally(async () => {
    await nextTick()
    // stop loading
    stopLoading()
    window.scrollTo(0, 0)
  })

  return {
    data,
    conditions,
    currentPage,
    resetConditions,
    refetch: execute
  }
}
```

And use it in your components:

```js
<script setup>
  const { data, conditions, currentPage, resetConditions, refetch } = usePagination()
</script>
```

```html
<template>
  <el-button @click="refetch">Refetch Data</el-button>
  <el-button @click="resetConditions">Reset Offset</el-button>

  <el-date-picker
    v-model="conditions.daterange"
    type="daterange"
  />

  <div v-for="info in data" :key="info.id">
    {{ info }}
  </div>

  <el-pagination
    v-model:currentPage="currentPage"
    v-model:page-size="conditions.limit"
    :total="data.length"
  />
</template>
```

When daterange or limit changed, will reset offset to 0 and only fetch data again after reset offset.

## TDOD List

- [ ] Cache
- [ ] Prefetching
- [ ] Automatic Revalidation

## Thanks

This project is heavily inspired by the following awesome projects.

- [vercel/swr](https://github.com/vercel/swr)
## 📄 License

[MIT License](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE) © 2020-PRESENT [Runkids](https://github.com/runkids)