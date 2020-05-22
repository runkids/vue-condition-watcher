# vue-condition-watcher 🕶

[![CircleCI](https://circleci.com/gh/runkids/vue-condition-watcher.svg?style=svg)](https://circleci.com/gh/runkids/vue-condition-watcher) [![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![npm](https://img.shields.io/npm/v/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher)  [![npm](https://img.shields.io/npm/dt/vue-condition-watcher.svg)](https://www.npmjs.com/package/vue-condition-watcher) [![bundle size](https://badgen.net/bundlephobia/minzip/vue-condition-watcher)](https://bundlephobia.com/result?p=vue-condition-watcher) [![npm](https://img.shields.io/npm/l/vue-condition-watcher.svg)](https://github.com/runkids/vue-condition-watcher/blob/master/LICENSE)

## Introduction
Vue Composition API for automatic fetch data when condition has been changed

[Download example here](https://github.com/runkids/vue-condition-watcher/tree/master/examples) (Use [Vite](https://github.com/vuejs/vite))

## Quick Start

Example for vue 3.x

```javascript
<template>
  <div v-if="!loading">
    <div class="filters">
      <input v-model.lazy="conditions.username" />

      <input type="date" v-model="conditions.created_at"/>

      <input type="checkbox" id="vue" value="Vue" v-model="conditions.skills">
      <label for="vue">Vue</label>
      <input type="checkbox" id="react" value="React" v-model="conditions.skills">
      <label for="react">React</label>

      <button @click="refresh">refresh</button>
    </div>

    <div>data: {{ data }}</div>
    <div>error: {{ error }}</div>

    <pagination :offset.sync="conditions.offset" :limit.sync="conditions.limit" />
  </div>

  <loading v-else/>
</template>

<script>
import {useConditionWatcher} from "vue-condition-watcher";
import axios from "axios";

export default {
  setup() {
    const config = {
      fetcher: params => axios.get("/users/", { params }),
      defaultParams: {
        type: 'member'
      },
      conditions: {
        offset: 0,
        limit: 10,
        username: '',
        skills: [],
        created_at: new Date()
      },
      beforeFetch: conditions => {
        conditions.created_at = dayjs(conditions.created_at, "YYYY-MM-DD");
        return conditions
      }
    };

    const { conditions, data, error, loading, refresh } = useConditionWatcher(config);

    return { 
      conditions, 
      data, 
      error, 
      loading, 
      refresh 
    };
  }
};
</script>
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
const { conditions, data, error, loading, refresh } = useConditionWatcher(config)
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
    // conditions is an object clone deep from config.conditions
    conditions.created_at = dayjs(conditions.created_at, 'YYYY-MM-DD');
    return conditions
  }
}
```

#### Return Values
- `reactive` : An object and returns a reactive proxy of conditions
- `data`: Data resolved by `config.fetcher`
- `error`: Error thrown by `config.fetcher`  
- `loading`: Request is loading
- `refresh`: A function to re-fetch data  
