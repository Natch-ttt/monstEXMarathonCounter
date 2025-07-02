<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>設定の変更</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- <pre style="background:#f0f0f0; padding:8px; font-size:0.8em;">
      {{ JSON.stringify(store.settingsById, null, 2) }}
    </pre> -->
    <!-- モード設定 -->
    <ion-list v-if="settings">
      <ion-list-header>モード設定</ion-list-header>
      <ion-item>
        <ion-label>禁忌EXモード</ion-label>
        <SwitchToggle v-model="tabooEX" />
      </ion-item>
      <ion-item>
        <ion-label>天魔EXモード</ion-label>
        <SwitchToggle v-model="temmaEX" />
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

    <!-- 禁忌EX追加設定 -->
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

    <!-- 天魔EX追加設定 -->
    <ion-list v-if="settings && settings.temmaEX">
      <!-- <ion-list-header>EX追加表示</ion-list-header> -->
      <ion-item
        v-for="m in temmaMeta"
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
import { useMenuStore } from '@/stores/menu'
import SwitchToggle       from '@/components/SwitchToggle.vue'

// ストア & ルート取得
const menu = useMenuStore()
const store = useSettingsStore()
const route = useRoute()
const settings = computed(() => store.current)
const id = route.params.id as string

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

// v-model 用 computed をアクションへバインド
const tabooEX = computed({
  get: () => settings.value.tabooEX,
  set: (v: boolean) => store.setTabooEX(id, v)
})

const temmaEX = computed({
  get: () => settings.value.temmaEX,
  set: (v: boolean) => store.setTemmaEX(id, v)
})

// raw 定義：ラベルとストアのキー
type MetaRaw = {
  label: string
  key: keyof typeof settings.value
  bgKey: keyof typeof settings.value
}

const rawMetrics = [
  { label: '周回数',       key: 'showRuns',       bgKey: 'bgRuns'       },
  { label: 'ラック',       key: 'showLuck',       bgKey: 'bgLuck'       },
  { label: '遭遇数',       key: 'showEncounters', bgKey: 'bgEncounters' },
  { label: '遭遇率',       key: 'showRate',       bgKey: 'bgRate'       },
  { label: '最短周回数',     key: 'showFastest',    bgKey: 'bgFastest'    },
  { label: '最長周回数',     key: 'showSlowest',    bgKey: 'bgSlowest'    },
  { label: '平均周回数',     key: 'showAverage',    bgKey: 'bgAverage'    },
  { label: '総周回数',     key: 'showTotal',      bgKey: 'bgTotal'      },
  { label: 'EX敗北数',     key: 'showDefeats',    bgKey: 'bgDefeats'    },
] as const satisfies readonly MetaRaw[]

const rawTaboo = [
  { label: '至宝発動数',    key: 'showTreasureCount', bgKey: 'bgTreasureCount' },
  { label: '至宝発動率',    key: 'showTreasureRate',  bgKey: 'bgTreasureRate'  },
  { label: 'ラキリザ数',    key: 'showLuckyRizaCount', bgKey: 'bgLuckyRizaCount' },
  { label: 'ラキリザ発生率', key: 'showLuckyRizaRate',  bgKey: 'bgLuckyRizaRate'  },
] as const satisfies readonly MetaRaw[]

const rawTemma = [
  { label: '複数ドロ発生数', key: 'showMultipleCount', bgKey: 'bgMultipleCount' },
  { label: '複数ドロ発生率', key: 'showMultipleRate',  bgKey: 'bgMultipleRate' },
  { label: '2体ドロ発生数',  key: 'showDrop2Count',    bgKey: 'bgDrop2Count'  },
  { label: '3体ドロ発生数',  key: 'showDrop3Count',    bgKey: 'bgDrop3Count'  },
  { label: '4体ドロ発生数',  key: 'showDrop4Count',    bgKey: 'bgDrop4Count'  },
  { label: '5体ドロ発生数',  key: 'showDrop5Count',    bgKey: 'bgDrop5Count'  },
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

const temmaMeta = rawTemma.map(m => ({
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
.ion-padding ion-list-header {
  margin-left: 0.2rem;
}

</style>
