# vue-condition-watcher 🕶
<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/vue-condition-watcher">
    <img alt="" src="https://badgen.net/npm/v/vue-condition-watcher">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=vue-condition-watcher">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/vue-condition-watcher">
  </a>
</p>
## Introduction
Vue Composition API for automatic fetch data when condition has been changed

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
import {useConditionWatcher} from "useConditionWatcher";
import axios from "axios";

export default {
  setup() {
    const settings = {
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
      beforeFetchData: conditions => {
        conditions.created_at = dayjs(conditions.created_at, "YYYY-MM-DD");
        return conditions
      }
    };

    const { conditions, data, error, loading, refresh } = useConditionWatcher(settings);

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
  * `fetcher` : A promise returning function to fetch data
  * `conditions` : An object of conditions, also be initial value
  * `defaultParams`: An object of fetcher's default parameters
  * `beforeFetchData`: A function you can do before fetch data
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

  beforeFetchData: conditions => {
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
