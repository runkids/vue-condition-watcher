<script lang="ts" setup>
import { ref, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { ElScrollbar } from 'element-plus'
// import { useConditionWatcher } from '../../../../src/index'
import { useConditionWatcher } from 'vue-condition-watcher'
import api from '../api'

const router = useRouter()
const payload = ref('')
const fetchCounts = ref(0)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const cancelTrigger = ref(false)
const pollingInterval= ref(0)

const { 
  conditions, 
  loading, 
  data, 
  mutate,
  execute,
  resetConditions, 
  onFetchFinally,
  onConditionsChange, 
  onFetchSuccess, 
  onFetchError 
} = useConditionWatcher(
  {
    fetcher: (params) => {
      payload.value = JSON.stringify(params)
      return api.users(params)
    },
    conditions: {
      gender: ['male'],
      page: 1
    },
    defaultParams: {
      results: 100,
    },
    manual: false,
    immediate: true,
    pollingInterval: pollingInterval,
    pollingWhenHidden: true,
    pollingWhenOffline: true,
    revalidateOnFocus: true,
    initialData: [],
    cacheProvider: inject('cacheProvider'),
    // cacheProvider: function localStorageProvider() {
    //   // example by https://swr.vercel.app/docs/advanced/cache#localstorage-based-persistent-cache
    //   const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))
    //   window.addEventListener('beforeunload', () => {
    //     const appCache = JSON.stringify(Array.from(map.entries()))
    //     localStorage.setItem('app-cache', appCache)
    //   })
    //   return map
    // },
    history: {
      sync: router,
    },
    beforeFetch,
    afterFetch
  }, 
)

function beforeFetch(cond, cancel) {
  if (cancelTrigger.value) {
    cancel()
    cancelTrigger.value = false
  }
  return cond
}

function afterFetch (data) {
  return data.results
}

function updateFirstRowData () {
  const updatedData = mutate((currentData) => {
    const row = currentData[0]
    row.name.last = 'Runkids'
    return currentData
  })
  console.log(updatedData)
}

onConditionsChange((newCond, oldCond)=> {
  if (newCond.page !== 1 && newCond.page === oldCond.page) {
    cancelTrigger.value = true
    conditions.page = 1
  }
})

onFetchSuccess((res) => {
  console.log('onFetchSuccess=', res)
})

onFetchError((error) => {
  console.log('onFetchError=', error)
})

onFetchFinally(async () => {
  fetchCounts.value+=1
  await nextTick()
  scrollbarRef.value.setScrollTop(0)
})
</script>

<template>
  <el-row>
    <el-col :span="4">
      <el-checkbox-group v-model="conditions.gender" :disabled="loading" size="small">
        <el-checkbox label="male" border>
          Male
        </el-checkbox>
        <el-checkbox label="female" border>
          Female
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col :span="8">
      <el-radio-group v-model="pollingInterval" :disabled="loading" size="small">
        <el-radio :label="0" border>
          Stop Interval
        </el-radio>
        <el-radio :label="3000" border>
          Set Interval 3s
        </el-radio>
        <el-radio :label="10000" border>
          Set Interval 10s
        </el-radio>
      </el-radio-group>
    </el-col>
    <el-col :span="6">
      <el-button type="primary" @click="execute" size="small">Refresh</el-button>
      <el-button type="primary" @click="resetConditions" size="small">Reset Conditions</el-button>
      <el-button type="primary" @click="updateFirstRowData" size="small">Mutate First Row Data</el-button>
    </el-col>
  </el-row>

  <h4 style="margin: 20px 0; display: flex; justify-content: space-between;">
    <div>
      <el-alert :title="`FullPath: ${$route.fullPath}`" :closable="false"/><br/>
      <el-alert :title="`Conditions: ${JSON.stringify(conditions)}`" :closable="false"/><br/>
      <el-alert :title="`Payload: ${payload}`" :closable="false"/>
    </div>
    <div>
      <div>
        pollingWhenHidden: <span class="status">true</span>
      </div>
      <div>
        pollingWhenOffline: <span class="status">true</span>
      </div>
      <div>
        revalidateOnFocus: <span class="status">true</span>
      </div>
      <div>
        Results Size: {{ data.length }}
      </div>
      <div>
        Count of data fetching : <span style="color: #E6A23C;">{{ fetchCounts }}</span>
      </div>
    </div>
  </h4>

  <el-scrollbar max-height="60vh" ref="scrollbarRef">
    <el-table :data="data" height="60vh" style="width: 100%" v-loading="loading">
      <el-table-column label="Index" v-slot="{ $index }">
        {{ $index + 1}}
      </el-table-column>
      <el-table-column label="Photo" v-slot="{ row }">
        <el-image :src="row.picture.thumbnail" />
      </el-table-column>
      <el-table-column label="Name" v-slot="{ row }">
        {{`${row.name.first} ${row.name.last}`}}
      </el-table-column>
      <el-table-column prop="gender" label="Gender" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" label="Phone" />
    </el-table>
  </el-scrollbar>
  <div class="footer">
    <el-pagination background layout="prev, pager, next" :total="100" v-model:current-page="conditions.page"/>
  </div>
</template>