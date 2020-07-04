<template>
  <div>
    <div class="filters">
      <input
        type="checkbox"
        id="male"
        value="male"
        v-model="conditions.gender"
      />
      <label for="male">Male</label>
      <input
        type="checkbox"
        id="female"
        value="female"
        v-model="conditions.gender"
      />
      <label for="female">Female</label>
      <input class="date-picker" type="date" v-model="conditions.date" />
      <button class="btn" @click="refresh">Refresh</button>
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
import { useConditionWatcher } from "vue-condition-watcher";
import { provide } from "@vue/composition-api";
import router from "@/router";
import api from "../api";

export default {
  setup() {
    provide("router", router);
    const config = {
      fetcher: api.users,
      defaultParams: {
        results: 9
      },
      conditions: {
        gender: [],
        date: "",
        offset: 0,
        limit: 9
      },
      beforeFetch(conditions) {
        console.log(conditions)
        return conditions;
      }
    };

    return useConditionWatcher(config, {
      sync: "router",
      ignore: ["offset", "limit"]
    });
  }
};
</script>
