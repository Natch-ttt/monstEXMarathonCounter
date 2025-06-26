<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>【モンスト】周回カウンター</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/about">
            <ion-icon :icon="addOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button router-link="/about" router-direction="forward">
        Go to About
      </ion-button>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonIcon,
  IonTitle, IonContent, IonButton, IonButtons,
  onIonViewWillLeave
} from '@ionic/vue'
import { addOutline, trashOutline } from 'ionicons/icons'

onIonViewWillLeave(() => {
  // フォーカス中の要素があれば外す
  (document.activeElement as HTMLElement)?.blur()
})
</script>
