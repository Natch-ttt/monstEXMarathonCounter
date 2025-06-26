import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/HomePage.vue'

const routes: RouteRecordRaw[] = [
  // ルートパスだけ一つ。Home.vue に直接遷移する
  { path: '/', name: 'Home', component: Home },
]

export const router = createRouter({
  // import.meta.env.BASE_URL は vite.config.ts の base を参照
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
