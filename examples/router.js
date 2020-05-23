import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'

export const routerHistory = createWebHistory()
export const router = createRouter({
  history: routerHistory,
  strict: true,
  routes: [
    { path: '/home', redirect: '/' },
    {
      path: '/',
      components: { default: Home },
      props: to => ({ waited: to.meta.waitedFor }),
    }
  ]
})