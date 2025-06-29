// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface RecordSuccess {
  runs: number       // 当時の currentRunCount
  timestamp: number  // ミリ秒
}
export interface EncounterLog {
  count: number      // 取得数（0 は敗北）
  timestamp: number
}

export interface CounterItem {
  id: string
  name: string

  // 累計／今回分
  runCount: number
  currentRunCount: number

  // 累計取得数／取得ログ
  encounterCount: number
  encounterLogs: EncounterLog[]

  // 成功周回ログ
  recordSuccess: RecordSuccess[]

  // 敗北数（全期間）※期間集計は encounterLogs からフィルタ
  exDefeats: number

  // 周回ログ
  runLogs: number[]
}

// カウンター用の集計結果型
export interface PeriodMetrics {
  runs: number;
  totalRuns: number;
  encounters: number;
  encounterRate: number;
  fastest: number | null;
  slowest: number | null;
  average: number | null;
  defeats: number;
  lastTs: number;
}

const STORAGE_KEY = 'monst-counters'

export const useCounterStore = defineStore('counter', () => {
  const counters = ref<CounterItem[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )

  // persistence
  watch(
    counters,
    (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  )

  function add(name: string) {
    counters.value.push({
      id: Date.now().toString(),
      name,
      runCount: 0,
      currentRunCount: 0,
      encounterCount: 0,
      encounterLogs: [],
      recordSuccess: [],
      exDefeats: 0,
      runLogs: []
    })
  }

  function getItem(id: string) {
    return counters.value.find(c => c.id === id)
  }

  function incrementRun(id: string) {
    const item = getItem(id)!
    item.runCount++
    item.currentRunCount++
    item.runLogs.push(Date.now())
  }
  function decrementRun(id: string) {
    const item = getItem(id)!
    if (item.runCount > 0) {
      // 累計・今回分をデクリメント
      item.runCount--
      if (item.currentRunCount > 0) {
        item.currentRunCount--
      }
      // ログも一件消す
      if (item.runLogs.length) {
        item.runLogs.pop()
      }
    }
  }

  // 指定アイテムの全データを初期化する
  function resetAll(id: string) {
    const item = getItem(id)!
    // 周回関連
    item.runCount         = 0
    item.currentRunCount  = 0
    item.runLogs          = []
    // 遭遇・ラック関連
    item.encounterCount   = 0
    item.encounterLogs    = []
    item.recordSuccess    = []
    item.exDefeats        = 0
  }

  function onEncounter(id: string, num: number) {
    const item = getItem(id)!
    const ts = Date.now()
    item.encounterLogs.push({ count: num, timestamp: ts })
    if (num <= 0) {
      item.exDefeats++
    } else {
      item.encounterCount += num
      item.recordSuccess.push({
        runs: item.currentRunCount,
        timestamp: ts
      })
    }
    // 今回分カウンタをリセット
    item.currentRunCount = 0

    // 月別／日別のフィルタ元となるログもクリア
    item.runLogs = []
  }

  // 期間フィルタヘルパ
  function filterTs<T extends { timestamp: number }>(
    ar: T[],
    period: Period,
    dateKey?: string
  ): T[] {
    const now = new Date()
    return ar.filter(x => {
      const d = new Date(x.timestamp)
      // dateKey 優先
      if (dateKey) {
        if (period === 'month') return d.toISOString().slice(0,7) === dateKey
        if (period === 'day')   return d.toISOString().slice(0,10) === dateKey
      }
      // dateKey がないなら all/month/day
      if (period === 'all')   return true
      if (period === 'month')
        return d.getFullYear() === now.getFullYear()
            && d.getMonth()    === now.getMonth()
      // day
      return d.getFullYear() === now.getFullYear()
          && d.getMonth()    === now.getMonth()
          && d.getDate()     === now.getDate()
    })
  }

  type Period = 'all' | 'month' | 'day'

  // 期間ごとの集計
  function periodMetrics(
    id: string,
    period: Period,
    dateKey?: string
  ): PeriodMetrics {
    const item = getItem(id)!

    // 今サイクルの runLogs をオブジェクト化
    const runEntries = item.runLogs.map(ts => ({ timestamp: ts }))

    // 期間フィルタ
    const filteredRuns = filterTs(runEntries,        period, dateKey)
    const filteredSucc = filterTs(item.recordSuccess, period, dateKey)

    // encounters／defeats フィルタ
    const encLogs    = filterTs(item.encounterLogs,      period, dateKey)
    const encounters = encLogs.filter(e => e.count > 0).length
    const defeats    = encLogs.filter(e => e.count <= 0).length

    // fastest/slowest/average は recordSuccess から
    const fastest = filteredSucc.length ? Math.min(...filteredSucc.map(s => s.runs)) : null
    const slowest = filteredSucc.length ? Math.max(...filteredSucc.map(s => s.runs)) : null
    const average = filteredSucc.length
      ? filteredSucc.reduce((s, r) => s + r.runs, 0) / filteredSucc.length
      : null

    // runs は「今サイクルの進行分」
    const runs = filteredRuns.length

    // totalRuns は period によって切り分け
    let totalRuns: number
    if (period === 'all') {
      // 全期間ならアイテムの累計値
      totalRuns = item.runCount
    } else {
      // 月別/日別なら「完了サイクルの合計 + 今動いているサイクル分」
      const sumSuccRuns = filteredSucc.reduce((s, r) => s + r.runs, 0)
      totalRuns = sumSuccRuns + runs
    }

    // 遭遇率
    const encounterRate = totalRuns ? (encounters / totalRuns) * 100 : 0

    // 最終更新時刻はすべてのログから最大 ts を取得
    const allTs = [
      ...item.runLogs,
      ...item.encounterLogs.map(e => e.timestamp),
      ...item.recordSuccess.map(s => s.timestamp)
    ]
    const lastTs = allTs.length ? Math.max(...allTs) : Date.now()

    return {
      runs,
      totalRuns,
      encounters,
      encounterRate,
      fastest,
      slowest,
      average,
      defeats,
      lastTs
    }
  }

  return {
    counters, add, remove: (id: string) => counters.value = counters.value.filter(c => c.id !== id),
    incrementRun, decrementRun, resetAll, onEncounter,
    getItem,
    periodMetrics,
    filterTs
  }
})
