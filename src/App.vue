<!-- src/App.vue -->
<template>
  <ion-app>
    <ion-page>
      <ion-header translucent>
        <ion-toolbar>
          <ion-title>テストページ</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-button color="primary">＋ ボタン</ion-button>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/vue'
</script>

<style>
/* 追加のグローバルスタイルがあれば */
</style>
