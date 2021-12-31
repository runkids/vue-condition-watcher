<template>
  <div class="center">
    <div class="content" :infinite-scroll-disabled="loading" v-infinite-scroll="loadMore">
      <div class="box" v-for="i in items" :key="i.color + i.id" :style="{ backgroundColor: i.color }">
        {{ i.id }}
      </div>
    </div>
    <div id="loader" class="active" v-if="loading">
      LOADING...
    </div>
    <div class="fixed" v-if="items">Counter: {{ items.length }}</div>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { useConditionWatcher } from 'vue-condition-watcher'
import infiniteScroll from 'vue-infinite-scroll'
import api from '../api'

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
        if (!data) return []
        items.value = items.value.concat(data)
        return data
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
</script>

<style scoped>
.content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.box {
  margin: 20px;
  width: calc(100% / 3);
  height: 200px;
  color: white;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  line-height: 200px;
}
.fixed {
  position: fixed;
  left: 0;
  top: 0;
  font-size: 20px;
}
.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
