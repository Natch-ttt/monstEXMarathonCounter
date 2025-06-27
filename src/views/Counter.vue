<!-- src/views/Counter.vue -->
<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ item?.name || '…' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <ion-grid>
        <!-- メトリクス表示 -->
        <ion-row>
          <ion-col size="6">周回数</ion-col>
          <ion-col size="6" class="ion-text-end">{{ item.runCount }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">ラック</ion-col>
          <ion-col size="6" class="ion-text-end">{{ item.encounterCount }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">遭遇数</ion-col>
          <ion-col size="6" class="ion-text-end">{{ item.recordRuns.length }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">遭遇率</ion-col>
          <ion-col size="6" class="ion-text-end">{{ store.encounterRate(id) }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">最速記録</ion-col>
          <ion-col size="6" class="ion-text-end">{{ store.fastest(id) ?? '–' }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">最長記録</ion-col>
          <ion-col size="6" class="ion-text-end">{{ store.slowest(id) ?? '–' }}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">EX敗北数</ion-col>
          <ion-col size="6" class="ion-text-end">{{ item.exDefeats }}</ion-col>
        </ion-row>
      </ion-grid>

      <ion-row class="button-group">
        <ion-col>
          <ion-button color="medium" expand="block" @click="decrement">
            −
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="primary" expand="block" @click="increment">
            ＋
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="secondary" expand="block" @click="promptEncounter">
            遭遇
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons,
  IonBackButton, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton
} from '@ionic/vue'
import { alertController } from '@ionic/vue'
import { useCounterStore } from '@/stores/counter'

const route = useRoute()
const id = route.params.id as string
const store = useCounterStore()

// store から読み込んだアイテム
const item = ref(store.getItem(id)!)
if (!item.value) {
  // 存在しなければリダイレクト
  window.location.href = import.meta.env.BASE_URL
}

// ボタンハンドラ
function increment() {
  store.incrementRun(id)
}
function decrement() {
  store.decrementRun(id)
}

async function promptEncounter() {
  // フォーカスクリア
  (document.activeElement as HTMLElement)?.blur()

  const alert = await alertController.create({
    header: '何体収集しましたか？',
    inputs: [{ name: 'num', type: 'number', min: '0', value: '1' }],
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '確定',
        handler: (data) => {
          const n = parseInt(data.num, 10)
          store.onEncounter(id, isNaN(n) ? 0 : n)
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.button-group {
  margin-top: 2rem;
  --ion-grid-column-padding: 0.5rem;
}
</style>
