import { createRouter, createWebHistory } from 'vue-router'
import App from 'App.vue'

export const routerHistory = createWebHistory()
export const router = createRouter({
  history: routerHistory,
  strict: true,
  routes: [
    { path: '/home', redirect: '/' },
    {
      path: '/',
      components: { default: App },
      props: to => ({ waited: to.meta.waitedFor }),
    }
  ]
})