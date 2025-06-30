<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>オプション設定</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list>
      <!-- メトリクス表示切替 -->
      <ion-item v-for="m in metricsMeta" :key="m.showKey">
      <ion-label>{{ m.label }}</ion-label>
      <!-- flagModels[m.showKey] は LHS として使える -->
      <ion-toggle v-model="flagModels[m.showKey]" />
      </ion-item>

      <!-- 背景色ピッカー -->
      <ion-item v-for="m in metricsMeta" :key="m.bgKey">
      <ion-label>{{ m.label }} 背景色</ion-label>
      <input type="color" v-model="bgModels[m.bgKey]" />
      </ion-item>

      <!-- 禁忌EXモード -->
      <ion-item>
        <ion-label>禁忌EXモード</ion-label>
        <ion-toggle v-model="settings.tabooEX" />
      </ion-item>

      <!-- 禁忌EX追加設定 -->
      <ion-item
        v-for="m in tabooMeta"
        :key="m.key"
        v-if="settings.tabooEX"
      >
        <ion-label>{{ m.label }}</ion-label>
        <ion-toggle
          :label="m.label"
          v-model="flagModels[m.showKey]"
        />
      </ion-item>
      <ion-item
        v-for="m in tabooMeta"
        :key="m.key+'Bg'"
        v-if="settings.tabooEX"
      >
        <ion-label>{{ m.label }} 背景色</ion-label>
        <input
          type="color"
          v-model="bgModels[m.bgKey]"
        />
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { menuController } from '@ionic/vue'
import { useSettingsStore } from '@/stores/settings'

// store の ref 化
const settings = useSettingsStore()
const refs = storeToRefs(settings) as any

// 基本メトリクスに対応する設定キー群
const metricsMeta = [
  { key:'runs',      label:'周回数',         showKey:'showRuns',      bgKey:'bgRuns' },
  { key:'encounters',label:'遭遇数',         showKey:'showEncounters',bgKey:'bgEncounters' },
  { key:'rate',      label:'遭遇率',         showKey:'showRate',      bgKey:'bgRate' },
  { key:'fastest',   label:'最短周回',       showKey:'showFastest',   bgKey:'bgFastest' },
  { key:'slowest',   label:'最長周回',       showKey:'showSlowest',   bgKey:'bgSlowest' },
  { key:'average',   label:'平均周回',       showKey:'showAverage',   bgKey:'bgAverage' },
  { key:'totalRuns', label:'総周回数',       showKey:'showTotal',     bgKey:'bgTotal' },
  { key:'defeats',   label:'EX敗北数',       showKey:'showDefeats',   bgKey:'bgDefeats' },
]

// 禁忌EX用メトリクス
const tabooMeta = [
  { key:'treasureCount', label:'至宝発動数',   showKey:'showTreasureCount', bgKey:'bgTreasureCount' },
  { key:'treasureRate',  label:'至宝発動率',   showKey:'showTreasureRate',  bgKey:'bgTreasureRate' },
  { key:'luckyRizaCount',label:'ラキリザ数',   showKey:'showLuckyRizaCount',bgKey:'bgLuckyRizaCount' },
  { key:'luckyRizaRate', label:'ラキリザ発生率',showKey:'showLuckyRizaRate', bgKey:'bgLuckyRizaRate' },
]

// Models を reactive で生成
const flagModels = reactive(
  Object.fromEntries(
    metricsMeta.map(m => [ 
      m.showKey, 
      // storeToRefs で得た refs[showKey] をそのまま使う (as any でキャスト OK)
      (refs[m.showKey] as unknown as { value: boolean })
    ])
  ) as Record<typeof metricsMeta[number]['showKey'], { value: boolean }>
)

const bgModels = reactive(
  Object.fromEntries(
    metricsMeta.map(m => [ 
      m.bgKey, 
      (refs[m.bgKey] as unknown as { value: string })
    ])
  ) as Record<typeof metricsMeta[number]['bgKey'], { value: string }>
)

</script>
