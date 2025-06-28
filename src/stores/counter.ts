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
    item.currentRunCount = 0
  }

  // 期間フィルタヘルパ
  function filterTs<T extends { timestamp: number }>(ar: T[], period: Period): T[] {
    const now = new Date()
    return ar.filter(x => {
      const d = new Date(x.timestamp)
      if (period === 'all') return true
      if (period === 'month') {
        return d.getFullYear() === now.getFullYear()
            && d.getMonth()    === now.getMonth()
      }
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
  ) {
    const item = getItem(id)!
    const now = new Date()

    // 共通フィルタ関数
    const filtered = (ts: number) => {
      const d = new Date(ts)
      // dateKey が渡されていればそれを優先
      if (dateKey) {
        if (period === 'month') {
          return d.toISOString().slice(0, 7) === dateKey
        }
        if (period === 'day') {
          return d.toISOString().slice(0, 10) === dateKey
        }
      }
      // dateKey がない場合は all/month/day の切り分け
      if (period === 'all')   return true
      if (period === 'month') return d.getFullYear() === now.getFullYear()
                                && d.getMonth() === now.getMonth()
      // day
      return d.getFullYear() === now.getFullYear()
          && d.getMonth()    === now.getMonth()
          && d.getDate()     === now.getDate()
    }

    // runLogs は timestamp の配列
    const runs = item.runLogs.filter(filtered).length

    // encounterLogs: { count, timestamp }[]
    const encLogs = item.encounterLogs.filter(e => filtered(e.timestamp))
    const encounters = encLogs.filter(e => e.count > 0).reduce((sum, e) => sum + e.count, 0)
    const defeats    = encLogs.filter(e => e.count <= 0).length

    // recordSuccess: { runs, timestamp }[]
    const succLogs = item.recordSuccess.filter(s => filtered(s.timestamp))
    const fastest = succLogs.length ? Math.min(...succLogs.map(s => s.runs)) : null
    const slowest = succLogs.length ? Math.max(...succLogs.map(s => s.runs)) : null
    const average = succLogs.length
      ? succLogs.reduce((sum, s) => sum + s.runs, 0) / succLogs.length
      : null

    // 最終更新時刻はすべてのログから最大 ts を取得
    const allTs = [
      ...item.runLogs,
      ...item.encounterLogs.map(e => e.timestamp),
      ...item.recordSuccess.map(s => s.timestamp)
    ]
    const lastTs = allTs.length ? Math.max(...allTs) : Date.now()

    return {
      runs,
      totalRuns: item.runCount,
      encounters,
      encounterRate: runs ? (encounters / runs) * 100 : 0,
      fastest,
      slowest,
      average,
      defeats,
      lastTs
    }
  }

  return {
    counters, add, remove: (id: string) => counters.value = counters.value.filter(c => c.id !== id),
    incrementRun, decrementRun, onEncounter,
    getItem,
    periodMetrics
  }
})
