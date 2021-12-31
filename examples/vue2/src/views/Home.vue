<template>
  <div>
    <div class="link" @click="$router.push('/infinite')">Demo Infinite Scrolling</div>
    <br />
    <div class="filters">
      <input type="checkbox" id="male" value="male" v-model="conditions.gender" :disabled="loading"/>
      <label for="male">Male</label>
      <input type="checkbox" id="female" value="female" v-model="conditions.gender" :disabled="loading"/>
      <label for="female">Female</label>
      <input class="date-picker" type="date" v-model="conditions.date" :disabled="loading"/>
      <button class="btn" @click="refresh">Refetch</button>
    </div>

    <div class="container" v-if="!loading && data">
      <div class="card" v-for="item in data.results" :key="item.id.value">
        <div>
          <img :src="item.picture.thumbnail" />
        </div>
        <h4>{{ `${item.name.first} ${item.name.last}` }}</h4>
        <div>{{ item.email }}</div>
        <div>{{ item.phone }}</div>
      </div>
    </div>
    <div class="loading" v-else>Loading...</div>
  </div>
</template>

<script>
import { useConditionWatcher } from 'vue-condition-watcher'
import api from '../api'

export default {
  setup() {
    const config = {
      fetcher: api.users,
      initialData: {},
      defaultParams: {
        results: 9
      },
      conditions: {
        gender: [],
        date: '',
        offset: 0,
        limit: 9
      },
      beforeFetch(conditions) {
        return conditions
      }
    }

    return useConditionWatcher(config, {
      sync: 'router',
      ignore: ['offset', 'limit']
    })
  }
}
</script>
