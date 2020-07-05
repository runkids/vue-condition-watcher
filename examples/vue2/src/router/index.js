import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/infinite',
    name: 'InfiniteScrolling',
    component: () => import('../views/InfiniteScrolling.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
