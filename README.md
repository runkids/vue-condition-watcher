# vue-condition-watcher 🕶

[![CircleCI](https://circleci.com/gh/runkids/vue-condition-watcher.svg?style=svg)](https://circleci.com/gh/runkids/vue-condition-watcher) [![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![npm](https://img.shields.io/npm/v/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher)  [![npm](https://img.shields.io/npm/dt/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher) [![bundle size](https://badgen.net/bundlephobia/minzip/vue-condition-watcher)](https://bundlephobia.com/result?p=vue-condition-watcher) [![npm](https://img.shields.io/npm/l/vue-condition-watcher.svg)](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE)

## Introduction
Vue Composition API for automatic fetch data when condition has been changed

##### Why did i created this project ?
I write backstage use Vuejs 2. After a period of time, I noticed i need write same code every time, like [this page](https://online-metrics.com/wp-content/uploads/2016/05/standard-table-filter-example-1024x333.png) with many filters.

I add conditions, loading, results in data
```javascript
data(){
  return {
    loading: false,
    results: [],
    conditions: {
      name: '',
      type: '',
      // and more
    }
  }
}
```
Then watch the conditions changed to fetch data
```javascript
watch: {
  conditions: {
    immediate: true,
    handler: 'fetchData'
  }
}
```
Before fetch data, i use computed to get query object and filter falsy value like '', null, []
```javascript
computed: {
  queryObject () {
    // do something with this.conditions
    return query
  }
}
```
Update the uri before fetch data
```javascript
this.$router.push('new path')
```
Okay, now doing fetch data

```javascript
methods: {
  fetchData () {
    this.loading = true
    //do something
    api(this.queryObject).then(res=>{
      this.results = res.data
    }).finally(()=>{
      this.loading = false
    })
    //do something
  }
}
```
All done ! ...🤪
Wait ! I need handle user refresh page to sync query object value to conditions
....just keep fighting 😇

Until i used [composition-api](https://github.com/vuejs/composition-api) create `vue-condition-watcher` prototype last year. It's really really save my time.

Now vue3 is going on beta, that's why i created this project. Can't wait vue3 release! Hope this project can help someone experiencing the same troubles.

#### Features
  * You can write less code in list data page with filters.
  * Auto watch conditions changed to fetch new data.
  * Auto filtter falsy value in conditions.
  * Auto convert the corresponding type. (string, number, array, date)
  * Sync the state with the query string and initialize off of that and that back/forward/refresh work.

  <img src="https://github.com/runkids/MessageBot-Helper_LINE/blob/master/examples/vue-conditions-watcher.gif?raw=true"/>

[Download example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples) (Use [Vite](https://github.com/vuejs/vite))
```bash
$ cd examples/
$ yarn 
$ yarn dev
````

Todo 
  * back/forward page sync query string
  * add test for router
## Quick Start

Simple example for `vue-next` and `vue-router-next`
```javascript
createApp({
  template: `
    <div class="filter">
      <input type="checkbox" id="male" value="male" v-model="conditions.gender">
      <label for="male">Male</label>
      <input type="checkbox" id="female" value="female" v-model="conditions.gender">
      <label for="female">Female</label>
      <button @click="refresh">Refresh</button>
    </div>

    <div class="container" v-if="!loading && data">
      <div class="card" v-for="item in data.results" :key="item.id.value">
        <div>
          <img :src="item.picture.thumbnail"/>
        </div>
        <h4>{{`${item.name.first} ${item.name.last}`}}</h4>
        <div>{{item.email}}</div>
        <div>{{item.phone}}</div>
      </div>
    </div>
    <div class="loading" v-else>Loading...</div>
  `,
  setup() {
    const config = {
      fetcher: params => api.users(params),
      conditions: {
        gender: [],
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

### API

```js
const { conditions, data, error, loading, refresh } = useConditionWatcher(config, queryOptions)
```

#### Parameters

- `config` : An object of config for vue-condition-watcher
  * `fetcher` (🚧Required) : A promise returning function to fetch data
  * `conditions` (🚧Required) : An object of conditions, also be initial value
  * `defaultParams`: An object of fetcher's default parameters
  * `beforeFetch`: A function you can do before fetch data

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
      }
    }
    ```
  🚧 `queryOptions` work base on vue-router, you need install [vue-router](https://www.npmjs.com/package/vue-router/v/4.0.0-alpha.12) first.
  
* `queryOptions`: An object of options to sync query string with conditions
  * `sync`: key of provide name ( String | Symbol ).
    main.js: register router
    ```javascript
      import {createApp} from 'vue'
      import App from './App.vue'
      import { router } from './router'

      const app = createApp(App)
        .provide('router', router) // it's should be required
        .use(router)
        .mount('#app')
    ```
    then
    ```javascript
    useConditionWatcher(config, {sync: 'router'})
    ```

  * `ignore`: you can ignore key name from conditions, will not push with query.

    ```javascript
    useConditionWatcher(config, {sync: 'router', ignore: ['offset', 'limit']})
    ```
   

#### Return Values
- `reactive` : An object and returns a reactive proxy of conditions
- `data`: Data resolved by `config.fetcher`
- `error`: Error thrown by `config.fetcher`  
- `loading`: Request is loading
- `refresh`: A function to re-fetch data  
