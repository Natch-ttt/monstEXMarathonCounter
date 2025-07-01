<template>
  <ion-app>
    <ion-menu side="end" menuId="globalMenu" contentId="main" swipeGesture>
      <EncounterLogMenu v-if="menu.activeView === 'logs'" />
      <OptionMenu      v-else />
    </ion-menu>

    <ion-router-outlet id="main"/>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp, IonMenu, IonRouterOutlet
} from '@ionic/vue'
import { useMenuStore } from '@/stores/menu'
import EncounterLogMenu from '@/components/EncounterLogMenu.vue'
import OptionMenu       from '@/components/OptionMenu.vue'

const menu = useMenuStore()

</script>

<style>
/* モバイル（600px 未満）はデフォルトのまま */
@media (min-width: 600px) {
  /* menuId="globalMenu" を持つ ion-menu の幅を拡張 */
  ion-menu[menu-id="globalMenu"] {
    --width: 400px;
  }
}
</style>