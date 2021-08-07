import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { router } from './router'

createApp(App).provide('router', router).use(router).mount('#app')
