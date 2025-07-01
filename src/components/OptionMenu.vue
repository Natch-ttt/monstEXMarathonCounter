<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>設定の変更</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <pre style="background:#f0f0f0; padding:8px; font-size:0.8em;">
      {{ JSON.stringify(store.settingsById, null, 2) }}
    </pre>
    <!-- モード設定 -->
    <ion-list v-if="settings">
      <ion-list-header>モード設定</ion-list-header>
      <ion-item>
        <ion-label>禁忌EXモード</ion-label>
        <SwitchToggle v-model="settings.tabooEX" />
      </ion-item>
    </ion-list>

    <!-- 表示設定 -->
    <ion-list v-if="settings">
      <ion-list-header>表示設定</ion-list-header>
      <ion-item
        v-for="m in metricsMeta"
        :key="m.label"
        class="display-item"
      >
        <ion-label class="item-label">{{ m.label }}</ion-label>
        <input
          type="color"
          v-model="m.bgRef.value"
          class="color-picker"
        />
        <SwitchToggle v-model="m.showRef.value" />
      </ion-item>
    </ion-list>

    <!-- EX追加設定 -->
    <ion-list v-if="settings && settings.tabooEX">
      <!-- <ion-list-header>EX追加表示</ion-list-header> -->
      <ion-item
        v-for="m in tabooMeta"
        :key="m.label"
        class="display-item"
      >
        <ion-label class="item-label">{{ m.label }}</ion-label>
        <input
          type="color"
          v-model="m.bgRef.value"
          class="color-picker"
        />
        <SwitchToggle v-model="m.showRef.value" />
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useRoute }       from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import SwitchToggle       from '@/components/SwitchToggle.vue'

// ストア & ルート取得
const store = useSettingsStore()
const route = useRoute()
const settings = computed(() => store.current)

// ルートの :id が変わったら currentId を更新
watch(
  () => route.params.id,
  id => {
    if (typeof id === 'string') {
      store.setCurrentId(id)
    }
  },
  { immediate: true }
)

// raw 定義：ラベルとストアのキー
type MetaRaw = {
  label: string
  key: keyof typeof settings.value
  bgKey: keyof typeof settings.value
}

const rawMetrics = [
  { label: '周回数',       key: 'showRuns',       bgKey: 'bgRuns'       },
  { label: '遭遇数',       key: 'showEncounters', bgKey: 'bgEncounters' },
  { label: '遭遇率',       key: 'showRate',       bgKey: 'bgRate'       },
  { label: '最短周回',     key: 'showFastest',    bgKey: 'bgFastest'    },
  { label: '最長周回',     key: 'showSlowest',    bgKey: 'bgSlowest'    },
  { label: '平均周回',     key: 'showAverage',    bgKey: 'bgAverage'    },
  { label: '総周回数',     key: 'showTotal',      bgKey: 'bgTotal'      },
  { label: 'EX敗北数',     key: 'showDefeats',    bgKey: 'bgDefeats'    },
] as const satisfies readonly MetaRaw[]

const rawTaboo = [
  { label: '至宝発動数',    key: 'showTreasureCount', bgKey: 'bgTreasureCount' },
  { label: '至宝発動率',    key: 'showTreasureRate',  bgKey: 'bgTreasureRate'  },
  { label: 'ラキリザ数',    key: 'showLuckyRizaCount', bgKey: 'bgLuckyRizaCount' },
  { label: 'ラキリザ発生率', key: 'showLuckyRizaRate',  bgKey: 'bgLuckyRizaRate'  },
] as const satisfies readonly MetaRaw[]

// 双方向に書き込める Ref を作成
const metricsMeta = rawMetrics.map(m => ({
  label: m.label,
  showRef: computed<boolean>({
    get: () => settings.value[m.key],
    set: v => store.updateCurrent(m.key, v)
  }),
  bgRef: computed<string>({
    get: () => settings.value[m.bgKey],
    set: v => store.updateCurrent(m.bgKey, v)
  })
}))

const tabooMeta = rawTaboo.map(m => ({
  label: m.label,
  showRef: computed<boolean>({
    get: () => settings.value[m.key],
    set: v => store.updateCurrent(m.key, v)
  }),
  bgRef: computed<string>({
    get: () => settings.value[m.bgKey],
    set: v => store.updateCurrent(m.bgKey, v)
  })
}))

// デバッグ用：settingsById 全体を文字列化して表示
const debugSettings = computed(() =>
  JSON.stringify(store.settingsById, null, 2)
)
</script>

<style scoped>
.display-item {
  display: flex;
  align-items: center;
  --inner-padding-start: 0;
  --inner-padding-end: 0;
}
.item-label {
  flex: 1;
  white-space: nowrap;
  font-weight: 500;
}
.color-picker {
  width: 1.8rem;
  height: 1.8rem;
  margin: 0 1rem;
  padding: 0;
  border: none;
  background: none;
}
</style>
