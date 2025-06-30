import { defineStore } from 'pinia'

export interface SettingsState {
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

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 基本 metrics の表示フラグ
    showRuns:      true,
    showLuck:      true,
    showEncounters:true,
    showRate:      true,
    showFastest:   true,
    showSlowest:   true,
    showAverage:   true,
    showTotal:     true,
    showDefeats:   true,

    // 背景色（CSS カラー文字列）
    bgRuns:      '#f4f5f8',
    bgLuck:      '#f4f5f8',
    bgEncounters:'#f4f5f8',
    bgRate:      '#f4f5f8',
    bgFastest:   '#f4f5f8',
    bgSlowest:   '#f4f5f8',
    bgAverage:   '#f4f5f8',
    bgTotal:     '#f4f5f8',
    bgDefeats:   '#f4f5f8',

    // 禁忌EXモード
    tabooEX: false,

    // 禁忌EX用 metrics
    showTreasureCount:  true,
    showTreasureRate:   true,
    showLuckyRizaCount: true,
    showLuckyRizaRate:  true,
    bgTreasureCount:    '#f4f5f8',
    bgTreasureRate:     '#f4f5f8',
    bgLuckyRizaCount:   '#f4f5f8',
    bgLuckyRizaRate:    '#f4f5f8',
  }),
})
