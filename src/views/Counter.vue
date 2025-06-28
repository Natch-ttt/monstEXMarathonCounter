<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ item.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <div class="content-wrapper">
        <ion-grid class="metrics-grid">
          <ion-row class="metrics-row">
            <!-- size="6" で常に2列 -->
            <ion-col size="6" v-for="m in metrics" :key="m.label">
              <ion-card class="metric-card">
                <ion-card-header>
                  <ion-card-title>
                    <!-- Ionicon か MDI か切り替え -->
                    <template v-if="m.mdi">
                      <i class="material-icons metric-icon">{{ m.mdi }}</i>
                    </template>
                    <template v-else>
                      <ion-icon :icon="m.icon" class="metric-icon" />
                    </template>
                    {{ m.label }}
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <span class="metric-value">{{ m.value }}</span>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-row class="button-group">
          <ion-col>
            <ion-button shape="round" fill="outline" expand="block" @click="decrement">−</ion-button>
          </ion-col>
          <ion-col>
            <ion-button shape="round" color="primary" expand="block" @click="increment">＋</ion-button>
          </ion-col>
          <ion-col>
            <ion-button shape="round" color="tertiary" expand="block" @click="promptEncounter">遭遇</ion-button>
          </ion-col>
        </ion-row>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonIcon, IonButton, alertController
} from '@ionic/vue'
import { sparkles, trendingDown, trendingUp, close } from 'ionicons/icons'
import { useCounterStore } from '@/stores/counter'

const route = useRoute()
const id = route.params.id as string
const store = useCounterStore()

const item = computed(() => store.getItem(id)!)
if (!item.value) window.location.href = import.meta.env.BASE_URL

// metrics: 今回の周回数と累計周回数を分けて表示
const metrics = computed(() => [
  { label: '周回数',    mdi: 'directions_run',         value: `${item.value.currentRunCount}周` },
  { label: 'ラック',    icon: sparkles,                value: item.value.encounterCount },
  { label: '遭遇数',    mdi: 'flag',                   value: item.value.recordRuns.length },
  { label: '遭遇率',    mdi: 'percent',                value: `${store.encounterRate(id)}%` },
  { label: '最短周回',   icon: trendingDown,           value: `${store.fastest(id)  ?? '–'}周` },
  { label: '最長周回',   icon: trendingUp,             value: `${store.slowest(id)  ?? '–'}周` },
  { label: '平均周回', mdi: 'align_vertical_center', value: `${store.averageRun(id)}周` },
  { label: '総周回数',  mdi: 'history',                value: `${item.value.runCount}周` },
  { label: 'EX敗北数',   icon: close, value:           item.value.exDefeats }
])

function increment() { store.incrementRun(id) }
function decrement() { store.decrementRun(id) }

async function promptEncounter() {
  ;(document.activeElement as HTMLElement)?.blur()
  const alert = await alertController.create({
    header: '何体収集しましたか？',
    inputs: [{ name: 'num', type: 'number', min: '0', value: '1', attributes: { autofocus: true } }],
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '確定',
        handler: data => {
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
/* 中央寄せ＋幅制限をやや狭く */
.content-wrapper {
  max-width: 480px;
  margin: 0 auto;
}

/* カードグリッド */
.metrics-grid {
  --ion-grid-column-padding: 0.1rem;  /* 列間 */
  --ion-grid-row-padding:    0.1rem;  /* 行間 */
  margin-bottom: 0.5rem;
}

/* カードをコンパクトに */
.metric-card {
  margin: 0.2rem;
  text-align: center;
  --background: var(--ion-color-light);
  border-radius: 0.4rem;
}
/* ヘッダーとコンテンツ部分をコンパクトに */
.metric-card::part(header),
.metric-card::part(content) {
  padding-block-start: 0.2rem;   /* 上下の余白 */
  padding-block-end:   0.2rem;
  padding-inline-start:0.4rem;   /* 左右の余白 */
  padding-inline-end:  0.4rem;
}

.metric-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 0.2rem;
}

/* アイコンと数値フォントサイズを小さく */
.metric-icon {
  font-size: 1rem;
  vertical-align: middle;
  margin-right: 0.2rem;
}

/* ボタン群 */
.button-group {
  --ion-grid-column-padding: 0.3rem;
  margin-top: 1.5rem;
}
</style>
