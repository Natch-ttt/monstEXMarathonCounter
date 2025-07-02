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

  zetukyuEX: boolean
  showZetuDrop3Count: boolean
  showZetuDrop4Count: boolean
  showZetuDrop5Count: boolean
  showZetuDrop3CountRate: boolean
  showZetuDrop4CountRate: boolean
  showZetuDrop5CountRate: boolean

  bgZetuDrop3Count: string
  bgZetuDrop4Count: string
  bgZetuDrop5Count: string
  bgZetuDrop3CountRate: string
  bgZetuDrop4CountRate: string
  bgZetuDrop5CountRate: string
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

          zetukyuEX: false,
          showZetuDrop3Count: false,
          showZetuDrop4Count: false,
          showZetuDrop5Count: false,
          showZetuDrop3CountRate: false,
          showZetuDrop4CountRate: false,
          showZetuDrop5CountRate: false,
          bgZetuDrop3Count: '#f4f5f8',
          bgZetuDrop4Count: '#f4f5f8',
          bgZetuDrop5Count: '#f4f5f8',
          bgZetuDrop3CountRate: '#f4f5f8',
          bgZetuDrop4CountRate: '#f4f5f8',
          bgZetuDrop5CountRate: '#f4f5f8',
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
     * ON にしたら他モード は自動で OFF。
     */
    function setTabooEX(id: string, on: boolean) {
      settingsById.value[id].tabooEX = on
      if (on) {
        settingsById.value[id].temmaEX = false
        settingsById.value[id].zetukyuEX = false
      }
    }

    /**
     * 天魔EXモードの切り替え。
     * ON にしたら他モード は自動で OFF。
     */
    function setTemmaEX(id: string, on: boolean) {
      settingsById.value[id].temmaEX = on
      if (on) {
        settingsById.value[id].tabooEX = false
        settingsById.value[id].zetukyuEX = false
      }
    }

    /**
     * 絶級EXモードの切り替え。
     * ON にしたら他モード は自動で OFF。
     */
    function setZetukyuEX(id: string, on: boolean) {
      settingsById.value[id].zetukyuEX = on
      if (on) {
        settingsById.value[id].tabooEX = false
        settingsById.value[id].temmaEX = false
      }
    }

    return {
      settingsById,
      currentId,
      current,
      setCurrentId,
      updateCurrent,
      removeSettings,
      setTabooEX,
      setTemmaEX,
      setZetukyuEX
    }
  },
  // persist オプション
  { persist: true }
)
