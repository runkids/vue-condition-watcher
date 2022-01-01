<template>
  <div class="filters">
    <input type="checkbox" id="male" value="male" v-model="conditions.gender" :disabled="loading">
    <label for="male">Male</label>
    <input type="checkbox" id="female" value="female" v-model="conditions.gender" :disabled="loading">
    <label for="female">Female</label>
    <input class="date-picker" type="date" v-model="conditions.date" :disabled="loading">
    <button class="btn" @click="execute">Refetch</button>
    <button class="btn" @click="resetConditions">Reset</button>
    <button class="btn" @click="conditions.offset += conditions.limit">Add Offset</button>
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useConditionWatcher } from '../../../src/index'
// import { useConditionWatcher } from 'vue-condition-watcher'
import api from '../api'

export default defineComponent({
  setup(){
    const cancelTrigger = ref(false)
    const { conditions, loading, data, execute, resetConditions, onConditionsChange } = useConditionWatcher(
      {
        fetcher: api.users,
        conditions: {
          gender: [],
          date: '',
          offset: 0,
          limit: 9
        },
        initialData: {},
        immediate: false,
        defaultParams: {
          results: 9,
        },
        beforeFetch(cond, cancel) {
          if (cancelTrigger.value) {
            cancel()
            cancelTrigger.value = false
          }
          return cond
        }
      }, 
      { 
        sync: 'router', 
        ignore: ['offset', 'limit'], 
        navigation: 'replace' 
      }
    )

    onConditionsChange(([newConditions, oldConditions])=> {
      if (newConditions.offset !== 0 && newConditions.offset === oldConditions.offset) {
        cancelTrigger.value = true
        conditions.offset = 0
      }
    })

    return {
      loading,
      data,
      conditions,
      execute,
      resetConditions
    }
  }
})
</script>
