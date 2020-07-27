# vue-condition-watcher 🕶

[![CircleCI](https://circleci.com/gh/runkids/vue-condition-watcher.svg?style=svg)](https://circleci.com/gh/runkids/vue-condition-watcher) [![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![vue3](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://composition-api.vuejs.org/) [![npm](https://img.shields.io/npm/v/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher)  [![npm](https://img.shields.io/npm/dt/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher) [![bundle size](https://badgen.net/bundlephobia/minzip/vue-condition-watcher)](https://bundlephobia.com/result?p=vue-condition-watcher) [![npm](https://img.shields.io/npm/l/vue-condition-watcher.svg)](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE)

## Introduction
Vue Composition API for automatic fetch data when condition has been changed

#### Features
  ✔ Auto fetch data when conditions changed.<br>
  ✔ Auto filtter falsy value in conditions.<br>
  ✔ Auto convert the corresponding type. (string, number, array, date)<br>
  ✔ Store the conditions within the URL hash every time a condition is changed<br>
  ✔ Sync the state with the query string and initialize off of that and that back/forward/refresh work.<br>
  ✔ Support `vue@2 @vue/composition-api`

  <img src="https://github.com/runkids/vue-condition-watcher/blob/master/examples/vue-conditions-watcher.gif?raw=true"/>

[👉 Download vue@next example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples/vue3) (Use [Vite](https://github.com/vuejs/vite))
```bash
$ cd examples/vue3
$ yarn 
$ yarn dev
````

[👉 Download vue@2 @vue/composition-api example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples/vue2)
```bash
$ cd examples/vue2
$ yarn 
$ yarn dev
````

### 👉 Online demo with vue-infinite-scroll

[![Edit vue-condition-watcher demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vue-condition-watcher-demo-0wfgc?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue)

<br>
<img src="https://github.com/runkids/vue-condition-watcher/blob/master/examples/vue-conditions-watcher-demo2.gif?raw=true"/>

```javascript
export default {
  directives: { infiniteScroll },
  setup() {
    const items = ref([])

    const config = {
      fetcher: api.addBox,
      conditions: {
        offset: 0,
        limit: 10
      },
      afterFetch(data) {
        if (!data) return
        items.value = items.value.concat(data)
      }
    }
    
    const { conditions, loading } = useConditionWatcher(config)

    const loadMore = () => {
      if (loading.value) return
      conditions.offset += conditions.limit
    }

    return {
      conditions,
      loading,
      items,
      loadMore
    }
  }
}
```

## Quick Start

Simple example for `vue-next` and `vue-router-next`
```javascript
createApp({
  template: `
    <div class="filter">
      <input v-model="conditions.name">
      <button @click="refresh">Refresh</button>
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
$ yarn add vue-condition-watcher
```
Or with npm
```bash
$ npm install vue-condition-watcher
```
CDN
```javascript
https://unpkg.com/vue-condition-watcher/dist/index.js
```

### API

```js
const { conditions, data, error, loading, refresh } = useConditionWatcher(config, queryOptions)
```

#### Parameters

- `config` : An object of config for vue-condition-watcher
  * `fetcher` (⚠️Required) : Can be any asynchronous function to fetch data
  * `conditions` (⚠️Required) : An object of conditions, also be initial value
  * `defaultParams`: An object of fetcher's default parameters
  * `beforeFetch`: A function you can do before fetch data
Parameters  
  * `afterFetch`: A function you can do after fetch data. Parameters: `data`.

    ```javascript

    const config = {
      fetcher: params => axios.get('url', { params }),

      defaultParams: {
        type: 'member'
      },

      conditions: {
        offset: 0,
        limit: 10,
        username: '',
        tags: [],
        created_at: new Date()
      },

      beforeFetch: conditions => {
        // conditions is an object clone copy from config.conditions
        conditions.created_at = dayjs(conditions.created_at, 'YYYY-MM-DD');
        return conditions
      },
      afterFetch(data) {
        console.log(data)
      }
    }
    ```


  
* `queryOptions`: An object of options to sync query string with conditions
  * ⚠️ `queryOptions` work base on vue-router, you need install [vue-router](https://www.npmjs.com/package/vue-router/v/4.0.0-alpha.12) first.
  * `sync`: key of provide name ( String | Symbol )
    * main.js: register router
    ```javascript
      import {createApp} from 'vue'
      import App from './App.vue'
      import { router } from './router'

      const app = createApp(App)
        .provide('router', router) // it's should be required
        .use(router)
        .mount('#app')
    ```
    * then
    ```javascript
    useConditionWatcher(config, {sync: 'router'})
    ```

  * `ignore`: you can ignore key name from conditions, will not push with query.

    ```javascript
    useConditionWatcher(config, {sync: 'router', ignore: ['offset', 'limit']})
    ```
    ##### How to use in vue@2 with @vue/composition-api
     * ( Good ) Add `provide` in `main.js`
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
    * Add `provide` in current file
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

#### Return Values
- `reactive` : An object and returns a reactive proxy of conditions
- `data`: Data resolved by `config.fetcher`
- `error`: Error thrown by `config.fetcher`  
- `loading`: Request is loading
- `refresh`: A function to re-fetch data  
