import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'
import { router } from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).use(ElementPlus).use(router).mount('#app')
