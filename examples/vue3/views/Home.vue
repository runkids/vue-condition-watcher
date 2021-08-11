<template>
  <div>
    <div class="filters">
      <input type="checkbox" id="male" value="male" v-model="conditions.gender">
      <label for="male">Male</label>
      <input type="checkbox" id="female" value="female" v-model="conditions.gender">
      <label for="female">Female</label>
      <input class="date-picker" type="date" v-model="conditions.date">
      <button class="btn" @click="refresh">Refresh</button>
    </div>

    <div class="container" v-if="!loading">
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
  </div>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import { useConditionWatcher } from '../../../src/index'
// import { useConditionWatcher } from 'vue-condition-watcher'
import api from '../api'

export default defineComponent({
  setup(){

    const { conditions, loading, data, refresh } = useConditionWatcher(
      {
        fetcher: api.users,
        defaultParams: {
          results: 9,
        },
        conditions: {
          gender: [],
          date: '',
          offset: 0,
          limit: 9
        },
        beforeFetch(conditions){
          console.log(conditions)
          return conditions
        }
      }, 
      { 
        sync: 'router', 
        ignore: ['offset', 'limit'], 
        navigation: 'replace' 
      }
    )

    return {
      loading,
      data,
      refresh,
      conditions
    }
  }
})
</script>
