# vue-condition-watcher 🕶

[![CircleCI](https://circleci.com/gh/runkids/vue-condition-watcher.svg?style=svg)](https://circleci.com/gh/runkids/vue-condition-watcher) [![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![vue3](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://composition-api.vuejs.org/) [![npm](https://img.shields.io/npm/v/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher)  [![npm](https://img.shields.io/npm/dt/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher) [![bundle size](https://badgen.net/bundlephobia/minzip/vue-condition-watcher)](https://bundlephobia.com/result?p=vue-condition-watcher) [![npm](https://img.shields.io/npm/l/vue-condition-watcher.svg)](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE)

## Introduction

Vue Composition API for automatic fetch data when condition has been changed
> requires Node.js 12.0.0 or higher.

#### Features

  ✔ Auto fetch data when conditions changed.<br>
  ✔ Auto filter falsy value in conditions.<br>
  ✔ Auto converts the corresponding type. (string, number, array, date)<br>
  ✔ Store the conditions within the URL hash every time a condition is changed<br>
  ✔ Sync the state with the query string and initialize off of that and that back/forward/execute work.<br>
  ✔ Keep requests first in — first out.<br>
  ✔ Works for Vue 2 & 3 by the power of [vue-demi](https://github.com/vueuse/vue-demi)
  
  <img src="https://github.com/runkids/vue-condition-watcher/blob/master/examples/vue-conditions-watcher.gif?raw=true"/>

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


## Quick Start

Simple example for `vue-next` and `vue-router-next`

```javascript
createApp({
  template: `
    <div class="filter">
      <input v-model="conditions.name">
      <button @click="execute">Refetch</button>
    </div>
    <div class="container" v-if="!loading">
      {{ data }}
    </div>
    <div class="loading" v-else>Loading...</div>
  `,
  setup() {
    const config = {
      fetcher: params => axios.get('/user/', {params}),
      conditions: {
        name: ''
      },
    }
    return useConditionWatcher(config, {sync: 'router'})
  },
})
.provide('router', router)
.use(router)
.mount(document.createElement('div'))
```

## Usage

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

### Basic Usage

```js
const { conditions, data, error, loading, execute, resetConditions, onConditionsChange } = useConditionWatcher(config, queryOptions)
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

Update conditions one time.
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
The `afterFetch` can intercept the response before data updated

```js
const { data } = useConditionWatcher({
  fetcher,
  conditions,
  async afterFetch(response) {
    //response.data = {id: 1, name: 'runkids'}
    if(response.data === null) {
      return []
    }
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
#### More Configs

- `config` : An object of config for vue-condition-watcher
  - `fetcher` (⚠️Required) : Can be any asynchronous function to fetch data
  - `conditions` (⚠️Required) : An object of conditions, also be initial value
  - `defaultParams`: An object of fetcher's default
  parameters
  - `initialData`: `data` default value is null, and you can setting `data` default value by use this config
  - `immediate`: Setting the `immediate` to false will prevent the request until the `execute` function called. `immediate` default is `true`.

    ```javascript

    const config = {
      fetcher: params => axios.get('url', { params }),
      defaultParams: {
        type: 'member'
      },
      immediate: true,
      initialData: []
      conditions: {
        offset: 0,
        limit: 10,
        username: '',
      },
    }
    ```

- `queryOptions`: An object of options to sync query string with conditions
  - ⚠️ `queryOptions` work base on vue-router, you need install [vue-router](https://www.npmjs.com/package/vue-router/v/next) first.
  - `sync`: key of provide name ( String | Symbol )
    - main.js: register router

    ```javascript
      import {createApp} from 'vue'
      import App from './App.vue'
      import { router } from './router'

      const app = createApp(App)
        .provide('router', router) // it's should be required
        .use(router)
        .mount('#app')
    ```

    - then

    ```javascript
    useConditionWatcher(config, {sync: 'router'})
    ```

  - `ignore`: you can ignore key name from conditions, will not push with query.

    ```javascript
    useConditionWatcher(config, {sync: 'router', ignore: ['offset', 'limit']})
    ```

  - `navigation`: use vue router navigation method push or replace, default value is push.

    ```javascript
      useConditionWatcher(config, {sync: 'router', navigation: 'replace'})
    ```

##### How to use in vue@2 with @vue/composition-api

- ( Good ) Add `provide` in `main.js`

  ```javascript
  new Vue({
    el: '#app',
    router,
    store,
    provide: {
      router
    },
    render: h => h(App)
  })
  ```

- Add `provide` in current file

  ```javascript
  import { useConditionWatcher } from "vue-condition-watcher";
  import { provide } from "@vue/composition-api";
  import router from "@/router";
  import api from "../api";

  export default {
    setup() {
      provide("router", router);

      const config = {
        fetcher: api.users,
        conditions: {
          offset: 0,
          limit: 9
        }
      };

      return useConditionWatcher(config, {sync: 'router', ignore: ['offset', 'limit']});
    }
  };
  ```

##### How to use in Nuxt with @nuxtjs/composition-api

- Add `provide` in current file

  ```javascript
  import { useConditionWatcher } from "vue-condition-watcher";
  import { defineComponent, useRoute, provide, useContext } from "@nuxtjs/composition-api";
  import api from "~/api";

  export default defineComponent({
    setup() {
      const route = useRoute();
      const { app } = useContext();
      provide('router', app.router);

      const config = {
        fetcher: api.users,
        conditions: {
          offset: 0,
          limit: 9
        }
      };

      return useConditionWatcher(config, {sync: 'router', ignore: ['offset', 'limit']});
    }
  });
  ```

### Return Values

- `conditions` : An object and returns a reactive proxy of conditions
- `data`: Data resolved by `config.fetcher`
- `error`: Error thrown by `config.fetcher`  
- `loading`: Request is fetching
- `execute`: The function to fetch data
- `resetConditions`: Reset conditions to initial value
- `onConditionsChange`: Will fire on conditions changed
- `onFetchSuccess`: Will fire on fetch request success
- `onFetchError`: Will fire on fetch request error
- `onFetchFinally`: Will fire on fetch finished

## Lifecycle
<img src="https://github.com/runkids/vue-condition-watcher/blob/master/examples/vue-condition-watcher_lifecycle.jpeg?raw=true"/>

* ##### `onConditionsChange`
  Fire new conditions value and old conditions value.
  ```js
  onConditionsChange((cond, preCond)=> {
    console.log(cond)
    console.log(preCond)
  })
  ```
* ##### `beforeFetch`
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

* ##### `afterFetch` & `onFetchSuccess`
  `afterFetch` fire before `onFetchSuccess`<br/>
  `afterFetch` can modify data before update.
  ||Type|Modify data before update|
  |-----|--------|------|
  |afterFetch| config | ⭕️ |
  |onFetchSuccess  | event | ❌ |
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

* ##### `onFetchError(config)` & `onFetchError(event)`
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
* ##### `onFetchFinally`
  Will fire on fetch finished.
  ```js
  onFetchFinally(async ()=> {
    //do something
  })
  ```