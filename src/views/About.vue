<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>About</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <p>This is the about page.</p>
      <ion-button router-link="/" router-direction="back">
        ← Back
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
