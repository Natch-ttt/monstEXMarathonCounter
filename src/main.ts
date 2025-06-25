import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

// これを追加
import { defineCustomElements } from '@ionic/core/loader'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

// Creates a Pinia instance
import { createPinia } from 'pinia'
import { piniaPersistPlugin } from '@/plugins/piniaPersist'

const pinia = createPinia()
pinia.use(piniaPersistPlugin)

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);

defineCustomElements(window, {
  resourcesUrl: import.meta.env.BASE_URL + 'assets/ionic/'
})

router.isReady().then(() => {
  app.mount('#app');
});
