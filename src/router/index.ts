import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes: RouteRecordRaw[] = [
  { path: '/',      name: 'Home',  component: Home  },
  { path: '/about', name: 'About', component: About }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
