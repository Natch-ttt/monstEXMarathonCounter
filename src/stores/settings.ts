// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'

export interface Settings {
  showRuns: boolean
  showLuck: boolean
  showEncounters: boolean
  showRate: boolean
  showFastest: boolean
  showSlowest: boolean
  showAverage: boolean
  showTotal: boolean
  showDefeats: boolean

  bgRuns: string
  bgLuck: string
  bgEncounters: string
  bgRate: string
  bgFastest: string
  bgSlowest: string
  bgAverage: string
  bgTotal: string
  bgDefeats: string

  tabooEX: boolean
  showTreasureCount: boolean
  showTreasureRate: boolean
  showLuckyRizaCount: boolean
  showLuckyRizaRate: boolean

  bgTreasureCount: string
  bgTreasureRate: string
  bgLuckyRizaCount: string
  bgLuckyRizaRate: string
}

export const useSettingsStore = defineStore(
  'settings',
  // ──────────────────────────────── setup ストア本体
  () => {
    // state
    const settingsById = ref<Record<string, Settings>>({})
    const currentId    = ref<string>('')

    // getter current
    const current = computed<Settings>(() => {
      if (!settingsById.value[currentId.value] && currentId.value != '') {
        // 初期値をここで設定
        settingsById.value[currentId.value] = {
          showRuns: true,
          showLuck: true,
          showEncounters: true,
          showRate: true,
          showFastest: true,
          showSlowest: true,
          showAverage: true,
          showTotal: true,
          showDefeats: true,

          bgRuns: '#f4f5f8',
          bgLuck: '#f4f5f8',
          bgEncounters: '#f4f5f8',
          bgRate: '#f4f5f8',
          bgFastest: '#f4f5f8',
          bgSlowest: '#f4f5f8',
          bgAverage: '#f4f5f8',
          bgTotal: '#f4f5f8',
          bgDefeats: '#f4f5f8',

          tabooEX: false,

          showTreasureCount: true,
          showTreasureRate: true,
          showLuckyRizaCount: true,
          showLuckyRizaRate: true,

          bgTreasureCount: '#f4f5f8',
          bgTreasureRate: '#f4f5f8',
          bgLuckyRizaCount: '#f4f5f8',
          bgLuckyRizaRate: '#f4f5f8',
        }
      }
      return settingsById.value[currentId.value]
    })

    // actions
    function setCurrentId(id: string) {
      currentId.value = id
    }
    function updateCurrent<K extends keyof Settings>(
      key: K,
      val: Settings[K]
    ) {
      // @ts-ignore: current.value は必ず存在する
      current.value[key] = val
    }
    //削除用アクション
    function removeSettings(id: string) {
      // レコードからキーを削除
      delete settingsById.value[id]
      // 削除したIDが currentId なら default に戻す
      if (currentId.value === id) {
        currentId.value = ''
      }
    }
    return {
      settingsById,
      currentId,
      current,
      setCurrentId,
      updateCurrent,
      removeSettings
    }
  },
  // persist オプション
  { persist: true }
)
