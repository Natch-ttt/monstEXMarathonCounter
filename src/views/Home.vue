<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Home</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-button router-link="/about" router-direction="forward">
        Go to About
      </ion-button>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar,
  IonTitle, IonContent, IonButton,
  onIonViewWillLeave
} from '@ionic/vue'

onIonViewWillLeave(() => {
  // フォーカス中の要素があれば外す
  (document.activeElement as HTMLElement)?.blur()
})
</script>
