import { createRouter, createWebHistory, createWebHashHistory  } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage    from '@/views/HomePage.vue'
import CounterPage from '@/views/CounterPage.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/home' },
  { path: '/home',    name: 'Home',    component: HomePage },
  { path: '/counter/:id', name: 'Counter', component: CounterPage, props: true },
]

export const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),   // ← Hash モードに
  routes
})

export default router
