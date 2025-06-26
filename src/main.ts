// src/main.ts
import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'
import { IonicVue }  from '@ionic/vue'

/* Ionic 必須 CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/display.css'
import './theme/variables.css'

// Creates a Pinia instance
import { createPinia } from 'pinia'
import { piniaPersistPlugin } from '@/plugins/piniaPersist'

const pinia = createPinia()
pinia.use(piniaPersistPlugin)

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
})
