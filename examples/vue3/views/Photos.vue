<template>
  <div class="filters">
    <button class="btn" @click="execute">Refetch</button>
  </div>

  <div class="container" v-if="!loading">
    <div class="card" v-for="item in data" :key="item.id.value">
      <div>
        <img :src="item.thumbnailUrl"/>
      </div>
      <h4>{{ item.title }}</h4>
    </div>
  </div>
  <div class="loading" v-else>Loading...</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConditionWatcher } from '../../../src/index'
// import { useConditionWatcher } from 'vue-condition-watcher'
import api from '../api'

export default defineComponent({
  setup(){
    const router = useRouter()

    const cancelTrigger = ref(false)
    
    const { 
      conditions, 
      loading, 
      data, 
      execute,
      resetConditions, 
      onConditionsChange, 
      onFetchSuccess, 
      onFetchError 
    } = useConditionWatcher(
      {
        fetcher: api.photos,
        defaultParams: {
          results: 9,
        },
        manual: false,
        immediate: true,
        conditions: {
          gender: [],
          date: '',
          offset: 0,
          limit: 9
        },
        initialData: {},
        history: {
          sync: router,
          ignore: ['limit', 'offset'],
        },
        beforeFetch
      }, 
    )

    function beforeFetch(cond, cancel) {
      if (cancelTrigger.value) {
        cancel()
        cancelTrigger.value = false
      }
      return cond
    }

    onConditionsChange((newCond, oldCond)=> {
      if (newCond.offset !== 0 && newCond.offset === oldCond.offset) {
        cancelTrigger.value = true
        conditions.offset = 0
      }
    })

    onFetchSuccess((res) => {
      console.log(res)
    })

    onFetchError((error) => {
      console.log(error)
    })

    return {
      loading,
      data,
      conditions,
      execute,
      resetConditions,
    }
  }
})
</script>
