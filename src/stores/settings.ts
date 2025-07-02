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

  temmaEX: boolean
  showMultipleCount: boolean
  showMultipleRate: boolean
  showDrop2Count: boolean
  showDrop3Count: boolean
  showDrop4Count: boolean
  showDrop5Count: boolean

  bgMultipleCount: string
  bgMultipleRate: string
  bgDrop2Count: string
  bgDrop3Count: string
  bgDrop4Count: string
  bgDrop5Count: string

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
          showDefeats: false,

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

          temmaEX: false,

          showMultipleCount: true,
          showMultipleRate: true,
          showDrop2Count: false,
          showDrop3Count: false,
          showDrop4Count: false,
          showDrop5Count: false,

          bgMultipleCount: '#f4f5f8',
          bgMultipleRate: '#f4f5f8',
          bgDrop2Count: '#f4f5f8',
          bgDrop3Count: '#f4f5f8',
          bgDrop4Count: '#f4f5f8',
          bgDrop5Count: '#f4f5f8',
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
    /**
     * 禁忌EXモードの切り替え。
     * ON にしたら天魔EX は自動で OFF。
     */
    function setTabooEX(id: string, on: boolean) {
      settingsById.value[id].tabooEX = on
      if (on) settingsById.value[id].temmaEX = false
    }

    /**
     * 天魔EXモードの切り替え。
     * ON にしたら禁忌EX は自動で OFF。
     */
    function setTemmaEX(id: string, on: boolean) {
      settingsById.value[id].temmaEX = on
      if (on) settingsById.value[id].tabooEX = false
    }

    return {
      settingsById,
      currentId,
      current,
      setCurrentId,
      updateCurrent,
      removeSettings,
      setTabooEX,
      setTemmaEX
    }
  },
  // persist オプション
  { persist: true }
)
