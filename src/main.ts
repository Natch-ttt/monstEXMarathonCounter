// src/main.ts
import { createApp }   from 'vue'
import App             from './App.vue'
import { IonicVue }    from '@ionic/vue'

// Ionic CSS
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/display.css'
import './theme/variables.css'

createApp(App)
  .use(IonicVue)
  .mount('#app')
