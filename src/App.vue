<!-- src/App.vue -->
<template>
  <ion-app>
    <!-- Vue Router と連携済みの Ionic Outlet -->
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
</script>

<style>
/* 必要ならグローバルスタイル */
</style>
