import { createRouter, createWebHistory, createWebHashHistory  } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  }
]

export const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),   // ← Hash モードに
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'Home', component: HomePage }
  ]
})

export default router
